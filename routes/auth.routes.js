import express from 'express'
import {
    login,
    logout,
    signup,
    getallusers,
} from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/signup', signup)

router.post('/login', login)

router.post('/logout', logout)

router.get('/getallusers', getallusers)

export default router
