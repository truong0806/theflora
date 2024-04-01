const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const db = require('../../config/db')
const { createapikey, deleteapikey } = require('../services/apikey.service')
const CartService = require('../services/cart.service')
const AccessService = require('../services/access.service')
const { ConvertToObjectId } = require('../utils/mongoose/mongoose')
const ProductFactory = require('../services/product.service')
const { findAllProducts } = require('../models/repositories/product.repo')

let apikey, user, product, productId_1, productId_2
const apiKeyPayload = ['2222', '1111', '0000']

const connectString = db.stringConnect

describe('CartService', () => {
  beforeAll(async () => {
    await mongoose.connect(connectString)
    apikey = await createapikey(apiKeyPayload)
    user = await AccessService.signUp({
      name: 'cart',
      email: `test${Math.random()}@test.com`,
      password: 'password',
      userIp: '127.0.0.1',
    })
    product = await ProductFactory.findAllProduct({
      limit: 10,
      filter: {},
    })
  })

  afterAll(async () => {
    await deleteapikey(apikey._id)
    //await AccessService.deleteShop(ConvertToObjectId(user.data.shop._id))
    await mongoose.disconnect()
    await mongoose.connection.close()
  })
  describe('addToCart', () => {
    it('should create a new cart if the user does not have an existing cart and the products are valid', async () => {
      const userId = user.data.shop._id
      const bearerToken = user.data.tokens.accessToken
      const products_1 = [
        {
          productId: product.foundProduct[0]._id.toString(),
          shopId: '65b4a038e9d92934ead5b3c5',
          quantity: 2,
        },
      ]
      const products_2 = [
        {
          productId: product.foundProduct[1]._id.toString(),
          shopId: '65b4a038e9d92934ead5b3c5',
          quantity: 4,
        },
      ]
      const productData = [products_1, products_2]
      const response = await supertest(app)
        .post('/api/v1/cart')
        .set('Authorization', `Bearer ${bearerToken}`)
        .set('x-client-id', userId)
        .set('x-api-key', apikey.key)
        .send({ products: productData })
    })

    // it('should update the cart if the user has an existing cart and the products are valid', async () => {
    //   // Arrange
    //   const userId = 'test-user-id'
    //   const products = [{ productId: 'test-product-id', quantity: 2 }]
    //   const foundCart = { cart_userId: userId, cart_products: [] }
    //   const updateCartProductQuantitySpy = jest
    //     .fn()
    //     .mockReturnValue(Promise.resolve(foundCart))
    //   const cartModelMock = { findOneAndUpdate: updateCartProductQuantitySpy }
    //   const findCartByUserIdSpy = jest
    //     .fn()
    //     .mockReturnValue(Promise.resolve(foundCart))
    //   const cartRepositoryMock = {
    //     findCartByUserId: findCartByUserIdSpy,
    //     updateCartProductQuantity: updateCartProductQuantitySpy,
    //   }
    //   const ValidateProductBeforeAddToCartSpy = jest
    //     .fn()
    //     .mockReturnValue(Promise.resolve(products))
    //   const cartService = new CartService({
    //     cartModel: cartModelMock,
    //     cartRepository: cartRepositoryMock,
    //     ValidateProductBeforeAddToCart: ValidateProductBeforeAddToCartSpy,
    //   })

    //   // Act
    //   await cartService.addToCart({ userId, products })

    //   // Assert
    //   expect(updateCartProductQuantitySpy).toHaveBeenCalledWith({
    //     userId,
    //     listProduct: products,
    //     foundCart,
    //   })
    //   expect(findCartByUserIdSpy).not.toHaveBeenCalled()
    //   expect(cartModelMock.findOneAndUpdate).not.toHaveBeenCalled()
    // })

    // it('should throw an error if the products are not valid', async () => {
    //   // Arrange
    //   const userId = 'test-user-id'
    //   const products = [{ productId: 'test-product-id', quantity: 0 }]
    //   const foundCart = null
    //   const createCartSpy = jest.fn().mockReturnValue(Promise.resolve(null))
    //   const cartModelMock = {
    //     findOneAndUpdate: jest.fn().mockReturnValue(Promise.resolve(foundCart)),
    //     create: createCartSpy,
    //   }
    //   const findCartByUserIdSpy = jest
    //     .fn()
    //     .mockReturnValue(Promise.resolve(foundCart))
    //   const cartRepositoryMock = {
    //     findCartByUserId: findCartByUserIdSpy,
    //     createCart: createCartSpy,
    //   }
    //   const ValidateProductBeforeAddToCartSpy = jest
    //     .fn()
    //     .mockReturnValue(Promise.reject(new Error('Invalid products')))
    //   const cartService = new CartService({
    //     cartModel: cartModelMock,
    //     cartRepository: cartRepositoryMock,
    //     ValidateProductBeforeAddToCart: ValidateProductBeforeAddToCartSpy,
    //   })

    //   // Act and Assert
    //   await expect(cartService.addToCart({ userId, products })).rejects.toThrow(
    //     'Invalid products',
    //   )
    //   expect(createCartSpy).not.toHaveBeenCalled()
    //   expect(findCartByUserIdSpy).not.toHaveBeenCalled()
    //   expect(cartModelMock.findOneAndUpdate).not.toHaveBeenCalled()
    // })
  })
})
