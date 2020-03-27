const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const _ = require('lodash')
const fs = require('fs-extra')

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
    .then(function(resume) {
        return new Promise(function(resolve, reject) {
            try {
                const app = new Koa()
                app.use(require('./utils/request-logger'))
                app.use(serve('dist', {  }))
                app.use(mount('/assets', serve('dist/assets')))
                
                app.use(async (ctx, next) => {
                    await next()    
                    if(ctx.path == "/api/profile" && ctx.method == "GET") {
                        ctx.body = resume
                    } else if(ctx.path == "/api/health" && ctx.method == "GET") {
                        ctx.body = {
                            healthy: true
                        }
                    } else {
                        //console.log(`Serving resume app`)
                        await send(ctx, "./dist/index.html")
                    }
                })
    
                app.listen(port, resolve)
            } catch(err) {
                console.error(err)
                reject(err)
            }
        })
    })
    .catch(function(err) {
        console.log("Failed to start resume server", err)
    })
}