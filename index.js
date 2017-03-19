'use strict';
const electron = require('electron');
const app = electron.app;
const {ipcMain} = require('electron');
const path = require('path');
const autoUpdater = require('auto-updater');
const appVersion = require('./package.json').version;
const os = require('os').platform();

var updateFeed = 'https://jsprow.com/pos/latest';

autoUpdater.quitAndInstall();

if (process.env.NODE_ENV !== 'development') {
  updateFeed = os === 'darwin' ?
    'https://mysite.com/updates/latest' :
    'http://download.mysite.com/releases/win32';
}

autoUpdater.setFeedURL(updateFeed + '?v=' + appVersion);
global.path = app.getPath('userData');

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

require('electron-debug')();

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
});
