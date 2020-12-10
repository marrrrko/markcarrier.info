const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const _ = require('lodash')
const requestLogging = require('./utils/request-logger')

const port = 7777

runServer()

async function runServer() {
  console.log('Setting up AWS')
  await requestLogging.setupAWS()

  let app = new Koa()
  app.use(requestLogging.logRequest)
  app.use(mount('/assets', serve('dist/assets')))
  app.use(async (ctx, next) => {
    if (ctx.path == '/api/health' && ctx.method == 'GET') {
      ctx.body = {
        healthy: true
      }
    } else {
      //console.log(`Serving landing page`)
      await send(ctx, './dist/assets/home.html')
    }
  })
  app.listen(port, () => console.log(`Serving on port ${port}`))
}
