require('dotenv').config();

const { app: electron, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const url = require('url');
const request = require('request');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const Utils = require('./src/utils');
const utils = new Utils();

if (process.env.NODE_ENV !== 'production') {
  require('electron-react-devtools');
}

const {
  MENU_TEMPLATE,
  PRODUCT
} = require('./src/utils/constants');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

const startExpress = () => {
  app.use(express.static(__dirname + '/dist'));
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
    if (utils.checkToken(true)) {
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
          res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end();
        }
        else{
          const config = Object.assign({},
            utils.getConfig(),
            {token: JSONresponse.access_token}
          );
          utils.saveToConfig(config);

          res.sendFile(path.join(__dirname, '/views/authorised.html'));
        }
      });
    }
  });

  io.on('connection', client => {
    client
      .on('authorised', data => {
        io.emit('authorised', data);
      })
  });

  server.listen(5000, 'localhost');
}

const createWindow = () => {
  MENU_TEMPLATE.push({
    role: 'help',
    submenu: [
      {
        label: 'Github',
        click () { shell.openExternal(PRODUCT.url) }
      }
    ]
  });

  const menu = Menu.buildFromTemplate(MENU_TEMPLATE);
  Menu.setApplicationMenu(menu);

  electron.commandLine.appendSwitch('js-flags', '--harmony');

  startExpress();

  // Create the browser window.
  win = new BrowserWindow({
    width: 600,
    height: 650,
    autoHideMenuBar: true,
    useContentSize: true,
    resizable: false,
  });
  win.setTitle(PRODUCT.name);

  win.loadURL('http://localhost:5000/index.html');
  win.focus();

  // Open the DevTools.
  if (process.env.DEV) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.on('ready', createWindow)

// Quit when all windows are closed.
electron.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    electron.quit()
  //}
})

electron.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.