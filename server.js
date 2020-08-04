const express = require('express')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')


require('dotenv').config()
const app = express()
const mongoose = require('mongoose')
const server = require('http').Server(app)
const io = require('socket.io')(server)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/global-soft-support', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
}).catch(e => console.log(e))
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public')) // lets me access files from public folder
app.use(express.urlencoded({extended : true})) // bruh it was false before chatrooms
app.use(methodOverride('_method'))

const rooms = {Bullying: {}, DomesticViolence: {}, MentalDepression: {}, SexualAssault:{}, Other: {}}

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({createdAt: 'desc'})
    res.render('articles/index', {articles: articles, rooms: rooms})
})

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    res.redirect(req.body.room)
    // Send message that new room was created
    io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room })
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
function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}



app.use('/articles',articleRouter)

const port = process.env.PORT || 3000;
app.listen(port);



