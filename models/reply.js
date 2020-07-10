const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurifier = require('dompurify')
const{JSDOM} = require('jsdom')
const dompurify = createDomPurifier(new JSDOM().window)

const articleSchema = new mongoose.Schema({
    desc: {
        type: String,
        required: true

    }

})

module.exports = mongoose.model('Reply', articleSchema)
