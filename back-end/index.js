process.chdir(__dirname);

const svScanner = require('./serverscanner.js')
const express = require('express');
const app = express();
const cors = require('cors')
const axios = require('axios')
const jserv = require('json-server')
const jsonServerRouter = jserv.router('./db.json')
const $ = require('./env.json')
const jp = require('jsonpath');
const delay = require('delay');
const { await } = require('signale');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; //XHR turns out to be way better than two of the http request libraries above, since it is not a promise-based library.

const dbhost = $.modules.database.host
const dbport = $.modules.database.port
const database = dbhost + ':' + dbport

const dbsaddr = `http://${database}/servers`

const jsonServer = jserv.create()
const jsonServerMiddlewares = jserv.defaults()


async function jsonServer_() {
    jsonServer.use(jsonServerMiddlewares)

    jsonServer.use((req, res, next) => {
        var accessingIP = req._remoteAddress;
        var accessedPN = req.originalUrl;
        if ($.modules.database.lockdown) {
            if (accessingIP != $.router.outerIp) { // add your authorization logic here
                //if (!(accessedPN.includes("favicon.ico"))) { log(`Forbidden IP Access from ${accessingIP} to db${accessedPN}`) }
                res.send("403 | Forbidden | HASSİKTİR LAN ORDAN")
            }
            else { next() }
        }
        else {
            next() // continue to JSON Server router
        }

    })
    jsonServer.use(jsonServerRouter)
    jsonServer.listen($.modules.database.port, $.modules.database.host, () => {
        console.log('JSON Server is running')
        main()
    })
}
jsonServer_()


app.use(cors());


app.use((req, res, next) => {

    next();

})


app.get('/tokenadd/:token/', async function (req, res) {
    console.log(req.params.token);
    let tkn = req.params.token
    const serversResponse = await fetch(dbsaddr).then(response => response.json()).catch(error => isError = true)
    if (!(jp.query(serversResponse, '$..id')).includes(tkn) && (tkn.length == 6)) {
        var data = {
            id: tkn,
            ignored: false,
        }
        axios.post(dbsaddr, data).catch(function (error) {
            console.log(error)
        })
        res.send(200, {
            success: true,
            message: "ADDED"
        })
    }
    else {
        res.send(200, {
            success: false,
            message: "DUPLICATE_ID"
        })
    }
})

app.get('/serverDetails/:token/', async function (req, res) { //initilize express
    let finalArr = []
    const serversResponse = await fetch(dbsaddr).then(response => response.json()).catch(error => isError = true)

    for (let i = 0; i < serversResponse.length; i++) {
        finalArr.push(`${(jp.query(serversResponse, '$..id'))[i]}`)
    }
    if (finalArr.includes(req.params.token)) {
        const serversResponse = await fetch(dbsaddr + "/" + req.params.token).then(response => response.json()).catch(error => isError = true)
        res.send(200, {
            valid: true,
            serverData: serversResponse 
        })
    }
    else {
        let scannedServer = await svScanner.scanServer(req.params.token)
        if (scannedServer.valid) {
            scannedServer = scannedServer.serverData
            axios.patch(`http://${database}/servers/${scannedServer.id}`, scannedServer).catch(function (error) {
                if (error.response.status == 404) {
                    axios.post(dbsaddr, scannedServer).catch(function (error) {
                        console.log(error)
                    })
                }
            })
            res.send(scannedServer)
        }
        else {
            res.send({
                valid: false,
                serverData: null
            })
        }
    }


})
app.get('/serverListing/', async function (req, res) { //initilize express
    let finalArr = []
    const serversResponse = await fetch(dbsaddr).then(response => response.json()).catch(error => isError = true)

    for (let i = 0; i < serversResponse.length; i++) {
        finalArr.push(`${(jp.query(serversResponse, '$..svHostName'))[i]} | ${(jp.query(serversResponse, '$..id'))[i]}`)
    }
    res.send(finalArr)
})
app.get('/tokenListing/', async function (req, res) { //initilize express
    let finalArr = []
    const serversResponse = await fetch(dbsaddr).then(response => response.json()).catch(error => isError = true)

    for (let i = 0; i < serversResponse.length; i++) {
        finalArr.push(`${(jp.query(serversResponse, '$..id'))[i]}`)
    }
    res.send(finalArr)
})
app.get('/serverList/', async function (req, res) { //initilize express
    const serversResponse = await fetch(dbsaddr).then(response => response.json()).catch(error => isError = true)
    res.send(200, { serversResponse })
})
app.get('/currentStats/', async function (req, res) { //initilize express
    const serversResponse = await fetch(dbsaddr).then(response => response.json()).catch(error => isError = true)
    res.send(200, { serversResponse })
})

app.get('/getServer/:token', async function (req, res) { //initilize express
    const serversResponse = await fetch(dbsaddr + "/" + req.params.token).then(response => response.json()).catch(error => isError = true)
    res.send(200, { serversResponse })
})

async function main() {
    await delay(500)
    let isError = false
    //const dbResponse = await fetch(`http://${database}/serverslist`).then(response => response.json()).catch(error => isError = true)
    const serversResponse = await fetch(dbsaddr).then(response => response.json()).catch(error => isError = true)
    const dbResponse = (jp.query(serversResponse, '$..id'))
    if (!isError) {
        console.log(dbResponse);
        let initiationTime = Date.now()
        for (let i = 0; i < dbResponse.length; i++) {
            let scannedServer = await svScanner.scanServer(dbResponse[i])
            if (scannedServer.valid) {
                scannedServer = scannedServer.serverData
                axios.patch(`http://${database}/servers/${scannedServer.id}`, scannedServer).catch(async function (error) {
                    if (error.response.status == 404) {
                        axios.post(dbsaddr, scannedServer).catch(function (error) {
                            console.log(error)
                        })
                        const ipqResp = await fetch(`${$.modules.serverScanner.geolocapi.host}${scannedServer.svIPAddress}${$.modules.serverScanner.geolocapi.key}`).then(response => response.json()).catch(error => isError = true)
                        axios.patch(`http://${database}/servers/${scannedServer.id}`, { ipData: ipqResp }).catch(function (error) { })
                    }
                })
                if (serversResponse[i].ipData === undefined || serversResponse[i].ipData === null) {
                    console.log("COMMENCING IP WHOIS QUERY FOR" + dbResponse[i])
                    const ipqResp = await fetch(`${$.modules.serverScanner.geolocapi.host}${scannedServer.svIPAddress}${$.modules.serverScanner.geolocapi.key}`).then(response => response.json()).catch(error => isError = true)
                    axios.patch(`http://${database}/servers/${scannedServer.id}`, { ipData: ipqResp }).catch(function (error) { })
                }
            }
            await delay($.modules.serverScanner.scanStep)
        }
        let terminationTime = Date.now()
        console.log("DONE IN :  " + (terminationTime - initiationTime))
        await delay($.modules.serverScanner.scanInterval)
        main()
        //http://api.ipstack.com/107.150.94.101?access_key=d4cf8a1b711e1edfb718d2cd00edad90&format=1

    }
    if (isError) {
        console.log("DB ERROR");
        process.exit(1)
    }

}
function gethttp(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    //console.log(xmlHttp.status)
    if (xmlHttp.status == 404) {
        return ["INVALID TOKEN, SERVER DOWN?", 404]
    }
    else {
        return JSON.parse(xmlHttp.responseText);
    }
}
app.listen($.router.endpoint.port, $.router.endpoint.host); //define which ip and port for the express to listen on.

