/* global $ */
window.$ = window.jQuery = require('jquery')
const {shell, remote} = require('electron')
const app = remote.app

$(document).on('click', 'a[href^="http"]', (event) => {
  event.preventDefault()
  shell.openExternal(event.target.href)
})
$('#version').html(`v${app.getVersion()}`)
