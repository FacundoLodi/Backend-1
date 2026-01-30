import { Router } from "express";
import CartManager from "../managers/cartManager.js";

const router = Router();
const manager = new CartManager("./src/data/carts.json");

router.post("/add/:pid", async (req, res) => {
  try {
    const cart = await manager.addProduct(req.session.cartId, req.params.pid);
    res.json(cart);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/update/:pid", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (isNaN(amount)) throw new Error("Cantidad inválida");

    const cart = await manager.updateQuantity(
      req.session.cartId,
      req.params.pid,
      amount
    );

    res.json(cart);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/remove/:pid", async (req, res) => {
  try {
    const cart = await manager.removeProduct(req.session.cartId, req.params.pid);
    res.json(cart);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/purchase", async (req, res) => {
  try {
    await manager.purchase(req.session.cartId);
    res.json({ status: "success" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;