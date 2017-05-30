/* global $ */
window.$ = window.jQuery = require('jquery')
const {ipcRenderer, shell} = require('electron')
const Config = require('electron-config')
const config = new Config()

$(document).on('click', 'a[href^="http"]', (event) => {
  event.preventDefault()
  shell.openExternal(event.target.href)
})

$('#autolaunch').prop('checked', config.get('autoLaunch'))
  .change((event) => {
    config.set('autoLaunch', event.target.checked)
    ipcRenderer.send('toggleAutoLaunch', event.target.checked)
  })

$('#invert-clicks').prop('checked', config.get('invertClicks'))
  .change((event) => { config.set('invertClicks', event.target.checked) })

$('#mode').val(config.get('mode'))
  .change((event) => {
    config.set('mode', event.target.value)
    event.target.value === 'screensaver' ? $('#delay-field').show() : $('#delay-field').hide()
  })

$('#delay').val(config.get('delay'))
  .change((event) => { config.set('delay', event.target.value) })

$('#global-hotkey').val(config.get('globalHotkey'))
  .change((event) => { config.set('globalHotkey', event.target.value) })

if (config.get('mode') !== 'Screensaver') $('#delay-field').hide()
