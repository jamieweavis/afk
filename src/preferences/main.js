const jquery = require('jquery');
const { ipcRenderer, shell } = require('electron');
const isAccelerator = require('electron-is-accelerator');
const store = require('../store');

window.$ = jquery;
window.jQuery = jquery;

$(document).on('click', 'a[href^="http"]', event => {
  event.preventDefault();
  shell.openExternal(event.target.href);
});

$('#autolaunch')
  .prop('checked', store.get('autoLaunch'))
  .change(event => {
    ipcRenderer.send('setAutoLaunch', event.target.checked);
  });

$('#hide-icon')
  .prop('checked', store.get('hideIcon'))
  .change(event => {
    ipcRenderer.send('setHideIcon', event.target.checked);
  });

$('#mode')
  .val(store.get('mode'))
  .change(event => {
    ipcRenderer.send('setMode', event.target.value);
  });

$('#global-hotkey')
  .val(store.get('hotkey'))
  .keyup(event => {
    const hotkey = event.target.value;
    const isValid = isAccelerator(hotkey);
    $('#global-hotkey').toggleClass('invalid', !isValid);
    if (isValid) ipcRenderer.send('setHotkey', hotkey);
  });
