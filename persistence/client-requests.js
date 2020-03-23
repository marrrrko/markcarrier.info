const AWS = require('aws-sdk')
const config = require('config')
const os = require('os');

// AWS.config.update({
//     endpoint: "http://localhost:8000"
// })
const awsConfig = config.get("aws")
const requestLogsTableName = `${awsConfig.clusterName}-request-logs`

async function setupTables() {
    const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: awsConfig.region })
    const existingTables = await dynamodb.listTables({}).promise()
    
    if(!existingTables.TableNames.includes(requestLogsTableName)) {
        return createRequestHistoryTable(dynamodb)
    } else {
        console.log(`${requestLogsTableName} table already created`)
        return Promise.resolve()
    }
}

async function createRequestHistoryTable(dynamodb) {
    console.log(`Creating ${requestLogsTableName} table`)
    const params = {
        TableName: requestLogsTableName,
        KeySchema: [
            { AttributeName: "yearMonth", KeyType: "HASH" },
            { AttributeName: "serverStamp", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "yearMonth", AttributeType: "S" },
            { AttributeName: "serverStamp", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    }

    return dynamodb.createTable(params).promise()
}

async function saveRequestLogEntry(yearMonth, serverStamp, requestInfo) {

    if(!yearMonth || yearMonth.length != 7 || !serverStamp || !requestInfo || !requestInfo.timestamp || !requestInfo.resource)
        throw new Error("Invalid web request log entry. Data is missing.")

    const params = {
        TableName: requestLogsTableName,
        Item: {
            yearMonth,
            serverStamp,
            requestInfo
        }
    }

    const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: awsConfig.region })
    return docClient.put(params).promise()
}

async function putSomething() {
    
    const server = os.hostname()
    const timestamp = (new Date).toISOString()
    yearMonth = timestamp.slice(0,7)
    serverStamp = `${timestamp.slice(8)}@${server}`

    return saveRequestLogEntry(
        yearMonth,
        serverStamp,
        {
            timestamp: timestamp,
            server: server,
            sourceIp: "212.253.126.111",
            resource: "something/good/?badParts=removed",
            verb: "GET",
            userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36"
        })
}

async function getAllLogEntriesForMonth(year, month) {
    const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: awsConfig.region })
    const params = {
        TableName: requestLogsTableName,
        KeyConditionExpression: "yearMonth = :ym",
        ExpressionAttributeValues: {
            ":ym": `${year}-${("0" + month).slice(-2)}`
        }
    }
    return docClient.query(params).promise()
}

async function getSomething() {
    return getAllLogEntriesForMonth((new Date).getYear() + 1900, (new Date).getMonth() + 1)
}

async function runTest() {
    await setupTables()    
    //await putSomething()
    //console.log("Something was put")
    result = await getSomething()
    console.log(JSON.stringify(result, null, " "))
}

// runTest()
// .catch((err) => {
//     console.error("Couldn't do it", err)
// })

module.exports = {
    setupTables,
    saveRequestLogEntry,
    getAllLogEntriesForMonth
}