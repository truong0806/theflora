const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const db = require('../../config/db')
const { createProduct } = require('../services/product.service')
const { createapikey, deleteapikey } = require('../services/apikey.service')
const { signIn, signUp } = require('../services/access.service')

const connectString = db.stringConnect
const apiKeyPayload = ['2222', '1111', '0000']

const productPayload = {
  product_type: 'Clothing',
  product_name:
    'Áo Thun Nam Nữ Couple TX Relax Fit Typo Graphic Effort Do TS 329',
  product_thumb:
    'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lq8fvi9eam6q44_tn',
  product_description:
    'Áo Thun Nam Nữ Couple TX Relax Fit Typo Graphic Effort Do TS 329 với chất liệu thun cotton mềm mịn tạo cảm giác thoải mái, dễ dàng phối được với nhiều phong cách khác nhau. Hình in độc đáo, lạ mắt.',
  product_price: '239.000',
  product_quantity: '123',
  product_attributes: {
    branch: 'No branch',
    size: ['XS', 'S', 'L', 'XL'],
    metarial: 'Thun',
  },
  isPublished: true,
  isDraft: false,
}
let apikey, user, product
describe('product', () => {
  beforeAll(async () => {
    await mongoose.connect(connectString)
    apikey = await createapikey(apiKeyPayload)
    user = await signUp({
      name: 'cart',
      email: `test${Math.random()}@test.com`,
      password: 'password',
      userIp: '127.0.0.1',
    })
    productPayload.product_shop = user.data.shop._id.toString()
    product = await createProduct(productPayload.product_type, productPayload)
  })

  afterAll(async () => {
    await deleteapikey(apikey._id)
    await mongoose.disconnect()
    await mongoose.connection.close()
  })
  describe('get product route', () => {
    describe('Unauthorized', () => {
      it('should return a 401', async () => {
        const productId = '65acd807011cc3f44404a451'
        await supertest(app).get(`/api/v1/product/id/${productId}`).expect(401)
      })
    })
    describe('product id is invalid', () => {
      it('should return a 500', async () => {
        const productId = '65acd807011cc3f44404a451'
        const { statusCode } = await supertest(app)
          .get(`/api/v1/product/id/${productId}`)
          .set('x-api-key', `${apikey.key}`)
        expect(statusCode).toBe(500)
      })
    })
    describe('product id is valid', () => {
      it('should return a 200 status and the product', async () => {
        const bearerToken = user.data.tokens.accessToken
        const userId = user.data.shop._id
        const productId = product._id.toString()
        await supertest(app)
          .put('/api/v1/product/changestatus')
          .set('Authorization', `Bearer ${bearerToken}`)
          .set('x-api-key', `${apikey.key}`)
          .set('x-client-id', userId)
          .send({ product_id: productId })
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/product/id/${product._id}`)
          .set('x-api-key', `${apikey.key}`)
        expect(statusCode).toBe(200)
        expect(body.data[0]._id).toBe(product._id.toString())
      })
    })
    describe('get all product', () => {
      it('should return a 200 status and the product', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/product`)
          .set('x-api-key', `${apikey.key}`)
        expect(statusCode).toBe(200)
      })
    })
  })
})
