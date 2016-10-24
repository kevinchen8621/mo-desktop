'use strict';
const qs = require('querystring');
const url = require('url');
const path = require('path');
const {app, ipcMain, BrowserWindow, Menu, nativeImage, Tray} = require('electron');
const ipc_user = require("./ipc/user");
const ipc_blog = require("./ipc/blog");
//const UpdateHandler = require('./handlers/update');


class Mo {
  constructor() {
    this.mainWindow = null;
    this.tray = null;

    this.ipcUser = new ipc_user();
    this.ipcBlog = new ipc_blog();
  }

  init() {
    app.on('ready', ()=> {
      this.createMainWindow();
      this.createTray();
    });

    app.on('activate', () => {
      console.log("this.mainWindow: " + this.mainWindow);
      if (this.mainWindow == null) {
        this.createMainWindow();
      } else {
        this.mainWindow.show();
      }
    });

    ipcMain.on('badge-changed', (event, num) => {
      if (process.platform == "darwin") {
        app.dock.setBadge(num);
        if (num) {
          this.tray.setTitle(` ${num}`);
        } else {
          this.tray.setTitle('');
        }
      }
    });

    ipcMain.on('ping', (event, message) => {
      console.log(message);
      event.returnValue = "pong";
    });

    ipcMain.on('log', (event, message) => {
      console.log(message);
    });

    // ipcMain.on('update', (event, message) => {
    //   let updateHandler = new UpdateHandler();
    //   updateHandler.checkForUpdate(`v${app.getVersion()}`, false);
    // });

    this.ipcUser.init();
    this.ipcBlog.init();
  };

  createTray() {

    let image;
    if (process.platform === 'linux') {
      image = nativeImage.createFromPath(path.join(__dirname, '../assets/status_bar_linux.png'));
    } else {
      image = nativeImage.createFromPath(path.join(__dirname, '../assets/status_bar.png'));
    }
    image.setTemplateImage(true);

    this.tray = new Tray(image);
    this.tray.setToolTip("个人知识管理");

    if (process.platform === 'linux') {
      const contextMenu = Menu.buildFromTemplate([
        { label: '打开', click: () => this.mainWindow.show() },
        { label: '退出', click: () => app.exit(0) },
      ]);
      this.tray.setContextMenu(contextMenu);
    }
    this.tray.on('click', () => this.mainWindow.show());

  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      title: "PKM - 个人知识管理",
      resizable: true,
      center: true,
      show: false,
      frame: true,
      autoHideMenuBar: true,
      icon: path.join(__dirname, '../assets/icon.png'),
      titleBarStyle: 'hidden-inset',
      webPreferences: {
        javascript: true,
        plugins: true,
        nodeIntegration: true,
        webSecurity: false,
      },
    });


    this.mainWindow.webContents.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36");
    this.mainWindow.webContents.openDevTools();
    this.mainWindow.webContents.on('will-navigate', (ev, url) => {
      ev.preventDefault();
      // if (!this.apiUser.current_user) {
      //   this.mainWindow.loadURL('file://' + path.join(__dirname, 'views/login.html'));
      // }
    });

    this.mainWindow.loadURL('file://' + path.join(__dirname, 'index.html'));


    this.mainWindow.on('close', (e) => {
      if (this.mainWindow.isVisible()) {
        e.preventDefault();
        this.mainWindow.hide();
      }
    });

    this.mainWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(qs.parse(url.parse(origin).query).requrl || origin);
    });

    this.mainWindow.show();
  }

}

new Mo().init();
