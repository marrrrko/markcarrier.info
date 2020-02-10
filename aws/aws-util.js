const AWS = require('aws-sdk')

module.exports.createAWSAPICaller = function(apiName, apiOpts) {
    const api = new AWS[apiName](apiOpts)

    return async (serviceFunctionName, params) => {
        try {
            const response = await (api[serviceFunctionName](params).promise())
            return response
        } catch (err) {
            console.log(`Failed to ${serviceFunctionName}: ${err.toString()}`)
            throw err
        }
    }
}