//const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const app = new Koa()

app.use(serve('dist'))
app.use(async (ctx) => {
    if(ctx.path == "/") {
        await send("./dist/index.html")
    }
})

app.listen(8888, () => console.log("At your service"))