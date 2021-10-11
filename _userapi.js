var setTitle = require('console-title');
setTitle('AXIS PANEL USER API');
const signale = require('signale');
signale.success('INITATED USER API SUCCESSFULY.');
const app = require('express')();
const axios = require('axios');
const fetch = require('isomorphic-fetch');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require('discord.js');
const client = new Discord.Client();
var md5 = require('md5');
var crypto = require("crypto");


const localApi = `http://${config.databaseip}:3000/`

const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook("https://discord.com/api/webhooks/829024969806577714/pBXOYO38Td_DXPLe5ZqAOx4LrebTzeZySrrJZwMNemOrh3tXHWiTiRghSS4fkHxfEOwn");
const FYAChook = new Webhook("https://discord.com/api/webhooks/832149046139289601/XhL6X6BaBNTXaw7Q6FVvWNXZnFMcnrF4l1F9ks-dJE3l0TK9OmpmC7gWlFhc7q6Ayadi");
const hooks = [FYAChook]

var username = null;
var token = null;
app.get('/login/:token/', function (req, res) {
    token = req.params.token
    res.send(getAuth(token))

})

app.get('/fyacLogin/:token/', function (req, res) {
    token = req.params.token
    res.send(getFyacAuth(token))

})

app.get('/colAuthentication/:dcid/:pass', function (req, res) { //initilize express
    dcid = req.params.dcid
    pass = req.params.pass
    const authRp = httpGet(`http://${config.databaseip}:3000/colauth/${dcid}`)
    if ((authRp !== 404)){
        if((authRp.pass) === pass){
            var data = {
                valid: true,
                collection: (authRp.collection)
            }
            res.send(data)
        }
        else{
            var data = {
                valid: false,
            }
            res.send(data)
        }
    }
    else{
        var data = {
            valid: false,
        }
        res.send(data)
    }
})

app.get('/panellog/:whileTime', function (req, res) {
    whileTime = req.params.whileTime
    RDAPlogEmbed(whileTime)
    res.send(200)

})


function getAuth(token) {
    signale.pending(`Recieved token check request for ${token}`)
    let keyResponseRaw = (authGet(localApi + "auth/" + token))
    let keyResponseStatus = keyResponseRaw[0]
    let keyResponseData = keyResponseRaw[1]
    var loginData = {
        valid: keyResponseRaw[0],
        fyac: keyResponseData.fyac
    }
    console.log(keyResponseData)
    signale.pending(`Recieved | ${keyResponseStatus} | bool for ^ query.`)
    signale.pending(`Recieved | ${keyResponseData} | code for ^ query.`)
    if (keyResponseStatus) {
        signale.success(`Token ${token} passed with : ${status}. Persistent`)
        var status = (!(keyResponseData.used))
        if (!(keyResponseData.persistent)) {
            //console.log(status)
            signale.success(`Token ${token} passed with : ${status}. Killing token.`)
            logEmbed(keyResponseData.owner, token, status);
            killToken(token)
            return (loginData)
        }
        else { return (loginData) }
    }
    else { signale.error(`Token ${token} was invalid. Sent ${keyResponseStatus} as a response.`); return false }
}
function getFyacAuth(token) {
    signale.pending(`Recieved token check request for ${token}`)
    let keyResponseRaw = (authGet(localApi + "fyacAuth/" + token))
    let keyResponseStatus = keyResponseRaw[0]
    if (keyResponseStatus){
        let keyResponseData = keyResponseRaw[1]
        if (keyResponseData.valid){return true}
        else {return false}
    }
    else {return false}  
}
var cors = require('cors');

app.use(cors());
app.listen(5505, '127.0.0.1');


function webhookSend(data) {
    whCount = hooks.length;
    var i;
    for (i = 0; i < whCount; i++) {
        hooks[i].send(data)
    }
}


function RDAPlogEmbed( whileTime) {

    const embed = new MessageBuilder()
        .setTitle('L3XPANEL LOG')
        .setURL('https://l3x.xyz')
        .addField('DAWP Panel', 'RDAP taraması tamamlandı.')
        .addField('İşlem Süresi', `${whileTime / 1000} saniye`)
        .setColor('#00b0f4')
        .setTimestamp();

    webhookSend(embed)

}

function logEmbed(usr, tkn, type) {

    const embed = new MessageBuilder()
        .setTitle('L3XPANEL LOG')
        .setURL('https://l3x.xyz')
        .addField("USERNAME", `<@${usr}>`, true)
        .addField('TOKEN', tkn)
        .addField(type, "Login")
        .setColor('#00b0f4')
        .setTimestamp();

        webhookSend(embed)

}
function generateToken(tokenStyle) {
    var rano = crypto.randomBytes(20).toString('hex');
    var finalHash = (md5(rano))
    var aData = {
        id: finalHash,
        owner: tokenStyle.owner,
        fyac: tokenStyle.fyac,
        used: false,
        persistent: tokenStyle.persistent
    }
    axios({ method: 'post', url: (localApi + 'auth/'), data: aData })
        .catch(error => {
        })
        let comment = ""
        if ((tokenStyle.fyac)) { comment = comment +  (`Tokeninizde FYAC erişimi mevcuttur.`)}
        if ((tokenStyle.persistent)) { comment = comment +  (`Tokeniniz yönetici token'idir.`)}
        console.log(tokenStyle)
        return `${finalHash} | ${comment}`
}
function killToken(token) {
    axios.patch(`${localApi}auth/${token}`,
        {
            used: true,
        })
}
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}
function authGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    var st = (xmlHttp.status)
    var data = (xmlHttp.responseText)
    console.log(data)
    if (!(st == 200)) {
        return false
    }
    else {
        return [true, JSON.parse(xmlHttp.responseText)]
    }
}
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

var role = { pcid: "813332475413004288", ecid: "831544863107186758", fyacid: "742647948164333629", admin: "831544863107186758"}

client.on('message', message => {
    if (message.content.toLowerCase() === '-panellogin') {
        if ((message.member.roles.cache.has(role.pcid)) || (message.member.roles.cache.has(role.ecid))) {
            let admin = false
            let fyac = false
            let owner = (message.member.id)
            if(message.member.roles.cache.has(role.admin))  {admin = true}
            if(message.member.roles.cache.has(role.fyacid)) {fyac = true}
            let tokenStyle = {
                owner: owner,
                fyac: fyac,
                used: false,
                persistent: admin
            }
            message.reply(`Giriş tokeniniz oluşturulmuştur. Tokeniniz tek kullanımlıktır. Tokeniniz : ||${generateToken((tokenStyle))}||`)
        } else {
            message.reply(`Giriş tokeniniz oluşturulamadı. "AXIS User" rolüne sahip değilsiniz`)
        }
    }
})


client.login('ODI2MDI1MDI2NTYxMjQ1MTg0.YGGdwQ.XcrkOfCBkhK2KkpLbbEyQ_Sj-bY')