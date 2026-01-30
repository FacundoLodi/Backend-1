import app from "./app.js";
import { Server } from "socket.io";
import ProductManager from "./managers/productManager.js";

const httpServer = app.listen(8080, () =>
  console.log("Servidor activo en puerto 8080")
);

const io = new Server(httpServer);
app.set("io", io);

const manager = new ProductManager("./src/data/products.json");

io.on("connection", async socket => {
  console.log("Cliente conectado a WebSocket");
  socket.emit("updateProducts", await manager.getProducts());
});