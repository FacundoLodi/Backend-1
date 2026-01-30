import fs from "fs";
import { randomUUID } from "crypto";
import ProductManager from "./productManager.js";

const productManager = new ProductManager("./src/data/products.json");

export default class CartManager {
  constructor(path) {
    this.path = path;
  }

  async read() {
    if (!fs.existsSync(this.path)) return [];
    return JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
  }

  async write(data) {
    await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async getCartById(id) {
    return (await this.read()).find(c => c.id === id) || null;
  }

  async createCart() {
    const carts = await this.read();
    const cart = { id: randomUUID(), products: [] };
    carts.push(cart);
    await this.write(carts);
    return cart;
  }

  async addProduct(cid, pid) {
    const carts = await this.read();
    const cart = carts.find(c => c.id === cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const product = await productManager.getProductById(pid);
    if (!product) throw new Error("Producto inexistente");
    if (product.stock <= 0) throw new Error("Sin stock");

    const item = cart.products.find(p => p.product === pid);

    if (item) {
      if (item.quantity >= product.stock) throw new Error("Stock máximo alcanzado");
      item.quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await this.write(carts);
    return cart;
  }

  async updateQuantity(cid, pid, amount) {
    const carts = await this.read();
    const cart = carts.find(c => c.id === cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const product = await productManager.getProductById(pid);
    if (!product) throw new Error("Producto inexistente");

    const item = cart.products.find(p => p.product === pid);
    if (!item) throw new Error("Producto no está en el carrito");

    const qty = item.quantity + amount;

    if (qty > product.stock) throw new Error("Stock insuficiente");

    if (qty <= 0) {
      cart.products = cart.products.filter(p => p.product !== pid);
    } else {
      item.quantity = qty;
    }

    await this.write(carts);
    return cart;
  }

  async removeProduct(cid, pid) {
    const carts = await this.read();
    const cart = carts.find(c => c.id === cid);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = cart.products.filter(p => p.product !== pid);
    await this.write(carts);
    return cart;
  }

  async purchase(cid) {
  const carts = await this.read();
  const cart = carts.find(c => c.id === cid);
  if (!cart) throw new Error("Carrito no encontrado");
  if (!cart.products.length) throw new Error("Carrito vacío");

  for (const item of cart.products) {
    const product = await productManager.getProductById(item.product);
    if (!product) continue;

    if (item.quantity > product.stock) {
      throw new Error(`Stock insuficiente para ${product.title}`);
    }

    product.stock -= item.quantity;
    await productManager.updateProduct(product.id, { stock: product.stock });
  }

  cart.products = [];
  await this.write(carts);
}
}