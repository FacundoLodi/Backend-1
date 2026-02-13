import { Router } from "express";
import ProductManager from "../managers/productManager.js";
import { uploader } from "../utils/multer.js";

const router = Router();
const manager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const result = await manager.getProducts(req.query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", uploader.single("thumbnail"), async (req, res) => {
  try {
    const product = await manager.addProduct({
      ...req.body,
      thumbnail: req.file ? `/images/products/${req.file.filename}` : null
    });

    const io = req.app.get("io");
    const products = await manager.getProducts({ limit: 100 });
    io.emit("updateProducts", products.payload);

    res.status(201).json({ status: "success", product });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const io = req.app.get("io");
    const products = await manager.getProducts({ limit: 100 });
    io.emit("updateProducts", products.payload);

    res.json({ status: "success", product: updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await manager.deleteProduct(req.params.pid);

    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const io = req.app.get("io");
    const products = await manager.getProducts({ limit: 100 });
    io.emit("updateProducts", products.payload);

    res.json({ status: "success" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;