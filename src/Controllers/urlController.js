const urlModel = require("../Models/urlModel");

const isValidUrl=require('valid-url')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}


const isValidRequestBody = function (request) {
    return (Object.keys(request).length > 0)
}

const urlRegex = "/(http(s)?://.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/";

const createShortUrl = async function (req, res) {
    try {
        let longUrl = req.body.longUrl

        if (!isValidRequestBody(longUrl))
            return res.status(400).send({ status: false, msg: "NO User input" })

        if (alreadyExistUrl)
            return res.status(400).send({ status: false, msg: `${longUrl} is already exist` })

        if (!isValid(longUrl))
            return res.status(400).send({ status: false, msg: "longUrl is required" })

        if (!urlRegex.test(longUrl.trim()))
            return res.status(400).send({ status: false, msg: "Please provide a valid url" })

        let baseUrl = "http://localhost:3000"

        if (!isValidUrl.isUri(baseUrl))
            return res.status(400).send({ status: false, msg: "base url is invalid" })

        if (alreadyExistUrl)
            return res.status(400).send({ status: false, msg: `${longUrl} is already exist` })

        let shortUrlCode = shortid.generate()

        const alreadyExistUrl = await urlModel.findOne({ urlCode: shortUrlCode })

        if (alreadyExistCode)
            return res.status(400).send({ status: false, msg: "short code is already exist" })

        let shortUrl = baseUrl + '/' + shortUrlCode

        const alreadyShortUrl = await urlModel.findOne({ shortUrl: shortUrl })

        if (alreadyShortUrl)
            return res.status(400).send({ status: false, msg: `${shortUrl} is  already exist` })

        const generatUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: shortUrlCode
        }

        const createUrl = await urlModel.create(generatUrl)
        return res.status(201).send({ status: false, msg:"Successfully created",data:createUrl})


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const getOriginalUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode

        if (!isValidRequestBody(urlCode))
            return res.status(400).send({ status: false, msg: "NO User input" })

        if (!isValid(urlCode))
            return res.status(400).send({ status: false, msg: "Url code is required" })

        const findUrlCode = await urlModel.findOne({ urlCode: urlCode })

        if (findUrlCode) {
            return res.status(302).redirect(findUrlCode.longUrl)
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}



module.exports.createShortUrl = createShortUrl
module.exports.getOriginalUrl = getOriginalUrl
