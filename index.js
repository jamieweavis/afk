'use strict'

const pjson = require('./package.json')
const store = require('./app/store')
const applescript = require('applescript')
const AutoLaunch = require('auto-launch')

const electron = require('electron')
const { app, globalShortcut, Tray, Menu, BrowserWindow, shell, ipcMain } = electron

app.on('ready', () => {
  const tray = new Tray(`${__dirname}/app/iconTemplate.png`)
  const afkAutoLauncher = new AutoLaunch({
    name: app.getName(),
    path: `/Applications/${pjson.name}.app`
  })

  let preferencesWindow = null
  let aboutWindow = null

  function createTrayMenu () {
    let cfg = store.store
    let menuTemplate = [
      { label: `Start ${pjson.name}`, accelerator: cfg.globalHotkey, click: onActivate },
      {
        label: 'Mode',
        submenu: [{
          label: 'Screensaver',
          type: 'radio',
          checked: cfg.mode === 'Screensaver',
          click: onModeChange
        }, {
          label: 'Sleep',
          type: 'radio',
          checked: cfg.mode === 'Sleep',
          click: onModeChange
        }, {
          label: 'Lock',
          type: 'radio',
          checked: cfg.mode === 'Lock',
          click: onModeChange
        }]
      },
      { label: 'Preferences', accelerator: 'Cmd+,', click: createPreferencesWindow },
      { type: 'separator' },
      { label: `About ${pjson.name}`, click: createAboutWindow },
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
      height: 260,
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

  function createAboutWindow () {
    if (aboutWindow) return aboutWindow.focus()
    aboutWindow = new BrowserWindow({
      title: `About ${app.getName()}`,
      titleBarStyle: 'hidden-inset',
      width: 350,
      height: 220,
      resizable: false,
      maximizable: false,
      show: false
    })
    aboutWindow.loadURL(`file://${__dirname}/app/about.html`)
    aboutWindow.once('ready-to-show', () => {
      aboutWindow.show()
      app.dock.show()
    })
    aboutWindow.on('closed', () => {
      aboutWindow = null
      app.dock.hide()
    })
  }

  function onModeChange (radio) {
    store.set('mode', radio.label)
    if (preferencesWindow) preferencesWindow.reload()
  }

  function onActivate () {
    let mode = store.get('mode')
    let unpackedPath = __dirname.replace('app.asar', 'app.asar.unpacked')
    tray.setHighlightMode('always')

    if (mode === 'screensaver') {
      let delay = store.get('delay')
      setTimeout(() => {
        applescript.execFile(`${unpackedPath}/app/applescript/screensaver.applescript`)
        tray.setHighlightMode('selection')
      }, delay)
    } else {
      applescript.execFile(`${unpackedPath}/app/applescript/${mode}.applescript`)
      setTimeout(() => { tray.setHighlightMode('selection') }, 250)
    }
  }

  app.dock.hide()
  app.on('window-all-closed', () => {})
  app.on('activate', createPreferencesWindow)

  tray.on('click', () => { store.get('invertClicks') ? onActivate() : tray.popUpContextMenu(createTrayMenu()) })
  tray.on('right-click', () => { store.get('invertClicks') ? tray.popUpContextMenu(createTrayMenu()) : onActivate() })

  globalShortcut.register(store.get('globalHotkey'), onActivate)

  ipcMain.on('toggleAutoLaunch', (event, checked) => { checked ? afkAutoLauncher.enable() : afkAutoLauncher.disable() })
})
