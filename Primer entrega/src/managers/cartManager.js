import fs from "fs";

export default class CartManager {
  constructor(path) {
    this.path = path;
  }

  async getCarts() {
    try {
      if (!fs.existsSync(this.path)) return [];
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      throw new Error("Error al leer los carritos");
    }
  }

  async createCart() {
    try {
      const carts = await this.getCarts();

      const newCart = {
        id: Date.now().toString(),
        products: []
      };

      carts.push(newCart);
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      return newCart;
    } catch (error) {
      throw new Error("Error al crear el carrito");
    }
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(c => c.id === id);
  }

  async addProductToCart(cid, pid) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find(c => c.id === cid);

      if (!cart) return null;

      const productInCart = cart.products.find(p => p.product === pid);

      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      return cart;
    } catch (error) {
      throw new Error("Error al agregar producto al carrito");
    }
  }
}