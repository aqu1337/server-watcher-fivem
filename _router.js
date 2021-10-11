var setTitle = require('console-title');
setTitle('AXIS PANEL WEB ROUTER');
const signale = require('signale');
signale.success('INITATED ROUTER SUCCESSFULY.');
const app = require('express')(); //express, main websocket library.
const axios = require('axios'); //axios, secondary get-post library, not used right now.
const fetch = require('isomorphic-fetch'); //secondary get library, not used right now.
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; //XHR turns out to be way better than two of the http request libraries above, since it is not a promise-based library.
const { Webhook, MessageBuilder } = require('discord-webhook-node'); //webhook lib, reserver for future use.
var request = require('request'); //request library for http redirect tracking
const fs = require('fs');
var cors = require('cors');





const localApi = `http://${config.databaseip}:3000/`
const userApi = 'http://localhost:5505/'
const banlistApi = 'http://localhost:8415/'
const dawpAdr = 'http://localhost:8409/'

app.use(cors());

let safeURLs = ["dawpCol", "dawp", "dawpSingle", "didtofulltag", "dawpActions", "fyac/read", "auth", "banlist", "/dawpActions/overrideCol/", "imperial", "status", "frontendProxy", "fyacAuth", "collAuth", "casanova"]

function checkRequest(reqUrl) {
    console.log(reqUrl)
    let i = 0;
    let safe = true
    while (i < safeURLs.length) {
        console.log(`searching for ${safeURLs[i]}`)
        if (!(reqUrl.includes(safeURLs[i]))) {
            safe = false
        }
        else {
            safe = true
            return safe
        }
        i = i + 1
    }
    return safe
}

app.use((req, res, next) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var accessedPN = req.originalUrl;
    var accesstype = req.method
    //console.log(req)
    res.setHeader('Acces-Control-Allow-Origin', '*');
    res.setHeader('Acces-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Acces-Contorl-Allow-Methods', 'Content-Type', 'Authorization');

    if (!(checkRequest(accessedPN))) {
        log(` SUSPICIOUS: ${accesstype} | IP Access from ${ip} to ${accessedPN}`)
        res.send("Siktir lan :D gel ağla :  https://discord.gg/C3EuKSZRNP ")
    }
    else {
        log(` ${accesstype} | IP Access from ${ip} to ${accessedPN}`)
    }

    next();

})

app.get('/status/', function (req, res) {
    let status = true
    if (status) { res.send(200) }
})

app.get('/ephesus/didtofulltag/:id', function (req, res) { //initilize express
    const options = {
        method: 'GET',
        url: 'https://discord.com/api/users/' + req.params.id,
        headers: {
          cookie: '__dcfduid=f0f56d12da3d4d7c900fe3c40e06a844',
          'Content-Type': 'application/json',
          Authorization: 'Bot ODI2MDI1MDI2NTYxMjQ1MTg0.YGGdwQ.XcrkOfCBkhK2KkpLbbEyQ_Sj-bY'
        }
      };
      
      axios.request(options).then(function (response) {
        res.send(response.data);
      }).catch(function (error) {
        console.error(error);
      });
})
app.get('/frontendProxy/:token/', function (req, res) { //initilize express
    token = req.params.token // get the value of :token/ 
    res.send(gethttp(`https://servers-frontend.fivem.net/api/servers/single/${token}`))
})


