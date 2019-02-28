const Store = require('electron-store')

module.exports = new Store({
  defaults: {
    autoLaunch: false,
    hideIcon: false,
    mode: 'Screensaver',
    hotkey: 'Control+Shift+A'
  }
})
