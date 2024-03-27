describe('CartService', () => {
  describe('addToCart', () => {
    it('should update the cart if the user has an existing cart and the products are valid', async () => {
      // Arrange
      const userId = 'test-user-id';
      const products = [{ productId: 'test-product-id', quantity: 2 }];
      const foundCart = { cart_userId: userId, cart_products: [] };
      const updateCartProductQuantitySpy = jest.fn().mockReturnValue(Promise.resolve(foundCart));
      const cartModelMock = { findOneAndUpdate: updateCartProductQuantitySpy };
      const findCartByUserIdSpy = jest.fn().mockReturnValue(Promise.resolve(foundCart));
      const cartRepositoryMock = { findCartByUserId: findCartByUserIdSpy, updateCartProductQuantity: updateCartProductQuantitySpy };
      const ValidateProductBeforeAddToCartSpy = jest.fn().mockReturnValue(Promise.resolve(products));
      const cartService = new CartService({ cartModel: cartModelMock, cartRepository: cartRepositoryMock, ValidateProductBeforeAddToCart: ValidateProductBeforeAddToCartSpy });

      // Act
      await cartService.addToCart({ userId, products });

      // Assert
      expect(updateCartProductQuantitySpy).toHaveBeenCalledWith({ userId, listProduct: products, foundCart });
      expect(findCartByUserIdSpy).not.toHaveBeenCalled();
      expect(cartModelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should create a new cart if the user does not have an existing cart and the products are valid', async () => {
      // Arrange
      const userId = 'test-user-id';
      const products = [{ productId: 'test-product-id', quantity: 2 }];
      const foundCart = null;
      const createCartSpy = jest.fn().mockReturnValue(Promise.resolve({ cart_userId: userId, cart_products: [] }));
      const cartModelMock = { findOneAndUpdate: jest.fn().mockReturnValue(Promise.resolve(foundCart)), create: createCartSpy };
      const findCartByUserIdSpy = jest.fn().mockReturnValue(Promise.resolve(foundCart));
      const cartRepositoryMock = { findCartByUserId: findCartByUserIdSpy, createCart: createCartSpy };
      const ValidateProductBeforeAddToCartSpy = jest.fn().mockReturnValue(Promise.resolve(products));
      const cartService = new CartService({ cartModel: cartModelMock, cartRepository: cartRepositoryMock, ValidateProductBeforeAddToCart: ValidateProductBeforeAddToCartSpy });

      // Act
      await cartService.addToCart({ userId, products });

      // Assert
      expect(createCartSpy).toHaveBeenCalledWith({ userId, listProduct: products });
      expect(findCartByUserIdSpy).not.toHaveBeenCalled();
      expect(cartModelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw an error if the products are not valid', async () => {
      // Arrange
      const userId = 'test-user-id';
      const products = [{ productId: 'test-product-id', quantity: 0 }];
      const foundCart = null;
      const createCartSpy = jest.fn().mockReturnValue(Promise.resolve(null));
      const cartModelMock = { findOneAndUpdate: jest.fn().mockReturnValue(Promise.resolve(foundCart)), create: createCartSpy };
      const findCartByUserIdSpy = jest.fn().mockReturnValue(Promise.resolve(foundCart));
      const cartRepositoryMock = { findCartByUserId: findCartByUserIdSpy, createCart: createCartSpy };
      const ValidateProductBeforeAddToCartSpy = jest.fn().mockReturnValue(Promise.reject(new Error('Invalid products')));
      const cartService = new CartService({ cartModel: cartModelMock, cartRepository: cartRepositoryMock, ValidateProductBeforeAddToCart: ValidateProductBeforeAddToCartSpy });

      // Act and Assert
      await expect(cartService.addToCart({ userId, products })).rejects.toThrow('Invalid products');
      expect(createCartSpy).not.toHaveBeenCalled();
      expect(findCartByUserIdSpy).not.toHaveBeenCalled();
      expect(cartModelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});