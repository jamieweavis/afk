'use strict'

const AutoLaunch = require('auto-launch')
const pjson = require('../package.json')

module.exports = new AutoLaunch({
  name: pjson.name,
  path: `/Applications/${pjson.name}.app`
})
