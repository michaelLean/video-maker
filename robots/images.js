const googleapis = require('googleapis').google
const customSearch = googleapis.customsearch('v1')
const imagedownloader = require('image-downloader')
const googleSearchCredentials = require('../credentials/google-search.json')
const state = require('./state')

async function robot() {
    const content = state.load()
    await fetchImagesOfAllSentences(content)    
    await downloadAllImages(content)    
    state.save(content);

    async function fetchImagesOfAllSentences(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)
            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            num: 2
        })
        
        if (response.data.items) {
            const imagesUrl = response.data.items.map((item) => {
                return item.link
            })
            return imagesUrl
        } else {
            return []
        }
        
    }

    async function downloadAllImages(content) {
        content.downloadedImages = []
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images
            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex];
                try {
                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error('Imagem já foi baixada')
                    }
                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    content.downloadedImages = imagesUrl
                    break
                } catch (error) {
                    console.log(`> [${sentenceIndex}][${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(url, filename) {
        return imagedownloader.image({
            url: url,
            dest: `./content/${filename}`
        })
    }    
}

module.exports = robot