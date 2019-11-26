const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const setenceboundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromResource(content)
    sanitizeContent(content)    
    // breakContentIntoSentences(content)

    async function fetchContentFromResource(content)  {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const resourceAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const resourceResponse = await resourceAlgorithm.pipe(content.searchTerm)
        const resourceContent = resourceResponse.get()
        content.sourceContentOriginal = resourceContent.content;
    }

    function sanitizeContent(content) {
        const withoutBlanklinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlanklinesAndMarkdown)
        content.sourceContentSanitized = withoutDatesInParentheses;

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')
            const withoutBlankLines = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })
            return withoutBlanklinesAndMarkdown.join(' ')
        }        

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }

        function breakContentIntoSentences(content) {
            content.sentences = []
            const sentences = setenceboundaryDetection.sentences(content.sourceContentSanitized)
            sentences.forEach((sentence) => {
                content.sentences.push({
                    text: sentence,
                    keywords: [],
                    images: []
                })
            })
        }
    }
}

module.exports = robot;