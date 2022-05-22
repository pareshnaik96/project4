const urlModel = require("../Models/urlModel");
const isValidUrl = require('valid-url')
const shortid = require('shortid')
const redis = require("redis");
const { promisify } = require("util");

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    return true
}


const isValidRequestBody = function (request) {
    return (Object.keys(request).length > 0)
}


//Connect to redis
const redisClient = redis.createClient(
  11456,
  "redis-11456.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("WFURhElJb5W3juyfZc0yJqICj0WkX2xZ", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const createShortUrl = async function (req, res) {
    try {
        let longUrl = req.body.longUrl
        
        if (!isValidRequestBody(longUrl))
            return res.status(400).send({ status: false, msg: "NO User input" })

        if (!isValid(longUrl))
            return res.status(400).send({ status: false, msg: "longUrl is required" })

        let baseUrl = "http://localhost:3000"

        if (!isValidUrl.isUri(baseUrl))
            return res.status(400).send({ status: false, msg: "base url is invalid" })

        let cachedUrlData = await GET_ASYNC(`${req.body.longUrl}`)

        const newData = JSON.parse(cachedUrlData)

        if (newData) {
            return res.status(200).send({ status: true, data: newData })
        }
        
        const alreadyExistUrl = await urlModel.findOne({ longUrl: longUrl }).select({_id:0, createdAt:0, updatedAt:0, __v:0})

        if (alreadyExistUrl) {

            await SET_ASYNC(`${longUrl}`, JSON.stringify(alreadyExistUrl))

            return res.status(400).send({ status: false, message: `${longUrl} is already exist` })
        }
    
        let UrlCode = shortid.generate()

        let alreadyExistcode = await urlModel.findOne({ urlCode: UrlCode })
        
        if (alreadyExistcode)
            return res.status(400).send({ status: false, msg: `${UrlCode} is already exist` })

        let shortUrl = baseUrl + '/' + shortUrlCode

        let alreadyShortUrl = await urlModel.findOne({ shortUrl: shortUrl })

        if (alreadyShortUrl)
            return res.status(400).send({ status: false, msg: `${shortUrl} is  already exist` })

        let generatUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: shortUrlCode
        }
        await urlModel.create(generatUrl)
        const createShortUrl = await urlModel.findOne({longUrl:longUrl}).select({_id:0, createdAt:0, updatedAt:0, __v:0})
        await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(createShortUrl))
        return res.status(302).send({ status: true, msg: "Successfully created", data: createShortUrl })
        

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const getUrl = async function (req, res) {
    try {
         let url =  req.params.urlCode

        let urlCode = await GET_ASYNC(`${req.params.urlCode}`)
        let newCode = JSON.parse(urlCode)

        if (newCode) {
            return res.status(302).redirect(newCode)

        }else{

        let newUrl = await urlModel.findOne({ urlCode: url })

        if (!newUrl) {
            return res.status(404).send({ status: false, message: "URL not found" })
        }else{
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(newUrl.longUrl))
            return res.status(302).redirect(newUrl.longUrl);
        }
        
     }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}



module.exports.createShortUrl = createShortUrl
module.exports.getUrl = getUrl
