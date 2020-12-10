const createResumeApp = require('./servers/resume')
const createLandingPageApp = require('./servers/landing-page')
const createBlogApp = require('./servers/blog')
const AWS = require('aws-sdk')
const requestLogsRepo = require('./persistence/client-requests')
const Koa = require('koa')

function subdomain(domain, route) {
  return function* (next) {
    var s = this.subdomains[0] || ''
    if (s === domain) {
      yield route.call(this, next)
    } else {
      yield next
    }
  }
}

async function init() {
  try {
    if (process.env.CONTAINER_ID) {
      console.log(
        `Starting within docker container "${process.env.CONTAINER_ID}"`
      )
    }
    //console.log(process.env)
    try {
      if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
        console.log('Attempting AWS Container Auth')
        AWS.config.credentials = new AWS.EC2MetadataCredentials({
          httpOptions: { timeout: 5000 },
          maxRetries: 10, //
          retryDelayOptions: { base: 200 }
        })
      }
    } catch (awsAuthErr) {
      console.error('Failed to authenticate with AWS', awsAuthErr)
    }

    try {
      await requestLogsRepo.setupTables()
    } catch (dynamoSetupErr) {
      console.error('Failed to setup dynamo db', dynamoSetupErr)
    }

    let appStarts = [createBlogApp(), createResumeApp(), createLandingPageApp()]
    let [blogApp, resumeApp, landingPageApp] = await Promise.all(appStarts)

    let app = new Koa()
    app.use(subdomain('resume', resumeApp))
    app.use(subdomain('io', blogApp))
    app.use(subdomain('', landingPageApp))

    app.listen(8889, () => {
      console.log('3 apps listening on 8889')
    })
  } catch (err) {
    console.error('Failed to start servers', err)
  }
}

init()
