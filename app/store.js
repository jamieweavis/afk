'use strict'

const Store = require('electron-store')

module.exports = new Store({
  defaults: {
    mode: 'screensaver',
    hideMenuBarIcon: false,
    autoLaunch: false,
    globalHotkey: 'Control+Shift+a',
    delay: 500
  }
})
