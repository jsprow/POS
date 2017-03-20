'use strict';
if (require('electron-squirrel-startup')) return;
const electron = require('electron');
const {app, ipcMain, Menu, BrowserWindow} = require('electron');
const path = require('path');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

require('electron-debug')();

if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

//make sure auto-updater doesn't fire on first run.... secret squirrel
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

//auto-updater code
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

autoUpdater.on('update-downloaded', (ev, info) => {
  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000);
})

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});

//Define the menu for osx
let template = []
if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}

//create updater window
function sendStatusToWindow(text) {
  log.info(text);
  versionWindow.webContents.send('message', text);
}

let versionWindow;
function createVersionWindow() {
  versionWindow = new BrowserWindow();
  versionWindow.webContents.openDevTools();
  versionWindow.on('closed', () => {
    versionWindow = null;
  });
  versionWindow.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return versionWindow;
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('Error in auto-updater.');
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  sendStatusToWindow('Download progress...');
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

//get path for writing userData/log.txt
global.path = app.getPath('userData');

//logic for opening, refreshing and closing log
ipcMain.on('open-second-window', (event, arg)=> {
  logWindow = createLogModal();
});
ipcMain.on('asynchronous-message', (event, arg)=> {
	event.sender.send('synchronous-reply', 'refresh');
});
ipcMain.on('close-second-window', (event, arg)=> {
  logWindow.hide();
});
ipcMain.on('shrink-window', (event, arg)=> {
	mainWindow.setSize(400, 160, true);
});
ipcMain.on('grow-window', (event, arg)=> {
	mainWindow.setSize(400, 500, true);
});

let mainWindow;
let logWindow;

function onClosed() {
	mainWindow = null;
	logWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
				backgroundColor: '#ffffff',
				width: 400,
				height: 500,
				frame: false,
				x: 0,
				y: 0,
				title: 'Rewards App',
				show: false
	});
	win.setAlwaysOnTop(true);
	win.once('ready-to-show', () => {
	  win.show();
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}
function createLogModal() {
	const log = new electron.BrowserWindow({
				parent: mainWindow,
				width: 900,
				height: 500,
				modal: true,
				show: false,
				frame: false
	});

	log.loadURL(`file://${__dirname}/log.html`);

	log.once('ready-to-show', () => {
	  log.show();
	});
	return log;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
	//mainWindow.webContents.openDevTools();
	const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createVersionWindow();
});
