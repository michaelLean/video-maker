const robots = {
    user_input: require('./robots/user-input'),
    text: require('./robots/text')
}

async function start() {
    const content = {
        maximumSentences: 7
    }
    await robots.user_input(content)
    await robots.text(content)
    console.log(JSON.stringify(content, null, 4))
}

start()