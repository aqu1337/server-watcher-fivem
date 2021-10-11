const fetch = require('isomorphic-fetch'); //secondary get library, not used right now.
const env = require('./env.json')
const utils = require('./ssutils.js')
const api = (env.modules.serverScanner.fivemapi.host)

async function scanServer(svt) {
    let isError = false
    const curRes = await fetch(api + svt).then(response => response.json()).catch(error => isError = true)
    if (!isError) {
        let tokenEpData = curRes
        let tokenEpUsableData = tokenEpData.Data //get the { Data: } part of the enpoint response. we'll be working on that subtree from now on.
        svHostName = (((tokenEpUsableData.hostname.slice(0, 64)).replace(/([\^\d])+/g, ""))).replace(/\[TR\]|\[SC\]|\[EU\]/g, "");
        svPlayerCount = tokenEpUsableData.clients //define player count.
        svResourceCount = tokenEpUsableData.resources.length //define resource count by getting the lengt of the resources array.
        svLicenseType = utils.translateLicenseType(tokenEpUsableData.vars.premium) //license type translation. we pass this to another function to able to get an understandable return
        svMaxPlayers = tokenEpUsableData.svMaxclients //define the server's maximum cleints
        svBoostPower = tokenEpUsableData.upvotePower //define the boost power of the server.
        svLastSeen = tokenEpUsableData.lastSeen //define last seen. this is useful to get if a server is under an attack since it'll delay heartbeats if so.
        svIPaP = tokenEpUsableData.connectEndPoints //server's ip and port. it comes in a 1.2.3.4:30120 format and we gotta split that right below and get an array of ip and port.
        let svIPaParr = svIPaP.join(" ").split(":") //splitting the returned string that's in ^ that format.
        svIPAddress = svIPaParr[0]; //server ip adress is the 1st member of the array, obviously.
        svPort = svIPaParr[1]; //server port is the 2nd member of the array, obviously.
        avgPlayerPing = utils.processPlayerData(tokenEpUsableData.players)[0] //getting the average ping. we pass this to another function to handle the math and combining everything.
        droppedPlayerCount = utils.processPlayerData(tokenEpUsableData.players)[1] //getting the average ping. we pass this to another function to handle the math and combining everything.
        rAnalysis = utils.rAnal(tokenEpUsableData.resources);
        peak = 0
        patchTime = new Date();

        var JSONData = { //building the JSON data body, this will be our return.
            valid: true,
            serverData: {
                id: svt,
                svHostName: svHostName,
                svPlayerCount: svPlayerCount,
                svResourceCount: svResourceCount,
                svLicenseType: svLicenseType,
                svMaxPlayers: svMaxPlayers,
                svBoostPower: svBoostPower,
                svLastSeen: svLastSeen,
                svIPAddress: svIPAddress,
                svPort: svPort,
                avgPlayerPing: avgPlayerPing,
                droppedPlayerCount: droppedPlayerCount,
                patchTime: patchTime,
                peak: peak,
                rAnalysis: rAnalysis
            }
        }
        return JSONData
    }
    else{
        return {
            valid: false,
            serverData: null
        }
    }
}

function ipAnalysis(ip){
    //http://api.ipstack.com/107.150.94.101?access_key=d4cf8a1b711e1edfb718d2cd00edad90&format=1
}

module.exports = {
    scanServer: scanServer
};

//pdae8a