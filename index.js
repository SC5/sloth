const dotenv = require('dotenv');
const { app: electron, BrowserWindow, Menu, shell, remote, protocol, ipcMain } = require('electron');
const log = require('electron-log');
const path = require('path');
const request = require('request');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

global.process_env = process.env;
const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let envPath;
if (process.env.APP_ENV === 'browser') {
  envPath = path.normalize(remote.app.getAppPath());
} else {
  envPath = path.join(__dirname);
}
dotenv.config({ path: `${envPath}/.env` });

const Configs = require('./src/utils/Configs');
const Slack = require('./src/utils/Slack');

if (process.argv.includes('UPDATE')) {
  log.info('Updating status...');

  const socket = require('socket.io-client/lib/index')('http://localhost:5000');
  Slack.checkStatus(Configs.forceUpdate)
    .then(output => {
      log.info('Status updated');
      socket.emit('status updated', {});
      electron.quit();
    })
    .catch(error => electron.quit())
  ;
}
else {
  const {
    MENU_TEMPLATE,
      PRODUCT_NAME,
      PRODUCT_URL
  } = require('./src/utils/Constants');

  log.info('App starting...');

  let win

  const startExpress = () => {
    app.use(express.static(__dirname + '/bundles'));
    app.use(express.static(__dirname + '/views'));
    app.use(express.static(__dirname + '/assets'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
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
                + "<pre>" + JSON.stringify(JSONresponse)+"</pre>"
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
      client
        .on('authorised', data => {
          win.focus();
          io.emit('authorised', data);
        })
        .on('status updated', data => {
          io.emit('status updated', {});
        })
        .on('check updates', () => {
          autoUpdater.checkForUpdates();
        })
        .on('update', data => {
          sendStatusToWindow('info', 'Downloading updates...');
          autoUpdater.downloadUpdate();
        })
        .on('install update', data => {
          autoUpdater.quitAndInstall();
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
          {
            label: 'Open Dev Tools',
            click() { win.webContents.openDevTools() }
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

    win.on('closed', () => {
      win = null
    })

    const sendStatusToWindow = (type, message) => {
      const duration = ['error', 'warning'].includes(type) ? 5 : 1.5;
      win.webContents.send('updates', { type, message, duration });
    }

    const sendNotification = (type, title, message, status) => {
      win.webContents.send('updates', { type, title, message, notification: true, status });
    }

    autoUpdater.on('checking-for-update', () => {
      sendStatusToWindow('info', 'Checking for updates...');
    })
    autoUpdater.on('update-available', (ev, info) => {
      log.warn('Updates available.');
      const message = `
        <table class="updates">
          <tr>
            <th>Current version</th>
            <td>${electron.getVersion()}</td>
          </tr>
          <tr>
            <th>Latest version</th>
            <td>${ev.version}</td>
          </tr>
        </table>

        <h4>Release date</h4>
        ${new Date(ev.releaseDate)}
        <br />
        <br />

        <h4>Release notes</h4>
        ${ev.releaseNotes}
      `;
      sendNotification('warning', 'Update available', message, 'update');
    })
    autoUpdater.on('update-not-available', (ev, info) => {
      sendStatusToWindow('success', 'Software is up-to-date.');
    })
    autoUpdater.on('error', (ev, err) => {
      log.error(err);
      sendStatusToWindow('error', 'Error in auto-updater.');
    })
    autoUpdater.on('download-progress', (ev, progressObj) => {
      sendStatusToWindow('info', 'Downloading updates...');
    })
    autoUpdater.on('update-downloaded', (ev, info) => {
      sendNotification('success', 'Update downloaded', 'Please restart the app to finish the update', 'install');
    });
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
}
