const Config = require('electron-config')
const electron = require('electron')
const AutoLaunch = require('auto-launch')
const applescript = require('applescript')

const {app, globalShortcut, Tray, Menu, BrowserWindow, shell, ipcMain} = electron
const config = new Config(require('./app/config'))
const autoLaunch = new AutoLaunch({ name: app.getName(), path: `/Applications/${app.getName()}.app` })

let tray = null
let preferencesWindow = null
let aboutWindow = null

app.dock.hide()
app.on('ready', () => {
  tray = new Tray(`${__dirname}/app/iconTemplate.png`)
  tray.on('click', () => { onTrayClick() })
  tray.on('right-click', () => { onTrayRightClick() })

  globalShortcut.register(config.get('globalHotkey'), onActivate)
  ipcMain.on('toggleAutoLaunch', setAutoLaunch)
})
app.on('window-all-closed', () => {})

function createTrayMenu () {
  return Menu.buildFromTemplate([
    { label: `Start ${app.getName()}`, accelerator: config.get('globalHotkey'), click: onActivate },
    {
      label: 'Mode',
      submenu: Menu.buildFromTemplate([
        { label: 'Screensaver', type: 'radio', checked: config.get('mode') === 'screensaver', click: onModeChange },
        { label: 'Sleep', type: 'radio', checked: config.get('mode') === 'sleep', click: onModeChange },
        { label: 'Lock', type: 'radio', checked: config.get('mode') === 'lock', click: onModeChange }
      ])
    },
    { label: 'Preferences', accelerator: 'Cmd+,', click: createPreferencesWindow },
    { type: 'separator' },
    { label: `About ${app.getName()}`, click: createAboutWindow },
    { label: 'Feedback && Support...', click: () => { shell.openExternal('https://github.com/slashjs/afk/issues') } },
    { type: 'separator' },
    { label: `Quit ${app.getName()}`, accelerator: 'Cmd+Q', click: () => { app.quit() } }
  ])
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
  preferencesWindow.loadURL(`file://${__dirname}/app/preferences/index.html`)
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
    height: 230,
    resizable: false,
    maximizable: false,
    show: false
  })
  aboutWindow.loadURL(`file://${__dirname}/app/about/index.html`)
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show()
    app.dock.show()
  })
  aboutWindow.on('closed', () => {
    aboutWindow = null
    app.dock.hide()
  })
}

function onTrayClick () {
  config.get('invertClicks') ? onActivate() : tray.popUpContextMenu(createTrayMenu())
}

function onTrayRightClick () {
  config.get('invertClicks') ? tray.popUpContextMenu(createTrayMenu()) : onActivate()
}

function setAutoLaunch (event, value) {
  value === true ? autoLaunch.enable() : autoLaunch.disable()
}

function onModeChange (radio) {
  config.set('mode', radio.label.toLowerCase())
  if (preferencesWindow) preferencesWindow.reload()
}

function onActivate () {
  switch (config.get('mode')) {
    case 'screensaver': return startScreenSaver()
    case 'sleep': return startSleep()
    case 'lock': return startLock()
  }
}

function startScreenSaver () {
  let delay = config.get('delay')
  let script = `
    tell application "System Events" 
      start current screen saver
    end tell
  `
  tray.setHighlightMode('always')
  setTimeout(() => {
    applescript.execString(script)
    tray.setHighlightMode('selection')
  }, delay)
}

function startSleep () {
  tray.setHighlightMode('always')

  let script = `tell application "Finder" to sleep`
  applescript.execString(script)

  setTimeout(() => { tray.setHighlightMode('selection') }, 250)
}

function startLock () {
  tray.setHighlightMode('always')

  let script = `do shell script "/System/Library/CoreServices/Menu\\\\ Extras/User.menu/Contents/Resources/CGSession -suspend"`
  applescript.execString(script)

  setTimeout(() => { tray.setHighlightMode('selection') }, 250)
}
