const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const _ = require('lodash')
const fs = require('fs-extra')
const requestHistoryRepo = require('../persistence/client-requests')

async function loadResumeDataFromFile() {
    const resumeJSON = await fs.readJson(__dirname + '/../resume/resume.json')
    const resume = {}
    resume.about = _.find(resumeJSON.sections, section => section.id == "about")
    resume.education = _.find(resumeJSON.sections, section => section.id == "education")
    resume.experience = _.find(resumeJSON.sections, section => section.id == "experience")
    return resume
}

module.exports = async function startResumeServer(port) {
    loadResumeDataFromFile()
        .then(function (resume) {
            return new Promise(function (resolve, reject) {
                try {
                    const app = new Koa()
                    app.use(require('./utils/request-logger'))
                    app.use(serve('dist', {}))
                    app.use(mount('/assets', serve('dist/assets')))

                    app.use(async (ctx, next) => {
                        try {
                            await next()
                            if (ctx.path == "/api/profile" && ctx.method == "GET") {
                                ctx.body = resume
                            } else if (ctx.path == "/api/traffic" && ctx.method == "GET") {
                                ctx.body = await getTraffic(ctx)
                            } else if (ctx.path == "/api/health" && ctx.method == "GET") {
                                ctx.body = {
                                    healthy: true
                                }
                            } else {
                                //console.log(`Serving resume app`)
                                await send(ctx, "./dist/index.html")
                            }
                        } catch (err) {
                            ctx.status = 500
                            ctx.body = err.toString()
                        }
                    })

                    app.listen(port, resolve)
                } catch (err) {
                    console.error(err)
                    reject(err)
                }
            })
        })
        .catch(function (err) {
            console.log("Failed to start resume server", err)
        })
}

async function getTraffic(ctx) {
    const now = new Date
    const year = ctx.request.query["year"] || now.getUTCFullYear()
    const month = ctx.request.query["month"] || now.getUTCMonth() + 1

    if (year < 1000 || year > 5000)
        throw new Error("Invalid year")

    if (month < 1 || month > 12)
        throw new Error("Invalid month")

    const days = _.range(1,32)
    const fetchAllDaysOfMonth = days.map(day => {
        return requestHistoryRepo.getAllEntriesForDay(year, month, day)
        .then(function(queryResult) {
            return {
                year,
                month,
                day,
                requests: queryResult.Items,
                total: queryResult.Items.length || 0
            }
        })
    })
    const allDays = await Promise.all(fetchAllDaysOfMonth)
    const allDaysTotals = allDays.map(dayEntries => ({
        year: dayEntries.year,
        month: dayEntries.month,
        day: dayEntries.day,
        total: dayEntries.total
    }))

    return JSON.stringify(allDaysTotals,null,1)
}