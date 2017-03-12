'use strict';
const electron = require('electron'),
			app = electron.app,
			{ipcMain} = require('electron');

global.path = app.getPath('userData');

ipcMain.on('open-second-window', (event, arg)=> {
  logWindow = createLogModal();
});
ipcMain.on('asynchronous-message', (event, arg)=> {
	console.log('said', arg);
	event.sender.send('synchronous-reply', 'refresh');
});

ipcMain.on('close-second-window', (event, arg)=> {
  logWindow.hide();
});
ipcMain.on('shrink-window', (event, arg)=> {
	mainWindow.setSize(400, 160, true);
	console.log('heard shrink');
});
ipcMain.on('grow-window', (event, arg)=> {
	console.log('heard grow');
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
