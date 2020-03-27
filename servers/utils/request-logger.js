const requestLogsRepo = require('../../persistence/client-requests')
const os = require('os')

async function logRequest(ctx, next) {

    try {
        const userAgent = ctx.request.headers["user-agent"]
        const shouldBeLogged = userAgent 
            && userAgent !== "ELB-HealthChecker/2.0"
            && userAgent !== "AWS Security Scanner"
            

        if(shouldBeLogged) {
            const server = os.hostname()
            const timestamp = (new Date).toISOString()
            const requestDate = timestamp.slice(0,10)
            const serverTime = `${timestamp.slice(11)}@${server}`
            clientIps = [ctx.ip].concat(ctx.ips).concat(ctx.request.headers["X-Forwarded-For"])

            const requestInfo = {
                timestamp: timestamp,
                clientIps: clientIps,
                verb: ctx.request.method,
                userAgent: userAgent || "none"
            }

            //We don't await.  Let it run in the background.
            requestLogsRepo.saveRequestHistoryEntry(
                requestDate,                
                serverTime,
                ctx.request.href,
                requestInfo
            )
        }
    } catch(err) {
        console.error("Failed to log request", err)
    }

    await next()
}

module.exports = logRequest