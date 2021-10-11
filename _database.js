var setTitle = require('console-title');
setTitle('AXIS PANEL JSON DATABASE');
const signale = require('signale');
signale.success('INITATED DATABASE SUCCESSFULY.');
const config = require(__dirname + "config.json")
const jsonServer = require('json-server')

//JSON-SERVER CREATION
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const fs = require('fs')
const { networkInterfaces } = require('os')
const middlewares = jsonServer.defaults()
const ip = `${config.databaseip}`
server.use(middlewares)
const lockdown = false

server.use((req, res, next) => {
  var accessingIP = req._remoteAddress;
  var accessedPN = req.originalUrl;
  if (lockdown) {
    if (accessingIP != `${config.databaseip}`) { // add your authorization logic here
      if (!(accessedPN.includes("favicon.ico"))) { log(`Forbidden IP Access from ${accessingIP} to db${accessedPN}`) }
      res.send("403 | Forbidden | HASSİKTİR LAN ORDAN")
    } 
    else{next()}
  }
  else {
    next() // continue to JSON Server router
  }

})

server.use(router)

function log(ldata) {
  fs.appendFile('rlogs.txt', `${new Date().toLocaleString()} | ${Date.now()} : ${ldata} \n`, function (err) { if (err) throw err; });
}

server.listen(3000, ip, () => {
  console.log('JSON Server is running')
})

