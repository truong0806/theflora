'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const routes = express.Router()

routes.post('/shop/signup', accessController.signUp)

module.exports = routes