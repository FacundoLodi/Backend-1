import { Router } from "express";
import CartManager from "../managers/cartManager.js";

const router = Router();
const manager = new CartManager("./src/data/carts.json");

router.post("/", async (req, res) => {
  try {
    const cart = await manager.createCart();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await manager.addProductToCart(
      req.params.cid,
      req.params.pid
    );

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;