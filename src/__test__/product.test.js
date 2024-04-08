const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const db = require('../../config/db')
const { createapikey, deleteapikey } = require('../services/apikey.service')
const { signUp } = require('../services/access.service')
const { faker } = require('@faker-js/faker')
const slug = require('slug')
const { Factory } = require('rosie')

const connectString = db.stringConnect
let apiKeyPayload = ['2222', '1111', '0000']

let productPayload = {
  product_type: faker.helpers.arrayElement(['Clothing', 'Electronics']),
  product_name: faker.commerce.productName(),
  product_thumb: faker.image.url(),
  product_description: faker.commerce.productDescription(),
  product_price: faker.commerce.price({ min: 1000, max: 1000000, dec: 0 }),
  product_quantity: faker.number.int({ min: 1, max: 1000 }),
  product_attributes: {
    branch: 'No branch',
    size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
    metarial: faker.helpers.arrayElement(['Cotton', 'Polyester', 'Leather']),
  },
  isPublished: false,
  isDraft: true,
}
let ProductFactory = Factory.define('product')
  .attr('id', () => faker.database.mongodbObjectId())
  .attr('product_name', () => faker.commerce.productName())
  .attr('product_thumb', () => faker.image.url())
  .attr('product_description', faker.commerce.productDescription())
  .attr('product_price', () =>
    faker.commerce.price({ min: 1000, max: 1000000, dec: 0 }),
  )
  .attr('product_quantity', () => faker.number.int({ min: 1, max: 1000 }))
  .attr('product_type', () =>
    faker.helpers.arrayElement(['Clothing', 'Electronics']),
  )

let apikey, user, product
describe('product', () => {
  beforeAll(async () => {
    await mongoose.connect(connectString)
    apikey = await createapikey(apiKeyPayload)
    user = await signUp({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      userIp: faker.internet.ip(),
    })
  })

  afterAll(async () => {
    await deleteapikey(apikey._id)
    await mongoose.disconnect()
    await mongoose.connection.close()
  })
  describe('Product route', () => {
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
    describe('create product', () => {
      it('should return a 200 status and the product', async () => {
        const bearerToken = user.data.tokens.accessToken
        const userId = user.data.shop._id
        const { statusCode, body } = await supertest(app)
          .post('/api/v1/product/create')
          .set('Authorization', `Bearer ${bearerToken}`)
          .set('x-api-key', `${apikey.key}`)
          .set('x-client-id', userId)
          .send(productPayload)
        product = body.data
        expect(statusCode).toBe(201)
        expect(body.data._id).toBe(product._id.toString())
      })
    })
    describe('change product status', () => {
      it('should return a 200 status and the product', async () => {
        const bearerToken = user.data.tokens.accessToken
        const userId = user.data.shop._id
        const productId = product._id.toString()
        const { statusCode, body } = await supertest(app)
          .put('/api/v1/product/changestatus')
          .set('Authorization', `Bearer ${bearerToken}`)
          .set('x-api-key', `${apikey.key}`)
          .set('x-client-id', userId)
          .send({ product_id: productId })
        expect(statusCode).toBe(200)
        expect(body.data.isPublished).toBe(!product.isPublished)
        expect(body.data.isDraft).toBe(!product.isDraft)
      })
    })
    describe('product id is valid', () => {
      it('should return a 200 status and the product', async () => {
        const productId = product._id.toString()
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/product/id/${productId}`)
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
    describe('get product by slug', () => {
      it('should return a 200 status and the product', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/product/${slug(product.product_name)}`)
          .set('x-api-key', `${apikey.key}`)
        expect(statusCode).toBe(200)
      })
    })
    describe('update product by id', () => {
      test('should return a 200 status and the product', async () => {
        const productId = product._id.toString()
        const bearerToken = user.data.tokens.accessToken
        const userId = user.data.shop._id
        const dataUpdate = {
          product_type: productPayload.product_type,
          product_name: faker.commerce.productName(),
          product_thumb: faker.image.url(),
          product_description: faker.commerce.productDescription(),
          product_price: faker.commerce.price({
            min: 1000,
            max: 1000000,
            dec: 0,
          }),
          product_quantity: faker.number.int({ min: 1, max: 1000 }),
        }
        const { statusCode, body } = await supertest(app)
          .patch(`/api/v1/product/update/${productId}`)
          .set('Authorization', `Bearer ${bearerToken}`)
          .set('x-api-key', `${apikey.key}`)
          .set('x-client-id', userId)
          .send(dataUpdate)
        console.log('🚀 ~ it ~ body.data:', body)
        console.log('🚀 ~ it ~ dataUpdate:', dataUpdate)
        expect(statusCode).toBe(200)
        expect(body.data.product_quantity).toBe(dataUpdate.product_quantity)
      })
      test('should throw error if product not found', async () => {
        const productId = faker.database.mongodbObjectId()
        const bearerToken = user.data.tokens.accessToken
        const userId = user.data.shop._id
        const dataUpdate = {
          product_type: productPayload.product_type,
          product_name: faker.commerce.productName(),
          product_thumb: faker.image.url(),
          product_description: faker.commerce.productDescription(),
          product_price: faker.commerce.price({
            min: 1000,
            max: 1000000,
            dec: 0,
          }),
          product_quantity: faker.number.int({ min: 1, max: 1000 }),
        }
        const { statusCode, body } = await supertest(app)
          .patch(`/api/v1/product/update/${productId}`)
          .set('Authorization', `Bearer ${bearerToken}`)
          .set('x-api-key', `${apikey.key}`)
          .set('x-client-id', userId)
          .send(dataUpdate)
        expect(statusCode).toBe(500)
        expect(body.message).toBe('Product not found')
      })
    })
    describe('Search product by key', () => {
      it('should return a 200 status and the product', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/product/search/${product.product_name.split(' ')[0]}`)
          .set('x-api-key', `${apikey.key}`)
        expect(statusCode).toBe(200)
      })
    })
    describe('Get all product', () => {
      test('should return a 200 status and the product', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/product`)
          .set('x-api-key', `${apikey.key}`)
        expect(statusCode).toBe(200)
        expect(Object.keys(body.data).length).toBeGreaterThan(0)
      })
    })
  })
})
