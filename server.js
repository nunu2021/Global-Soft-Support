const express = require('express')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
require('dotenv').config()
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/global-soft-support', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
}).catch(e => console.log(e))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended : false}))
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({createdAt: 'desc'})
    res.render('articles/index', {articles: articles})
})

app.use(express.static("public"));
app.use('/articles',articleRouter)

const port = process.env.PORT || 3000;
app.listen(port);



