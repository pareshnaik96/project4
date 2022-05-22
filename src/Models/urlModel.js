const mongoose = require("mongoose");

let validateurl = function (longurl) {
    longurlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
    return longurlRegex.test(longurl)
}

const urlSchema = mongoose.Schema(
    {
        urlCode: {
            type: String,
            required: [true, "url is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        longUrl: {
            type: String,
            reruired: [true, "longurl is required"],
            validation: [validateurl, "please enter a valid url"]
        },
        shortUrl: {
            type: String,
            required: [true, "longurl is required"],
            unique: true
        }
    },
    { timestamps:true}

);

module.exports = mongoose.model('Url', urlSchema);

