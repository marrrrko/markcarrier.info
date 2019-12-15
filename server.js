const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const _ = require('lodash')
const wait = ms => new Promise((resolve)=>setTimeout(resolve, ms))

async function loadResumeDataFromFile() {
    let resumeText = await readFileAsync(__dirname + '/resume/resume.json', 'utf-8')
    let resumeJSON = JSON.parse(resumeText)
    let resume = {}
    resume.about = _.find(resumeJSON.sections, section => section.id == "about")
    resume.education = _.find(resumeJSON.sections, section => section.id == "education")
    resume.experience = _.find(resumeJSON.sections, section => section.id == "experience")
    return resume
}
function readFileAsync(filename, encoding) {
    let fs = require('fs')
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, encoding, function(err, data) {
            if(err)
                reject(err)
            else
                resolve(data)
        })
    })
}

async function startServer(resume, port) {
    return new Promise(function(resolve, reject) {
        try {
            let app = new Koa()
            app.use(serve('dist', {  }))
            app.use(mount('/assets', serve('dist/assets')))
            
            app.use(async (ctx, next) => {
                console.log(`Serving non static path "${ctx.path}"`)
                if(!ctx.path.startsWith("/api/") && ctx.method == "GET") {
                    await send(ctx, "./dist/index.html")
                }
                await next()
            })
            app.use(async (ctx, next) => {
                await next()    
                if(ctx.path == "/api/profile" && ctx.method == "GET") {
                    await wait(3000)
                    ctx.body = resume
                }
            })

            app.listen(port, () => resolve())
        } catch(err) {
            console.error(err)
            reject(err)
        }
    })
}

async function init() {
    let resumeData = await loadResumeDataFromFile()
    await startServer(resumeData, 8888)
}

init()