app.get('/dawp/:type/', function (req, res) { //initilize express
    rqtype = req.params.type // get the value of :token/ 
    res.send(gethttp(localApi + rqtype))
})
app.get('/dawpCol/:colName/', function (req, res) { //initilize express
    colName = req.params.colName // get the value of :token/ 
    res.send(gethttp(`${localApi}collections/${colName}`))
})
app.get('/dawpSingle/:token/', function (req, res) { //initilize express
    token = req.params.token // get the value of :token/ 
    res.send(gethttp(`${localApi}servers/${token}`))
})
app.get('/dawpActions/add/:addToken', function (req, res) { //initilize express
    addToken = req.params.addToken
    res.send(getHttpNoJson(dawpAdr + "addServer/" + addToken))
})
app.get('/dawpActions/overrideCol/:token/:overrideName', function (req, res) { //initilize express
    token = req.params.token
    overrideName = req.params.overrideName
    svName = overrideName.replace(/%/g, " ");
    var data = {
        overrides: {
            svName: svName
        }
    }
    console.log("patching " + token + " with " + svName)
    axios.patch(`http://${config.databaseip}:3000/servers/${token}`, data)
    res.send(200)
})
app.get('/dawpActions/addColServer/:collection/:token', function (req, res) { //initilize express
    token = req.params.token
    collection = req.params.collection
    let coll_ = gethttp(`http://${config.databaseip}:3000/collections/${collection}`)
    let colserverarray = coll_.servers
    colserverarray.push(token)
    var data = {
        servers: colserverarray
    }
    axios.patch(`http://${config.databaseip}:3000/collections/${collection}`, data)
    res.send(200)
})
app.get('/dawpActions/remColServer/:collection/:token', function (req, res) { //initilize express
    token = req.params.token
    collection = req.params.collection
    let coll_ = gethttp(`http://${config.databaseip}:3000/collections/${collection}`)
    let colserverarray = coll_.servers
    colserverarray = colserverarray.filter(e => e !== token); // will return ['A', 'C']
    var data = {
        servers: colserverarray
    }
    axios.patch(`http://${config.databaseip}:3000/collections/${collection}`, data)
    res.send(200)
})
app.get('/banlist/:apireq', function (req, res) { //initilize express
    apireq = req.params.apireq
    res.send(getHttpNoJson(banlistApi + "fyacbanlist/" + apireq))
})
app.get('/fyac/read/:apikey/:hexid/:license', function (req, res) { //initilize express
    apikey = req.params.apikey
    if (checkFYACApiKey(apikey)) {
        hexid = req.params.hexid
        license = req.params.license
        res.send(gethttp(banlistApi + "fyaccheck/" + hexid + "/" + license))
    }
    else { res.send(403) }
})


app.get('/auth/:token', function (req, res) { //initilize express
    token = req.params.token
    res.send(getHttpNoJson(userApi + "login/" + token))
})
app.get('/fyacAuth/:token', function (req, res) { //initilize express
    token = req.params.token
    res.send(getHttpNoJson(userApi + "fyacLogin/" + token))
})

app.get('/collAuth/:dcid/:pass', function (req, res) { //initilize express
    dcid = req.params.dcid
    pass = req.params.pass
    res.send(JSON.parse(getHttpNoJson(`${userApi}colAuthentication/${dcid}/${pass}`)))
})

app.listen(80, `${config.webserverip}`); //define which ip and port for the express to listen on.


function gethttp(url) {
    var xmlHttp = new XMLHttpRequest(); xmlHttp.open("GET", url, false); xmlHttp.send(null);
    if (xmlHttp.status == 404) {
        return 404
    }
    else {
        return JSON.parse(xmlHttp.responseText);
    }
}

function checkFYACApiKey(apikey) {
    let apiKeyState = gethttp(localApi + "fyacapikeys/" + apikey)
    if (!(apikey === 404)) {
        if (apiKeyState.valid) {
            return true
        }
    }
    else {
        return false
    }
}

function getHttpNoJson(url) {
    var xmlHttp = new XMLHttpRequest(); xmlHttp.open("GET", url, false); xmlHttp.send(null);
    if (xmlHttp.status == 404) {
        return 404
    }
    else {
        return (xmlHttp.responseText);
    }
}

function log(ldata) {
    fs.appendFile('rlogs.txt', `${new Date().toLocaleString()} | ${Date.now()} : ${ldata} \n`, function (err) { if (err) throw err; });
}