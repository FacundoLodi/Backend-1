import { Router } from "express";
import ProductManager from "../managers/productManager.js";
import CartManager from "../managers/cartManager.js";
import Ticket from "../models/ticketModel.js";

const router = Router();
const productsManager = new ProductManager();
const cartsManager = new CartManager();

router.get("/login", (req, res) => {
  res.render("login", {
    layout: "auth",
    error: req.query.error,
    success: req.query.success
  });
});

router.get("/register", (req, res) => {
  res.render("register", {
    layout: "auth",
    error: req.query.error
  });
});

router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  if (!req.session.cartId) {
    const cart = await cartsManager.createCart();
    req.session.cartId = cart._id.toString();
    res.cookie("cartId", req.session.cartId, { httpOnly: true });
  }

  const { page = 1, limit = 6, sort, query, category } = req.query;

  const result = await productsManager.getProducts({ page, limit, sort, query, category });
  const categories = await productsManager.getCategories();

  res.render("home", {
    user: req.session.user,
    cartId: req.session.cartId,
    products: result.payload,
    categories,

    page: result.page,
    totalPages: result.totalPages,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,

    query,
    category,
    sort,
    sortAsc: sort === "asc",
    sortDesc: sort === "desc"
  });
});

router.get("/profile", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const tickets = await Ticket.find({ purchaser: req.session.user.email })
    .populate("products.product")
    .sort({ purchase_datetime: -1 });

  res.render("profile", {
    user: req.session.user,
    tickets
  });
});

router.get("/cart", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const cart = await cartsManager.getCartById(req.session.cartId);

  const items = cart.products.map(item => ({
    _id: item.product._id,
    title: item.product.title,
    price: item.product.price,
    thumbnail: item.product.thumbnail,
    quantity: item.quantity,
    stock: item.product.stock,
    total: item.product.price * item.quantity
  }));

  const totalCart = items.reduce((acc, item) => acc + item.total, 0);

  res.render("cart", {
    products: items,
    totalCart,
    cartId: req.session.cartId
  });
});

router.get("/carts/:cid", async (req, res) => {
  const cart = await cartsManager.getCartById(req.params.cid);
  if (!cart) return res.send("Carrito no encontrado");

  const items = cart.products.map(item => ({
    _id: item.product._id,
    title: item.product.title,
    price: item.product.price,
    thumbnail: item.product.thumbnail,
    quantity: item.quantity,
    total: item.product.price * item.quantity
  }));

  const totalCart = items.reduce((acc, i) => acc + i.total, 0);

  res.render("cart", {
    products: items,
    totalCart,
    cartId: req.params.cid
  });
});

router.get("/products/:pid", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const product = await productsManager.getProductById(req.params.pid);

  res.render("productDetail", {
    product,
    cartId: req.session.cartId
  });
});

router.get("/realtimeproducts", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("realTimeProducts");
});

export default router;