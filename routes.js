const express = require('express')
const authController = require('./src/controller/AuthController')


const router = express.Router()
router.use('/auth', authController)


module.exports = router