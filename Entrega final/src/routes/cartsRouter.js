import { Router } from "express";
import Cart from "../models/cartModels.js";
import Product from "../models/productModels.js";
import Ticket from "../models/ticketModel.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    const product = await Product.findById(pid);

    if (!cart || !product)
      return res.status(404).json({ error: "Datos inválidos" });

    const item = cart.products.find(p => p.product.toString() === pid);

    if (item) {
      if (item.quantity + 1 > product.stock)
        return res.status(400).json({ error: "Stock máximo alcanzado" });
      item.quantity++;
    } else {
      if (product.stock < 1)
        return res.status(400).json({ error: "Sin stock disponible" });
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.json({ status: "success" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al agregar producto" });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    const product = await Product.findById(pid);

    if (!cart || !product)
      return res.status(404).json({ error: "Datos inválidos" });

    if (quantity < 1)
      return res.status(400).json({ error: "Cantidad inválida" });

    if (quantity > product.stock)
      return res.status(400).json({ error: "Supera el stock disponible" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item)
      return res.status(404).json({ error: "Producto no está en el carrito" });

    item.quantity = quantity;
    await cart.save();

    res.json({ status: "success" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar cantidad" });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart)
      return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.json({ status: "success" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    res.json(cart);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

router.post("/:cid/purchase", async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: "Usuario no logueado" });

    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart || !cart.products.length)
      return res.status(400).json({ error: "Carrito vacío" });

    let total = 0;
    const ticketProducts = [];

    for (const item of cart.products) {
      const product = await Product.findById(item.product._id);

      if (product.stock < item.quantity)
        return res.status(400).json({ error: `Sin stock para ${product.title}` });

      product.stock -= item.quantity;
      await product.save();

      total += product.price * item.quantity;

      ticketProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const ticket = await Ticket.create({
      code: uuidv4(),
      purchaser: user.email,
      amount: total,
      products: ticketProducts
    });

    cart.products = [];
    await cart.save();

    res.json({ status: "success", ticket });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al procesar compra" });
  }
});

export default router;