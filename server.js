import express from 'express'
import { configDotenv } from 'dotenv'
import cors from 'cors'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import { connectDB } from './db/connection.js'
import authRouter from './routes/auth.routes.js'

configDotenv()
const app = express()
const server = http.createServer(app)
const io = new SocketServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
})

app.use(express.json())
app.use(
    cors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
    }),
)

const PORT = process.env.PORT || 5000

app.use('/api/auth', authRouter)

const users = {}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('register', (email) => {
        users[email] = socket.id
        console.log(
            `User with email ${email} registered with socket ID ${socket.id}`,
        )
    })

    socket.on('call-user', (data) => {
        const { email, offer } = data
        const targetSocketId = users[email]
        if (targetSocketId) {
            io.to(targetSocketId).emit('incoming-call', {
                from: socket.id,
                offer,
            })
        }
    })

    socket.on('answer-call', (data) => {
        const { to, answer } = data
        io.to(to).emit('call-answered', { from: socket.id, answer })
    })

    socket.on('send-candidate', (data) => {
        const { candidate, to } = data
        io.to(users[to]).emit('receive-candidate', { candidate })
    })

    socket.on('disconnect', () => {
        for (const [email, id] of Object.entries(users)) {
            if (id === socket.id) {
                delete users[email]
                console.log(`User with email ${email} disconnected`)
                break
            }
        }
    })
})

server.listen(PORT, () => {
    connectDB()
    console.log(`Server listening on http://localhost:${PORT}`)
})
