import { Router } from "express";
import ProductManager from "../managers/productManager.js";

const router = Router();
const manager = new ProductManager("./src/data/products.json");

router.get("/", async (req, res) => {
  try {
    const products = await manager.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await manager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = await manager.addProduct(req.body);
    if (!newProduct) {
      return res.status(400).json({ error: "Datos del producto incompletos" });
    }
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await manager.deleteProduct(req.params.pid);
    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;