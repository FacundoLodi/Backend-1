import Cart from "../models/cartModels.js";

export default class CartManager {
  async createCart() {
    return Cart.create({ products: [] });
  }

  async getCartById(cid) {
    const cart = await Cart.findById(cid).populate("products.product");
    return cart ? cart.toObject() : null;
  }

  async clearCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = [];
    await cart.save();
  }
}