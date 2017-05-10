'use strict';
const electron = require('electron');
const {
	app,
	ipcMain,
	Menu,
	BrowserWindow
} = require('electron');
const path = require('path');
const log = require('electron-log');
const {
	autoUpdater
} = require("electron-updater");

require('electron-debug')();

//auto-updater code
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

autoUpdater.on('update-downloaded', (ev, info) => {
	setTimeout(() => {
		autoUpdater.quitAndInstall();
	}, 5000);
})

app.on('ready', () => {
	autoUpdater.getFeedURL('dist/latest.yml');
	autoUpdater.checkForUpdates();
});

//Define the menu for osx
let template = []
if (process.platform === 'darwin') {
	const name = app.getName();
	template.unshift({
		label: name,
		submenu: [{
				label: 'About ' + name,
				role: 'about'
			},
			{
				label: 'Quit',
				accelerator: 'Command+Q',
				click() {
					app.quit();
				}
			},
		]
	})
}

//get path for writing userData/log.txt
global.path = app.getPath('userData');

//logic for opening, refreshing and closing log
ipcMain.on('open-second-window', (event, arg) => {
	logWindow = createLogModal();
});
ipcMain.on('asynchronous-message', (event, arg) => {
	event.sender.send('synchronous-reply', 'refresh');
});
ipcMain.on('close-second-window', (event, arg) => {
	logWindow.hide();
});
ipcMain.on('shrink-window', (event, arg) => {
	mainWindow.setSize(275, 180, true);
});
ipcMain.on('grow-window', (event, arg) => {
	mainWindow.setSize(275, 450, true);
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
		width: 275,
		height: 450,
		frame: false,
		title: 'Rewards App',
		show: false,
		minimizable: false,
		maximizable: false
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
		width: 1000,
		height: 550,
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

	// mainWindow.webContents.openDevTools();

	//display menu
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	//send auto-updater and version messaging to window
	function sendStatusToWindow(text) {
		log.info(text);
		mainWindow.webContents.send('message', text);
	}
	autoUpdater.on('checking-for-update', () => {
		sendStatusToWindow('Checking for update...');
		mainWindow.webContents.send('show-update-bar');
	});
	autoUpdater.on('update-available', (ev, info) => {
		sendStatusToWindow('Update available.');
		mainWindow.webContents.send('show-update-bar');
	});
	autoUpdater.on('update-not-available', (ev, info) => {
		sendStatusToWindow('Update not available.');
	});
	autoUpdater.on('error', (ev, err) => {
		sendStatusToWindow('Error in auto-updater.');
	});
	autoUpdater.on('download-progress', (ev, progressObj) => {
		sendStatusToWindow('Downloading... Just a sec');
	});
	autoUpdater.on('update-downloaded', (ev, info) => {
		sendStatusToWindow('Installing...');
	});

});
