//const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const app = new Koa()

const wait = ms => new Promise((resolve)=>setTimeout(resolve, ms))


app.use(serve('dist', { index: "fred.html" }))
app.use(async (ctx, next) => {
    console.log(`Serving non static path "${ctx.path}"`)
    if(!ctx.path.startsWith("/api/") && ctx.method == "GET") {
        console.log("App provided")
        await send(ctx, "./dist/index.html")
    }
    await next()
})
app.use(async (ctx, next) => {
    await next()    
    if(ctx.path == "/api/profile" && ctx.method == "GET") {
        await wait(10000)
        ctx.body = {
            about: "I am Mark",
            experienceSections: [ { title: "Born", body: "Became human"} ],
            education: [ { title: "Kindergarten", body: "Learned to tie shoes "}]
        }
    }
})



app.listen(8888, () => console.log("At your service (port 8888)!!"))