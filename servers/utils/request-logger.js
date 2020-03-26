const requestLogsRepo = require('../../persistence/client-requests')
const os = require('os')

async function logRequest(ctx, next) {

    try {
        const userAgent = ctx.request.headers["user-agent"]
        const isHealthCheck = userAgent && userAgent === "ELB-HealthChecker/2.0"

        if(!isHealthCheck) {
            const server = os.hostname()
            const timestamp = (new Date).toISOString()
            yearMonth = timestamp.slice(0,7)
            serverStamp = `${timestamp.slice(8)}@${server}`
            const requestInfo = {
                timestamp: timestamp,
                server: server,
                sourceIp: ctx.ips.length > 0 ? ctx.ips[ctx.ips.length - 1] : ctx.ip,
                resource: ctx.request.href,
                verb: ctx.request.method,
                userAgent: userAgent || "none"
            }

            //We don't await.  Let it run in the background.
            requestLogsRepo.saveRequestLogEntry(
                yearMonth,
                serverStamp,
                requestInfo
            )
        }
    } catch(err) {
        console.error("Failed to log request", {
            yearMonth,
            serverStamp,
            requestInfo
        })
    }

    await next()
}

module.exports = logRequest