const dotenv = require('dotenv');
const { app: electron, BrowserWindow, Menu, shell, remote } = require('electron');
const log = require('electron-log');
const path = require('path');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const socket = require('socket.io-client/lib/index')('http://localhost:5000');

const {
  MENU_TEMPLATE,
  PRODUCT_NAME,
  PRODUCT_URL,
} = require('./src/utils/Constants');
const Configs = require('./src/utils/Configs');
const Slack = require('./src/utils/Slack');

let win;

global.win = win;
global.process_env = process.env;
const { autoUpdater } = require('electron-updater');

electron.setAsDefaultProtocolClient('sloth');

autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let envPath;
if (process.env.APP_ENV === 'browser') {
  envPath = path.normalize(remote.app.getAppPath());
} else {
  envPath = path.join(__dirname);
}
dotenv.config({ path: `${envPath}/.express.env` });

if (process.argv.includes('UPDATE')) {
  log.info('Updating status...');

  Slack.checkStatus(Configs.forceUpdate)
    .then(() => {
      log.info('Status updated');
      socket.emit('status updated', {});
      electron.quit();
    })
    .catch(() => electron.quit())
  ;
} else {
  log.info('App starting...');

  const sendStatusToWindow = (type, message) => {
    const duration = ['error', 'warning'].includes(type) ? 5 : 1.5;
    win.webContents.send('updates', { type, message, duration });
  };

  const sendNotification = (type, title, message, status) => {
    win.webContents.send('updates', { type, title, message, notification: true, status });
  };

  const startExpress = () => {
    app.use(express.static(path.join(__dirname, '/dist')));
    app.use(express.static(path.join(__dirname, '/views')));
    app.use(express.static(path.join(__dirname, '/assets')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.get('/auth', (req, res) => {
      Slack.checkToken(true)
      .then((tokenSet) => {
        if (tokenSet) {
          res.sendFile(path.join(__dirname, '/views/index.html'));
        } else {
          const options = {
            uri: `https://slack.com/api/oauth.access?code=${req.query.code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=http://localhost:5000/auth`,
            method: 'GET',
          };
          request(options, (error, response, body) => {
            const JSONresponse = JSON.parse(body);
            if (!JSONresponse.ok) {
              log.error(body);
              sendStatusToWindow('error', 'Error in authentication!');
              res.sendFile(path.join(__dirname, '/views/index.html'));
            } else {
              const config = Object.assign({},
                Configs.load(),
                { token: JSONresponse.access_token });
              Configs.save(config);
              res.sendFile(path.join(__dirname, '/views/index.html'));
            }
          });
        }
      });
    });

    io.on('connection', (client) => {
      client
        .on('authorised', (data) => {
          win.focus();
          io.emit('authorised', data);
        })
        .on('status updated', () => {
          io.emit('status updated', {});
        })
        .on('check updates', () => {
          autoUpdater.checkForUpdates();
        })
        .on('update', () => {
          sendStatusToWindow('info', 'Downloading updates...');
          autoUpdater.downloadUpdate();
        })
        .on('install update', () => {
          autoUpdater.quitAndInstall();
        })
      ;
    });

    server.listen(5000, 'localhost');
  };

  const createWindow = () => {
    if (process.platform === 'darwin') {
      MENU_TEMPLATE.unshift({
        label: PRODUCT_NAME,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          {
            label: 'Check for updates',
            click() { autoUpdater.checkForUpdates(); },
          },
          { role: 'services', submenu: [] },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      });
    }
    const submenu = [];
    submenu.push({
      label: 'Open Developer Tools',
      click() { win.webContents.openDevTools(); },
    });
    if (process.platform !== 'darwin') {
      submenu.push({
        label: 'Check for updates',
        click() { autoUpdater.checkForUpdates(); },
      });
    }
    submenu.push({
      label: 'Github',
      click() { shell.openExternal(PRODUCT_URL); },
    });
    MENU_TEMPLATE.push({
      role: 'help',
      submenu,
    });

    const menu = Menu.buildFromTemplate(MENU_TEMPLATE);
    Menu.setApplicationMenu(menu);

    electron.commandLine.appendSwitch('js-flags', '--harmony');

    if (process.env.NODE_ENV !== 'development') {
      startExpress();
    }

    win = new BrowserWindow({
      width: 600,
      height: 700,
      autoHideMenuBar: true,
      useContentSize: true,
      resizable: false,
    });
    win.setTitle(PRODUCT_NAME);

    win.loadURL('http://localhost:5000/index.html');
    win.focus();

    win.on('closed', () => {
      win = null;
    });

    win.webContents.on('new-window', (event, url, frameName) => {
      if (frameName === 'modal') {
        event.preventDefault();
        win.loadURL(url);
      }
    });

    autoUpdater
      .on('checking-for-update', () => {
        sendStatusToWindow('info', 'Checking for updates...');
      })
      .on('update-available', (ev) => {
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
          <div class="release-notes">
            ${ev.releaseNotes}
          </div>
        `;
        sendNotification('warning', 'Update available', message, 'update');
      })
      .on('update-not-available', () => {
        sendStatusToWindow('success', 'Software is up-to-date.');
      })
      .on('error', (ev, err) => {
        log.error(err);
        sendStatusToWindow('error', 'Error in auto-updater.');
      })
      .on('download-progress', () => {
        sendStatusToWindow('info', 'Downloading updates...');
      })
      .on('update-downloaded', () => {
        sendNotification('success', 'Update downloaded', 'Please restart the app to finish the update', 'install');
      })
    ;
  };

  electron
    .on('ready', createWindow)
    .on('window-all-closed', () => {
      electron.quit();
    })
    .on('activate', () => {
      if (win === null) {
        createWindow();
      }
    })
  ;
}
