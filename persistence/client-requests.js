const AWS = require('aws-sdk')
const config = require('config')
const os = require('os');
const awsConfig = config.get("aws")
const NodeCache = require("node-cache");
const historyCache = new NodeCache();

const requestHistoryTableName = `${awsConfig.clusterName}-request-history`

if (awsConfig.dynamodbEndpoint) {
    AWS.config.update({
        endpoint: awsConfig.dynamodbEndpoint
    })
}

async function setupTables() {
    const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: awsConfig.region })
    const existingTables = await dynamodb.listTables({}).promise()

    if (!existingTables.TableNames.includes(requestHistoryTableName)) {
        return createRequestHistoryTable(dynamodb)
    } else {
        console.log(`${requestHistoryTableName} table already created`)
        return Promise.resolve()
    }
}

async function createRequestHistoryTable(dynamodb) {
    console.log(`Creating ${requestHistoryTableName} table`)
    const params = {
        TableName: requestHistoryTableName,
        AttributeDefinitions: [
            { AttributeName: "requestDate", AttributeType: "S" },
            { AttributeName: "serverTime", AttributeType: "S" },
            { AttributeName: "requestUrl", AttributeType: "S" }
        ],
        KeySchema: [
            { AttributeName: "requestDate", KeyType: "HASH" },
            { AttributeName: "serverTime", KeyType: "RANGE" }
        ],
        LocalSecondaryIndexes: [
            {
                IndexName: 'RequestUrlIndex',
                KeySchema: [
                    { AttributeName: 'requestDate', KeyType: "HASH" },
                    { AttributeName: 'requestUrl', KeyType: "RANGE" }
                ],
                Projection: {
                    ProjectionType: "INCLUDE",
                    NonKeyAttributes: ['requestInfo']
                }
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    }

    return dynamodb.createTable(params).promise()
}

async function saveRequestHistoryEntry(requestDate, serverTime, requestUrl, requestInfo) {

    if (!requestDate || requestDate.length != 10 || !serverTime || !requestUrl || !requestInfo || !requestInfo.timestamp)
        throw new Error("Invalid web request history entry. Data is missing.")

    const params = {
        TableName: requestHistoryTableName,
        Item: {
            requestDate: requestDate,
            serverTime: serverTime,
            requestUrl: requestUrl,
            requestInfo
        }
    }

    const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: awsConfig.region })
    return docClient.put(params).promise()
}

async function putSomething() {

    const server = os.hostname()
    const timestamp = (new Date).toISOString()
    const requestDate = timestamp.slice(0, 10)
    const requestUrl = "https://wonderfulplace.com/something/good/?badParts=removed"
    const serverTime = `${timestamp.slice(11)}@${server}`

    return saveRequestHistoryEntry(
        requestDate,
        serverTime,
        requestUrl,
        {
            timestamp: timestamp,
            server: server,
            clientIps: ["212.253.126.111"],
            verb: "GET",
            userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36"
        })
}

async function getAllEntriesForDay(year, month, day) {

    let entries = null;

    const key = `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`
    const cachedValue = historyCache.get(key)

    if (!cachedValue) {
        const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: awsConfig.region })
        const params = {
            TableName: requestHistoryTableName,
            KeyConditionExpression: "requestDate = :ymd",
            ExpressionAttributeValues: {
                ":ymd": key
            }
        }
        entries = await docClient.query(params).promise()
        let ttl = 5
        if(new Date(year, month - 1, day) < new Date())
           ttl = 0
        historyCache.set(key, entries, ttl)
    } else {
        entries = cachedValue
    }
    return entries
}

async function getUrlEntriesForDay(year, month, day, urlStart) {
    const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: awsConfig.region })
    const params = {
        TableName: requestHistoryTableName,
        IndexName: "RequestUrlIndex",
        KeyConditionExpression: "requestDate = :ymd and begins_with(requestUrl, :url)",
        ExpressionAttributeValues: {
            ":ymd": `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`,
            ":url": urlStart
        }
    }
    return docClient.query(params).promise()
}

async function getSomething() {
    const now = new Date()
    //return getAllEntriesForDay(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())
    return getUrlEntriesForDay(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), "http:")
}

async function runTest() {
    await setupTables()
    await putSomething()
    console.log("Something was put")
    result = await getSomething()
    console.log(JSON.stringify(result, null, " "))
}

// runTest()
// .catch((err) => {
//     console.error("Couldn't do it", err)
// })

module.exports = {
    setupTables,
    saveRequestHistoryEntry,
    getAllEntriesForDay: getAllEntriesForDay,
    getUrlEntriesForDay: getUrlEntriesForDay
}