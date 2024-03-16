'use strict'

const express = require('express')
const routes = express.Router()
const accessController = require('../../controllers/access.controller')
const {
  apiKey,
  permission,
  authentication,
  authenticationV2,
} = require('../../auth/checkAuth')

const { asyncHandler } = require('../../helpers/asyncHandler')
const { createapikey } = require('../../services/apikey.service')

routes.use(apiKey)

routes.post(
  '/createapikey',
  permission(process.env.PERMISSION_ADMIN),
  (req, res) => {
    createapikey(req.body.permissions)
    res.send('oke')
  },
)
routes.post('/signin', asyncHandler(accessController.signIn))
routes.post('/signup', asyncHandler(accessController.signUp))

routes.get('/all', asyncHandler(accessController.getShop))

routes.use(authentication)
routes.post(
  '/refreshtoken',
  asyncHandler(accessController.handlerRefeshTokenV2),
)
routes.post('/signout', asyncHandler(accessController.signOut))

routes.delete(
  '/all/:id',
  permission(process.env.PERMISSION_ADMIN),
  asyncHandler(accessController.delete),
)


module.exports = routes
