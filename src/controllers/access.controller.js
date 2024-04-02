'use strict'
const accessService = require('../services/access.service')
const { Created, Accepted, OK } = require('../core/success.response')
const { AuthFailureError } = require('../core/error.response')
const validateFields = require('../helpers/validate')

class AccessController {
  /**
   * Register a new shop
   * @param  {object} req.body  The shop data
   * @return {object}          The newly created shop data
   */
  signUp = async (req, res, next) => {
    const { name, email, password } = req.body
    validateFields('access', req.body)
    const response = await accessService.signUp({ name, email, password })
    new Created({ data: response }).send(res)
  }

  /**
   * Get shops based on query params
   * @param  {object} req.query  The query params
   * @return {object}            The response data
   */
  getShop = async (req, res, next) => {
    const response = await accessService.getShop(req.query)
    new OK({
      data: response,
    }).send(res.set('X-Total-Count', response.count))
  }

  /**
   * Sign in a shop
   * @param  {string} req.body.email  The shop's email
   * @param  {string} req.body.password  The shop's password
   * @return {object}                 The access token
   */
  signIn = async (req, res, next) => {
    validateFields('access', { email: req.body.email })
    if (!req.body.password) {
      throw new AuthFailureError('Password is invalid')
    }
    new Accepted({
      data: await accessService.signIn(req.body),
    }).send(res)
  }

  /**
   * Sign out a shop
   * @param  {object} req.user  The shop object
   * @return {object}          The response data
   */
  signOut = async (req, res, next) => {
    new Accepted({
      data: await accessService.signOut(req.user),
    }).send(res)
  }
  /**
   * Refresh the access token
   * @param  {object} req.refreshToken  The refresh token object
   * @param  {object} req.user  The shop object
   * @param  {object} req.keyStore  The Key Store object
   * @return {object}          The response data
   */
  handlerRefeshTokenV2 = async (req, res, next) => {
    new Accepted({
      data: await accessService.handlerRefeshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res)
  }
  /**
   * Delete a shop
   * @param  {string} req.query.id  The shop ID
   * @return {object}          The response data
   */
  delete = async (req, res, next) => {
    const { id } = req.query
    new Accepted({
      data: await accessService.deleteShop(req.query),
    }).send(res)
  }
}

module.exports = new AccessController()
