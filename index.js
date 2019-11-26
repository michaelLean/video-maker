const robots = {
    user_input: require('./robots/user-input'),
    text: require('./robots/text')
}

async function start() {
    const content = {}
    await robots.user_input(content)
    await robots.text(content)
    // console.log(content)
}

start()