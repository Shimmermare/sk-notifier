const KEY_PROPERTY = 'key'
const LAST_CHAPTER_PROPERTY = 'last_chapter'

const CHAPTER_PARSE_REGEX = new RegExp('<title>(.*) : Стальные крылья: Огнем и Железом — Библиотека ponyfiction\.org<\/title>')

const API_URL = 'https://script.google.com/macros/s/AKfycbx2TW3z-ZqEoiXA4P53uJhWE2bzgGoiuAHtJioi8SsqBlaG_xV6/exec?key='
const PONYFICTION_SK_URL = 'https://ponyfiction.org/story/6196'
const PONYFICTION_SK_CHAPTER_URL = PONYFICTION_SK_URL + '/chapter/'
const SK_THUMBNAIL_URL = 'https://i.imgur.com/u42Wpf7.jpg'

const GED_INFO = {
    'name': 'Gedzerath',
    'url': 'https://tabun.everypony.ru/profile/Gedzerath/',
    'icon_url': 'https://cdn.everypony.ru/storage/00/89/15/2012/12/11/7910b4.png'
}
const EMBED_TEMPLATE = {
    'author': GED_INFO,
    'title': '**Вышла новая глава Стальных Крыльев**',
    'url': PONYFICTION_SK_URL,
    'color': 9849600,
    'fields': [],
    'image': {
        'url': SK_THUMBNAIL_URL
    },
    'footer': {
        'text': 'sk-notifier by Shimmermare'
    }
}
const WEBHOOK_TEMPLATE = {
    'username': 'Держатель в курсе',
    'avatar_url': 'https://discordemoji.com/assets/emoji/coolstorybob.png',
    'embeds': []
}


function run() {
    Logger.log('Checking for new chapters...')
    let newChapters = fetchNewChapters()
    if (newChapters.length == 0) {
        Logger.log('No new chapters found')
        return
    }
    Logger.log('{} new chapters found: {}', newChapters.length, newChapters.map(c => c.id + ": " + c.name))
    sendNewChapters(newChapters)
}

function fetchNewChapters() {
    var currentLastChapter = getCurrentLastChapter()
    let newChapters = []
    while (true) {
        let nextChapter = currentLastChapter + 1
        let url = PONYFICTION_SK_CHAPTER_URL + nextChapter
        let response = UrlFetchApp.fetch(url, {
            'muteHttpExceptions': true
        })
        if (response.getResponseCode() !== 200) {
            let respcode = response.getResponseCode()
            break
        }

        let chapter = parseChapterTitle(response.getContentText('utf-8'))
        newChapters.push({
            'id': nextChapter,
            'name': chapter
        })

        currentLastChapter = nextChapter
        Utilities.sleep(500)
    }
    setCurrentLastChapter(currentLastChapter)
    return newChapters
}

function parseChapterTitle(html) {
    var result = CHAPTER_PARSE_REGEX.exec(he.decode(html))
    if (result && result.length >= 2) {
        return result[1]
    } else {
        return 'Не получилось распарсить название главы ¯\_(ツ)_/¯'
    }
}


function sendNewChapters(newChapters) {
    let webhook = Object.assign({}, WEBHOOK_TEMPLATE)
    let embed = Object.assign({}, EMBED_TEMPLATE)
    webhook.embeds.push(embed)

    newChapters.forEach(chapter => {
        embed.fields.push({
            'name': chapter.name,
            'value': PONYFICTION_SK_CHAPTER_URL + chapter.id
        })
    })

    let response = JSON.parse(UrlFetchApp.fetch(API_URL + getProperty(KEY_PROPERTY)).getContentText('utf-8'))
    response.webhooks.forEach(url => {
        let params = {
            'method': 'POST',
            'contentType': 'application/json',
            'payload': JSON.stringify(webhook)
        }
        try {
            UrlFetchApp.fetch(url, params);
            Logger.log('Sent to webhook {}')
        } catch (e) {
            Logger.log('Can\'t send webhook {}: {}', url, e)
        }
    })
}

function getCurrentLastChapter() {
    let lastChapter = getProperty(LAST_CHAPTER_PROPERTY)
    return lastChapter ? parseInt(lastChapter) : findAndSaveLastChapter()
}

function setCurrentLastChapter(chapterId) {
    setProperty(LAST_CHAPTER_PROPERTY, chapterId.toFixed(0))
}

function findAndSaveLastChapter() {
    var chapterId = 1
    // Faking HEAD request
    let params = {
        'muteHttpExceptions': true,
        'method': 'GET',
        'headers': {
            'X-HTTP-Method-Override': 'HEAD'
        }
    }
    while (chapterId < 1000) {
        let nextChapterId = chapterId + 1
        let url = PONYFICTION_SK_CHAPTER_URL + nextChapterId
        let response = UrlFetchApp.fetch(url, params)
        if (response.getResponseCode() !== 200) {
            setProperty(LAST_CHAPTER_PROPERTY, chapterId)
            return chapterId
        }
        chapterId = nextChapterId
        Utilities.sleep(200)
    }
    setCurrentLastChapter(chapterId)
}

function getProperty(property) {
    return PropertiesService.getScriptProperties().getProperty(property)
}

function setProperty(property, value) {
    return PropertiesService.getScriptProperties().setProperty(property, value)
}