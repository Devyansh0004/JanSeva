const router = require('express').Router()
const { sendContactMessage } = require('../controllers/contact.controller')
const { contactValidator } = require('../middlewares/validation.middleware')

router.post('/', contactValidator, sendContactMessage)

module.exports = router
