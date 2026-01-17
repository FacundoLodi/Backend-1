import fs from "fs";

export default class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getProducts() {
    try {
      if (!fs.existsSync(this.path)) return [];
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      throw new Error("Error al leer los productos");
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  async addProduct(product) {
    const { title, description, code, price, stock, category } = product;

    if (!title || !description || !code || !price || !stock || !category) {
      return null;
    }

    const products = await this.getProducts();

    const newProduct = {
      id: Date.now().toString(),
      status: true,
      ...product
    };

    products.push(newProduct);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updatedFields,
      id: products[index].id
    };

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.getProducts();
    const exists = products.some(p => p.id === id);

    if (!exists) return false;

    const filtered = products.filter(p => p.id !== id);
    await fs.promises.writeFile(this.path, JSON.stringify(filtered, null, 2));
    return true;
  }
}