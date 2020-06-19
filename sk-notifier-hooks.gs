const KEY_PROPERTY = 'key'
const WEBHOOKS_PROPERTY = 'webhooks'

const WEBHOOK_FORMAT_REGEX = new RegExp('discord(?:app)?\.com\/api\/webhooks\/[^\/]+\/[^\/]+')

const SUCCESS_TEMPLATE = {
    'result_type': 'success',
}

const ERROR_TEMPLATE = {
    'result_type': 'error',
    'message': 'Internal error'
}

function doGet(request) {
    let validKey = getProperty(KEY_PROPERTY)
    if (!validKey) {
        Logger.log("Secret key is not set!")
        return responseJson(ERROR_TEMPLATE)
    }
    if (!request.parameter.key && request.parameter.key !== validKey) {
        let response = createError('Secret key is not set or not allowed')
        return responseJson(response)
    }

    try {} catch (e) {
        let response = createError(e)
        return responseJson(response)
    }

    let response = Object.assign({}, SUCCESS_TEMPLATE)
    response.webhooks = getWebhooks()
    return responseJson(response)
}

function doPost(request) {
    Logger.log('doPost')
    let webhook = request.postData.contents
    if (!webhook) {
        let response = createError('Webhook URL was not recieved. Use plain text to post it.')
        return responseJson(response)
    }

    try {
        addWebhook(webhook)
        let response = Object.assign({}, SUCCESS_TEMPLATE)
        response.message = 'Webhook added.'
        return responseJson(response)
    } catch (e) {
        let response = createError(e)
        return responseJson(response)
    }
}

function createError(message) {
    let error = Object.assign({}, ERROR_TEMPLATE)
    error.message = message
    return error
}

function responseJson(response) {
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON)
}

function getWebhooks() {
    let webhooks = getProperty(WEBHOOKS_PROPERTY)
    if (webhooks) {
        return JSON.parse(webhooks)
    } else {
        return []
    }
}

function addWebhook(webhook) {
    if (!WEBHOOK_FORMAT_REGEX.test(webhook)) {
        throw 'Invalid webhook URL'
    }
    let webhooks = getWebhooks()
    if (!webhooks.includes(webhook)) {
        webhooks.push(webhook)
        setProperty(WEBHOOKS_PROPERTY, JSON.stringify(webhooks))
    }
}

function getProperty(property) {
    return PropertiesService.getScriptProperties().getProperty(property)
}

function setProperty(property, value) {
    return PropertiesService.getScriptProperties().setProperty(property, value)
}