'use strict';
const electron = require('electron'),
			app = electron.app,
			{ipcMain} = require('electron');

global.path = app.getPath('userData');

// adds event listener for the log modal open/close events
ipcMain.on('open-second-window', (event, arg)=> {
    logWindow.show();
});
ipcMain.on('close-second-window', (event, arg)=> {
    logWindow.hide();
});
// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;
let logWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
	logWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ffffff',
		width: 400,
		height: 700,
		frame: false,
		x: 0,
		y: 0,
		title: 'Loyalty Integration'
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}
function createLogModal() {
	const log = new electron.BrowserWindow({
		parent: mainWindow,
		width: 700,
		height: 500,
		modal: true,
		show: false,
		frame: false
	});

	log.loadURL(`file://${__dirname}/log.html`);
	// log.once('ready-to-show', () => {
	// 	log.show();
	// });
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
	if (!logModal) {
		logWindow = createLogModal();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
	//mainWindow.webContents.openDevTools();
	logWindow = createLogModal();
});
