import fs from "fs";
import { randomUUID } from "crypto";

export default class ProductManager {
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

  async getProducts() {
    return this.read();
  }

  async getProductById(id) {
    return (await this.read()).find(p => p.id === id) || null;
  }

  async addProduct(data) {
    const { title, description, code, price, stock, category, thumbnail } = data;

    if (!title || !description || !code || price == null || stock == null || !category) {
      throw new Error("Datos incompletos");
    }

    const products = await this.read();
    if (products.some(p => p.code === code)) {
      throw new Error("Código duplicado");
    }

    const product = {
      id: randomUUID(),
      title,
      description,
      code,
      price: Number(price),
      stock: Number(stock),
      category,
      thumbnail: thumbnail || null,
      status: true
    };

    products.push(product);
    await this.write(products);
    return product;
  }

  async updateProduct(id, data) {
    const products = await this.read();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Producto no encontrado");

    products[index] = {
      ...products[index],
      ...data,
      price: data.price !== undefined ? Number(data.price) : products[index].price,
      stock: data.stock !== undefined ? Number(data.stock) : products[index].stock
    };

    await this.write(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.read();
    const exists = products.some(p => p.id === id);
    if (!exists) throw new Error("Producto no encontrado");

    await this.write(products.filter(p => p.id !== id));
  }
}