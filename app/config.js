'use strict'

const Config = require('electron-config')

module.exports = new Config({
  defaults: {
    mode: 'screensaver',
    autoLaunch: false,
    invertClicks: false,
    globalHotkey: 'Control+Shift+a',
    delay: 500
  }
})
