import { Router } from "express";
import ProductManager from "../managers/productManager.js";
import { uploader } from "../utils/multer.js";

const router = Router();
const manager = new ProductManager("./src/data/products.json");

router.get("/", async (_, res) => {
  res.json(await manager.getProducts());
});

router.post("/", uploader.single("thumbnail"), async (req, res) => {
  try {
    const product = await manager.addProduct({
      ...req.body,
      thumbnail: req.file ? `/images/products/${req.file.filename}` : null
    });

    req.app.get("io").emit("updateProducts", await manager.getProducts());

    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body);

    req.app.get("io").emit("updateProducts", await manager.getProducts());

    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    await manager.deleteProduct(req.params.pid);

    req.app.get("io").emit("updateProducts", await manager.getProducts());

    res.json({ status: "ok" });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

export default router;