const Store = require('electron-store');

module.exports = new Store({
  defaults: {
    autoLaunch: false,
    hideIcon: false,
    mode: 'screen-saver',
    hotkey: 'Control+Shift+L',
  },
});
