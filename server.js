const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const _ = require('lodash')
//const wait = ms => new Promise((resolve)=>setTimeout(resolve, ms))

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

async function startResumeServer(port) {
    loadResumeDataFromFile()
    .then(function(resume) {
        return new Promise(function(resolve, reject) {
            try {
                let app = new Koa()
                app.use(serve('dist', {  }))
                app.use(mount('/assets', serve('dist/assets')))
                
                app.use(async (ctx, next) => {                    
                    if(!ctx.path.startsWith("/api/") && ctx.method == "GET") {
                        console.log(`Serving resume app`)
                        await send(ctx, "./dist/index.html")
                    }
                    await next()
                })
                app.use(async (ctx, next) => {
                    await next()    
                    if(ctx.path == "/api/profile" && ctx.method == "GET") {
                        //await wait(3000)
                        ctx.body = resume
                    }
                })
    
                app.listen(port, resolve)
            } catch(err) {
                console.error(err)
                reject(err)
            }
        })
    })   
}

async function startLandingPageServer(port) {
    return new Promise(function(resolve, reject) {
        try {
            let app = new Koa()
            app.use(mount('/assets', serve('dist/assets')))
            app.use(async (ctx, next) => {
                console.log(`Serving landing page`)
                await send(ctx, "./dist/assets/home.html")
            })
            app.listen(port, resolve)
        } catch(err) {
            console.error(err)
            reject(err)
        }
    })
}

async function init() {
    await startResumeServer(8888)
    console.log("Resume app served on 8888")
    await startLandingPageServer(8889)
    console.log("Landing page app served on 8889")
}

init()