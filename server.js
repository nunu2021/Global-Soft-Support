const express = require('express')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')


require('dotenv').config()
const app = express()
const mongoose = require('mongoose')
const server = require('http').Server(app)


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/global-soft-support', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
}).catch(e => console.log(e))
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public')) // lets me access files from public folder
app.use(express.urlencoded({extended : true})) // bruh it was false before chatrooms
app.use(methodOverride('_method'))
app.use(express.static('node_modules'));

const rooms = {Bullying: {}, DomesticViolence: {}, MentalDepression: {}, SexualAssault:{}, Other: {}}

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({createdAt: 'desc'})
    res.render('articles/index', {articles: articles, rooms: rooms})
})



io.on('connection', socket => {
    socket.on('new-user', (room, name) => {
        socket.join(room)
        rooms[room].users[socket.id] = name
        socket.to(room).broadcast.emit('user-connected', name)
    })
    socket.on('send-chat-message', (room, message) => {
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    })
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]
        })
    })
})



app.use('/articles',articleRouter)

const port = process.env.PORT || 3000;
app.listen(port);



