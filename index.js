'use strict'

const pjson = require('./package.json')
const store = require('./app/store')
const autolaunch = require('./app/autolaunch')

const electron = require('electron')
const applescript = require('applescript')

const { app, globalShortcut, Tray, Menu, BrowserWindow, shell, ipcMain } = electron

app.on('ready', () => {
  let tray = new Tray(`${__dirname}/app/iconTemplate.png`)
  let preferencesWindow = null

  function createTrayMenu () {
    let menuTemplate = [
      { label: `Start ${pjson.name}`, accelerator: store.get('hotkey'), click: onActivate },
      {
        label: 'Mode',
        submenu: [{
          label: 'Screensaver',
          type: 'radio',
          checked: store.get('mode') === 'Screensaver',
          click: (radio) => { setMode(radio.label) }
        }, {
          label: 'Sleep',
          type: 'radio',
          checked: store.get('mode') === 'Sleep',
          click: (radio) => { setMode(radio.label) }
        }, {
          label: 'Lock',
          type: 'radio',
          checked: store.get('mode') === 'Lock',
          click: (radio) => { setMode(radio.label) }
        }]
      },
      { label: 'Preferences', accelerator: 'Cmd+,', click: createPreferencesWindow },
      { type: 'separator' },
      { label: `About ${pjson.name}...`, click: () => { shell.openExternal(pjson.homepage) } },
      { label: 'Feedback && Support...', click: () => { shell.openExternal(pjson.bugs.url) } },
      { type: 'separator' },
      { label: `Quit ${pjson.name}`, accelerator: 'Cmd+Q', click: () => { app.quit() } }
    ]
    return Menu.buildFromTemplate(menuTemplate)
  }

  function createPreferencesWindow () {
    if (preferencesWindow) return preferencesWindow.focus()
    preferencesWindow = new BrowserWindow({
      title: `${app.getName()} Preferences`,
      titleBarStyle: 'hidden-inset',
      width: 350,
      height: 214,
      resizable: false,
      maximizable: false,
      show: false
    })
    preferencesWindow.loadURL(`file://${__dirname}/app/preferences.html`)
    preferencesWindow.once('ready-to-show', () => {
      preferencesWindow.show()
      app.dock.show()
    })
    preferencesWindow.on('closed', () => {
      preferencesWindow = null
      app.dock.hide()
    })
  }

  function onActivate () {
    let unpackedPath = __dirname.replace('app.asar', 'app.asar.unpacked')
    let mode = store.get('mode')

    if (!tray.isDestroyed()) tray.setHighlightMode('always')
    setTimeout(() => {
      applescript.execFile(`${unpackedPath}/app/applescript/${mode}.applescript`)
      if (!tray.isDestroyed()) tray.setHighlightMode('selection')
    }, 500)
  }

  function setAutoLaunch (value) {
    store.set('autoLaunch', value)
    value ? autolaunch.enable() : autolaunch.disable()
  }

  function setHideIcon (value) {
    store.set('hideIcon', value)
    if (value) {
      tray.destroy()
    } else {
      tray = new Tray(`${__dirname}/app/iconTemplate.png`)
    }
  }

  function setMode (mode, reloadPreferences) {
    store.set('mode', mode)
    tray.setContextMenu(createTrayMenu())
    if (reloadPreferences && preferencesWindow) preferencesWindow.reload()
  }

  function setHotkey (hotkey) {
    globalShortcut.unregister(store.get('hotkey'))
    globalShortcut.register(hotkey, onActivate)
    store.set('hotkey', hotkey)
  }

  globalShortcut.register(store.get('hotkey'), onActivate)

  tray.setContextMenu(createTrayMenu())
  tray.on('right-click', onActivate)
  if (store.get('hideIcon')) tray.destroy()

  app.dock.hide()
  app.on('window-all-closed', () => {})
  app.on('activate', createPreferencesWindow)

  ipcMain.on('setAutoLaunch', (event, checked) => { setAutoLaunch(checked) })
  ipcMain.on('setHideIcon', (event, checked) => { setHideIcon(checked) })
  ipcMain.on('setMode', (event, mode) => { setMode(mode) })
  ipcMain.on('setHotkey', (event, hotkey) => { setHotkey(hotkey) })
})
