
const startResumeServer = require('./servers/resume')
const startLandingPageServer = require('./servers/landing-page')
const startBlogServer = require('./servers/blog')

async function init() {
    try {
        await startResumeServer(8888)
        console.log("Resume app served on 8888")
        await startLandingPageServer(8889)
        console.log("Landing page app served on 8889")
        await startBlogServer(8890)
        console.log("Blog page app served on 8890")
    } catch(err) {
        console.error("Failed to start servers", err)
    }
}

init()