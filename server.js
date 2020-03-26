
const startResumeServer = require('./servers/resume')
const startLandingPageServer = require('./servers/landing-page')
const startBlogServer = require('./servers/blog')

const requestLogsRepo = require('./persistence/client-requests')

async function init() {
    try {

        console.log(process.env)
        try {
            await requestLogsRepo.setupTables();
        } catch(err) {
            console.error("Failed to setup request log repo", err)
        }
        await startLandingPageServer(8888)
        console.log("Landing page app served on 8888")
        await startResumeServer(8889)
        console.log("Resume app served on 8889")        
        await startBlogServer(8890)
        console.log("Blog page app served on 8890")
    } catch(err) {
        console.error("Failed to start servers", err)
    }
}

init()