#!/usr/bin/env node

const server = require('./node_modules/pushstate-server/index')

server.start({
  directories: ['.', './images'],
  port: 8765,
  // file: process.argv[4]
}, (err, address) =>
  console.log(err || '', `Listening on port ${address.port} (http://${address.address}:${address.port})`)
)