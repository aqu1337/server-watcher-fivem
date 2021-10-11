function getServerPeak(incomingPlayerCount, currentPeak, currentPlayerCount) {
    if ((currentPlayerCount) < incomingPlayerCount) {
        return incomingPlayerCount
    }
    else {
        return currentPeak
    }

}

function translateLicenseType(keyAbbr) { //the key-abbreviaton-to-readable-full-word function lol.
    if (keyAbbr == "pt") { //if key came in "pt" return "Platinum"
        return "Platinum"
    }
    else if (keyAbbr == "ag") { //if key came in "ag" return "Argentum"
        return "Argentum"
    }
    else if (keyAbbr == "au") { //if key came in "au" return "Aurum"
        return "Aurum"
    }
    else if (keyAbbr == undefined) { //if no key came in, return "N/A"
        return "N/A"
    }
}
function rAnal(resources) { //needs optimisation
    let c = 0
    let xadminsafe = true
    let utkarray = []
    let loafarray = []
    let m3array = []
    let orcaarray = []
    let esxarray = []
    let framework = "essentialmode"
    while (c < resources.length) {
        let currentResource = resources[c]
        if (currentResource.includes("xAdmin")) { xadminsafe = false }
        if (currentResource.includes("utk_")) { utkarray.push(1) }
        if (currentResource.includes("loaf_")) { loafarray.push(1) }
        if (currentResource.includes("m3_")) { m3array.push(1) }
        if (currentResource.includes("orca_")) { orcaarray.push(1) }
        if (currentResource.includes("esx_")) { esxarray.push(1) }
        if ((currentResource == "extendedmode") || (currentResource == "es_extended")) { framework = currentResource }
        c = c + 1
    }
    var raData = {
        xAdminSafe: xadminsafe,
        utkCount: arrTotal(utkarray),
        loafCount: arrTotal(loafarray),
        m3Count: arrTotal(m3array),
        orcaCount: arrTotal(orcaarray),
        esxCount: arrTotal(esxarray),
        framework: framework,
    }
    return raData
}

function processPlayerData(players) { //getting the average ping by summing all player pings by reading player arrays sequentially.
    let i = 0 //classic while loop integer
    let pingarray = [] //defining an empty array since we'll be putting each read pings here. we'll be summing it up with reduce soon.
    let droppedcountarray = [] //defining an empty array since we'll be putting each read pings here. we'll be summing it up with reduce soon.
    while (i < players.length) {      //classic while loop, it's fortunate we didnt have to also pass the http-got player count here, since player data comes in an
        //array format, and we can straight up get the length of the array.
        currentPlayer = players[i]
        currentPlayerPing = currentPlayer.ping //we had to redefine players[i] for some reason lol i'm really new to js.
        if (currentPlayerPing !== -1) {
            pingarray.push(currentPlayerPing) //pushing the just newly read player ping to an array.
        }
        if (currentPlayerPing == -1) {
            droppedcountarray.push(1)
        }
        i = i + 1 //classic while loop integer increment. i have to learn for loops soon.
    }
    let avgping = Math.round((pingarray.reduce((a, b) => a + b, 0)) / players.length) //"`reducing` i guess?" the array, getting the sum of pings and dividing that by the player count.
    let droppedcount = (droppedcountarray.reduce((a, b) => a + b, 0)) //"`reducing` i guess?" the array, getting the sum of pings and dividing that by the player count.
    let resultarray = [avgping, droppedcount]
    return (resultarray) //returning the average number, rounding it.
}

function arrTotal(arrayx) {
    let arrayTotal = (arrayx.reduce((a, b) => a + b, 0)) //"`reducing` i guess?" the array, getting the sum of pings and dividing that by the player count.
    return arrayTotal
}


module.exports = {
    getServerPeak: getServerPeak,
    translateLicenseType: translateLicenseType,
    rAnal: rAnal,
    processPlayerData: processPlayerData,
    arrTotal: arrTotal
};
