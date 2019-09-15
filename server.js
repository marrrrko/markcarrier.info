//const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const app = new Koa()

app.use(serve('dist'))

app.use(async (ctx) => {
    if(ctx.path == "/api/profile" && ctx.method == "GET") {
        ctx.body = {
            about: "I am Mark",
            experienceSections: [ { title: "Born", body: "Became human"} ],
            education: [ { title: "Kindergarten", body: "Learned to tie shoes "}]
        }
    }
})

app.use(async (ctx) => {
    if(ctx.path == "/") {
        await send("./dist/index.html")
    }
})

app.listen(8888, () => console.log("At your service!"))