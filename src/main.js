const electron = require('electron');
const applescript = require('applescript');

const pjson = require('../package.json');
const store = require('./store');
const autolaunch = require('./autolaunch');

const {
  app,
  globalShortcut,
  Tray,
  Menu,
  BrowserWindow,
  shell,
  ipcMain,
} = electron;

app.on('ready', () => {
  let tray = new Tray(`${__dirname}/icon/iconTemplate.png`);
  let preferencesWindow = null;

  function createApplicationMenu() {
    const menu = Menu.buildFromTemplate([
      {
        label: pjson.name,
        submenu: [
          {
            label: `About ${pjson.name}...`,
            click: () => {
              shell.openExternal(pjson.homepage);
            },
          },
          { type: 'separator' },
          {
            label: 'Close Window',
            accelerator: 'Cmd+w',
            click: () => {
              preferencesWindow.close();
            },
          },
          {
            label: `Quit ${pjson.name}`,
            accelerator: 'Cmd+q',
            click: app.quit,
          },
        ],
      },
    ]);
    Menu.setApplicationMenu(menu);
  }

  function createTrayMenu() {
    const menuTemplate = [
      {
        label: `Start ${pjson.name}`,
        accelerator: store.get('hotkey'),
        click: onActivate,
      },
      {
        label: 'Mode',
        submenu: [
          {
            label: 'Screen Saver',
            type: 'radio',
            checked: store.get('mode') === 'screen-saver',
            click: () => {
              setMode('screen-saver', true);
            },
          },
          {
            label: 'Sleep',
            type: 'radio',
            checked: store.get('mode') === 'sleep',
            click: () => {
              setMode('sleep', true);
            },
          },
          {
            label: 'Lock',
            type: 'radio',
            checked: store.get('mode') === 'lock',
            click: () => {
              setMode('lock', true);
            },
          },
        ],
      },
      {
        label: 'Preferences',
        accelerator: 'Cmd+,',
        click: createPreferencesWindow,
      },
      { type: 'separator' },
      {
        label: `About ${pjson.name}...`,
        click: () => {
          shell.openExternal(pjson.homepage);
        },
      },
      {
        label: 'Feedback && Support...',
        click: () => {
          shell.openExternal(pjson.bugs.url);
        },
      },
      { type: 'separator' },
      {
        label: `Quit ${pjson.name}`,
        accelerator: 'Cmd+Q',
        click: () => {
          app.quit();
        },
      },
    ];
    return Menu.buildFromTemplate(menuTemplate);
  }

  function createPreferencesWindow() {
    if (preferencesWindow) return preferencesWindow.focus();
    preferencesWindow = new BrowserWindow({
      title: `${pjson.name} Preferences`,
      titleBarStyle: 'hidden',
      width: 325,
      height: 178,
      resizable: false,
      maximizable: false,
      show: false,
    });
    preferencesWindow.loadURL(`file://${__dirname}/preferences/index.html`);
    preferencesWindow.once('ready-to-show', () => {
      const screen = electron.screen.getDisplayNearestPoint(
        electron.screen.getCursorScreenPoint(),
      );
      preferencesWindow.setPosition(
        Math.floor(
          screen.bounds.x +
            screen.size.width / 2 -
            preferencesWindow.getSize()[0] / 2,
        ),
        Math.floor(
          screen.bounds.y +
            screen.size.height / 2 -
            preferencesWindow.getSize()[1] / 2,
        ),
      );
      preferencesWindow.show();
      app.dock.show();
    });
    preferencesWindow.on('closed', () => {
      preferencesWindow = null;
      app.dock.hide();
    });
    return preferencesWindow;
  }

  function onActivate() {
    const unpackedPath = __dirname.replace('app.asar', 'app.asar.unpacked');
    const mode = store.get('mode');

    if (!tray.isDestroyed()) tray.setHighlightMode('always');
    setTimeout(() => {
      applescript.execFile(`${unpackedPath}/applescript/${mode}.applescript`);
      if (!tray.isDestroyed()) tray.setHighlightMode('selection');
    }, 500);
  }

  function setAutoLaunch(isEnabled) {
    store.set('autoLaunch', isEnabled);
    if (isEnabled) {
      autolaunch.enable();
    } else {
      autolaunch.disable();
    }
  }

  function setHideIcon(isHidden) {
    store.set('hideIcon', isHidden);
    if (isHidden) {
      tray.destroy();
    } else {
      tray = new Tray(`${__dirname}/icon/iconTemplate.png`);
      tray.setContextMenu(createTrayMenu());
      tray.on('right-click', onActivate);
    }
  }

  function setMode(mode, reloadPreferences) {
    store.set('mode', mode);
    if (!tray.isDestroyed()) tray.setContextMenu(createTrayMenu());
    if (reloadPreferences && preferencesWindow) preferencesWindow.reload();
  }

  function setHotkey(hotkey) {
    globalShortcut.unregister(store.get('hotkey'));
    globalShortcut.register(hotkey, onActivate);
    store.set('hotkey', hotkey);
  }

  createApplicationMenu();
  globalShortcut.register(store.get('hotkey'), onActivate);

  tray.setContextMenu(createTrayMenu());
  tray.on('right-click', onActivate);
  if (store.get('hideIcon')) tray.destroy();

  app.dock.hide();
  app.on('window-all-closed', () => {});
  app.on('activate', createPreferencesWindow);

  ipcMain.on('setAutoLaunch', (event, checked) => {
    setAutoLaunch(checked);
  });
  ipcMain.on('setHideIcon', (event, checked) => {
    setHideIcon(checked);
  });
  ipcMain.on('setMode', (event, mode) => {
    setMode(mode, false);
  });
  ipcMain.on('setHotkey', (event, hotkey) => {
    setHotkey(hotkey);
  });
});
