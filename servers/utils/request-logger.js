const os = require('os')
const AWS = require('aws-sdk')
const requestLogsRepo = require('../../persistence/client-requests')

async function setupAWS() {
  try {
    if (process.env.CONTAINER_ID) {
      console.log(
        `Starting within docker container "${process.env.CONTAINER_ID}"`
      )
    }
    //console.log(process.env)
    try {
      console.log('Attempting AWS Container Auth')
      AWS.config.credentials = new AWS.EC2MetadataCredentials({
        httpOptions: { timeout: 5000 },
        maxRetries: 10, //
        retryDelayOptions: { base: 200 }
      })
    } catch (awsAuthErr) {
      console.error('Failed to authenticate with AWS', awsAuthErr)
    }

    try {
      await requestLogsRepo.setupTables()
    } catch (dynamoSetupErr) {
      console.error('Failed to setup dynamo db', dynamoSetupErr)
    }
  } catch (err) {
    console.error('Failed to setup AWS requirements', err)
  }
}

async function logRequest(ctx, next) {
  try {
    const userAgent = ctx.request.headers['user-agent']
    const shouldBeLogged =
      userAgent &&
      userAgent !== 'ELB-HealthChecker/2.0' &&
      userAgent !== 'AWS Security Scanner'

    if (shouldBeLogged) {
      const server = os.hostname()
      const timestamp = new Date().toISOString()
      const requestDate = timestamp.slice(0, 10)
      const serverTime = `${timestamp.slice(11)}@${server}`
      clientIps = [ctx.ip]
        .concat(ctx.ips)
        .concat(ctx.request.headers['X-Forwarded-For'])

      const requestInfo = {
        timestamp: timestamp,
        clientIps: clientIps,
        verb: ctx.request.method,
        userAgent: userAgent || 'none'
      }

      //We don't await.  Let it run in the background.
      requestLogsRepo.saveRequestHistoryEntry(
        requestDate,
        serverTime,
        ctx.request.href,
        requestInfo
      )
    }
  } catch (err) {
    console.error('Failed to log request', err)
  }

  await next()
}

module.exports = {
  logRequest,
  setupAWS
}
