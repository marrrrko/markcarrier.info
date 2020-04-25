
const startResumeServer = require('./servers/resume')
const startLandingPageServer = require('./servers/landing-page')
const startBlogServer = require('./servers/blog')
const AWS = require('aws-sdk')
const requestLogsRepo = require('./persistence/client-requests')

async function init() {
    try {
        if(process.env.CONTAINER_ID) {
            console.log(`Starting within docker container "${process.env.CONTAINER_ID}"`)
        }
        //console.log(process.env)
        try {
            if(process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
                console.log("Attempting AWS Container Auth")
                AWS.config.credentials = new AWS.ECSCredentials({
                    httpOptions: { timeout: 5000 },
                    maxRetries: 10, //
                    retryDelayOptions: { base: 200 }
                });
            }
        } catch(awsAuthErr) {
            console.error("Failed to authenticate with AWS", awsAuthErr)
        }

        try {
            await requestLogsRepo.setupTables();
        } catch(dynamoSetupErr) {
            console.error("Failed to setup dynamo db", dynamoSetupErr)
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