const requestHistoryRepo = require('../../persistence/client-requests')
const os = require('os')
const geoip = require('geo-from-ip')

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
            const clientIp = ctx.headers["x-forwarded-for"] || ctx.ip
            let from = "n/a"
            if(clientIp) {
                try {
                    const geo = geoip.allData(clientIp)
                    if(geo) {
                        from = {
                            continent: geo.continent,
                            country: geo.country,
                            state: geo.state,
                            city: geo.city,
                            postal: geo.postal
                        }
                    }
                } catch(geoErr) {
                    console.error("Failed to retrieve geo from ip", geoErr)
                }
            }

            const requestInfo = {
                timestamp: timestamp,
                from,
                referer: ctx.headers["referer"],
                acceptedLanguages: ctx.headers["accept-language"],
                verb: ctx.request.method,
                userAgent: userAgent || "none"
            }

            //We don't await.  Let it run in the background.
            requestHistoryRepo.saveRequestHistoryEntry(
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