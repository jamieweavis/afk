'use strict'

const Store = require('electron-store')

module.exports = new Store({
  defaults: {
    autoLaunch: false,
    hideMenuBarIcon: false,
    mode: 'screensaver',
    globalHotkey: 'Control+Shift+a'
  }
})
