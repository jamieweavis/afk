/* global $ */
window.$ = window.jQuery = require('jquery')
const {ipcRenderer, shell} = require('electron')
const store = require('./store')

$(document).on('click', 'a[href^="http"]', (event) => {
  event.preventDefault()
  shell.openExternal(event.target.href)
})

$('#autolaunch').prop('checked', store.get('autoLaunch'))
  .change((event) => {
    store.set('autoLaunch', event.target.checked)
    ipcRenderer.send('toggleAutoLaunch', event.target.checked)
  })

$('#mode').val(store.get('mode'))
  .change((event) => {
    store.set('mode', event.target.value)
    event.target.value === 'screensaver' ? $('#delay-field').show() : $('#delay-field').hide()
  })

$('#delay').val(store.get('delay'))
  .change((event) => { store.set('delay', event.target.value) })

$('#global-hotkey').val(store.get('globalHotkey'))
  .change((event) => { store.set('globalHotkey', event.target.value) })

if (store.get('mode') !== 'Screensaver') $('#delay-field').hide()
