const dotenv = require('dotenv');
const { app: electron, BrowserWindow, Menu, shell, remote, protocol, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const request = require('request');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
require('electron-react-devtools');

let envPath;
if (process.env.APP_ENV === 'browser') {
  envPath = path.normalize(remote.app.getAppPath());
} else {
  envPath = path.join(__dirname);
}
dotenv.config({ path: `${envPath}/.env` });

const Configs = require('./src/utils/Configs');
const Slack = require('./src/utils/Slack');

const {
  MENU_TEMPLATE,
  PRODUCT_NAME,
  PRODUCT_URL
} = require('./src/utils/Constants');

let win

const startExpress = () => {
  app.use(express.static(__dirname + '/bundles'));
  app.use(express.static(__dirname + '/views'));
  app.use(express.static(__dirname + '/assets'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(session({
  	secret: 'db69c11d-9ee1-4f22-b27c-e75b2e952f01',
  	saveUninitialized: true,
  	resave: true
  }));
  app.get('/auth', (req, res) => {
    Slack.checkToken(true)
    .then(tokenSet => {
      if (tokenSet) {
        res.sendFile(path.join(__dirname, '/views/already_authorised.html'));
      } else {
        var options = {
          uri: 'https://slack.com/api/oauth.access?code='
          +req.query.code+
          '&client_id='+process.env.CLIENT_ID+
          '&client_secret='+process.env.CLIENT_SECRET+
          '&redirect_uri=http://localhost:5000/auth',
          method: 'GET'
        };
        request(options, (error, response, body) => {
          var JSONresponse = JSON.parse(body);
          if (!JSONresponse.ok){
            res.send("Error encountered: \n"
            + JSON.stringify(JSONresponse) + "\n"
            + "Process.env:\n"
            + "<pre>" + JSON.stringify(process.env)+"</pre>"
            ).status(200).end();
          }
          else{
            const config = Object.assign({},
              Configs.load(),
              {token: JSONresponse.access_token}
            );
            Configs.save(config);
            res.sendFile(path.join(__dirname, '/views/authorised.html'));
          }
        });
      }
    });
  });

  io.on('connection', client => {
    autoUpdater.checkForUpdates();

    client
      .on('authorised', data => {
        io.emit('authorised', data);
      })
  });

  server.listen(5000, 'localhost');
}

const createWindow = () => {
  if (process.platform === 'darwin') {
    MENU_TEMPLATE.unshift({
      label: PRODUCT_NAME,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Check for updates',
          click() { autoUpdater.checkForUpdates() }
        },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }
  const submenu = [];
  if (process.platform !== 'darwin') {
    submenu.push({
      label: 'Check for updates',
      click() { autoUpdater.checkForUpdates() }
    });
  }
  submenu.push({
    label: 'Github',
    click() { shell.openExternal(PRODUCT_URL) }
  });
  MENU_TEMPLATE.push({
    role: 'help',
    submenu: submenu
  });

  const menu = Menu.buildFromTemplate(MENU_TEMPLATE);
  Menu.setApplicationMenu(menu);

  electron.commandLine.appendSwitch('js-flags', '--harmony');

  startExpress();

  win = new BrowserWindow({
    width: 600,
    height: 650,
    autoHideMenuBar: true,
    useContentSize: true,
    resizable: false,
  });
  win.setTitle(PRODUCT_NAME);

  win.loadURL('http://localhost:5000/index.html');
  win.focus();

  if (process.env.DEV) {
    win.webContents.openDevTools();
  }

  win.on('closed', () => {
    win = null
  })

  const sendStatusToWindow = (type, text, notification) => {
    win.webContents.send('updates', {type, message: text, notification});
  }

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('info', 'Checking for updates...');
  })
  autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('warning', 'Updates available.', true);
  })
  autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('success', 'Software is up-to-date.');
  })
  autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow('error', 'Error in auto-updater.');
  })
  autoUpdater.on('download-progress', (ev, progressObj) => {
    sendStatusToWindow('info', 'Downloading updates...');
  })
  autoUpdater.on('update-downloaded', (ev, info) => {
    sendStatusToWindow('success', 'Updates downloaded; will install in 5 seconds', true);
  });

  autoUpdater.on('update-downloaded', (ev, info) => {
    setTimeout(function () {
      autoUpdater.quitAndInstall();
    }, 5000)
  })
}

electron.on('ready', createWindow)

electron.on('window-all-closed', () => {
  electron.quit()
})

electron.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
