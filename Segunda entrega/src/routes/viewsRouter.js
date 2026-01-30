import { Router } from "express";
import ProductManager from "../managers/productManager.js";
import CartManager from "../managers/cartManager.js";

const router = Router();
const products = new ProductManager("./src/data/products.json");
const carts = new CartManager("./src/data/carts.json");

router.get("/", async (req, res) => {
  if (!req.session.cartId) {
    const cart = await carts.createCart();
    req.session.cartId = cart.id;
  }

  res.render("home", {
    products: await products.getProducts()
  });
});

router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    const newCart = await carts.createCart();
    req.session.cartId = newCart.id;
  }

  const cart = await carts.getCartById(req.session.cartId);
  const list = await products.getProducts();

  const items = cart.products
    .map(i => {
      const p = list.find(x => x.id === i.product);
      if (!p) return null;

      return {
        ...p,
        quantity: i.quantity,
        total: p.price * i.quantity
      };
    })
    .filter(Boolean);

  const totalCart = items.reduce((a, b) => a + b.total, 0);

  res.render("cart", { products: items, totalCart });
});

router.get("/realtimeproducts", (_, res) => {
  res.render("realTimeProducts");
});

export default router;