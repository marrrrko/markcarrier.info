const clientRequests = require('./client-requests')
const util = require('util')
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile)

const now = new Date
clientRequests.getAllLogEntriesForMonth(now.getFullYear(), now.getMonth() + 1)
.then(function(data) {
    return writeFile("./this_month.json", JSON.stringify(data,null,"  "))
})
.then(function() {
    console.log("Done")
})
.catch(function(err) {
    console.error("Failed", err)
})