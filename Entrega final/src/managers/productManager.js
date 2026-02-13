import Product from "../models/productModels.js";

export default class ProductManager {
  async getProducts({ limit = 10, page = 1, sort, query, category } = {}) {
    const filter = {};

    if (query) {
      filter.title = { $regex: query, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    const options = {
      limit: Number(limit),
      page: Number(page),
      lean: true
    };

    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    return {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage
    };
  }

  async getCategories() {
    return await Product.distinct("category");
  }

  async getProductById(id) {
    const product = await Product.findById(id).lean();
    return product || null;
  }

  async addProduct(data) {
    const product = await Product.create({
      ...data,
      price: Number(data.price),
      stock: Number(data.stock)
    });
    return product.toObject();
  }

  async updateProduct(id, data) {
    const updated = await Product.findByIdAndUpdate(id, data, {
      new: true,
      lean: true
    });
    return updated || null;
  }

  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }
}