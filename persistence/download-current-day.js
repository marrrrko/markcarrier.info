const clientRequests = require('./client-requests')
const util = require('util')
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile)

const now = new Date
clientRequests.getAllEntriesForDay(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())
.then(function(data) {
    const interestingEntries = data.Items.filter(item => 
        item.requestInfo.userAgent !== "ELB-HealthChecker/2.0" &&
        item.requestInfo.userAgent !== "AWS Security Scanner")
    return writeFile("./today.json", JSON.stringify(interestingEntries,null,"  "))
})
.then(function() {
    console.log("Done")
})
.catch(function(err) {
    console.error("Failed", err)
})