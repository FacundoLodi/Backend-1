import app from "./app.js";
import { Server } from "socket.io";
import ProductManager from "./managers/productManager.js";
import { connectMongo } from "./config/mongo.js";

connectMongo();

const httpServer = app.listen(8080, () =>
  console.log("Servidor activo en puerto 8080")
);

const io = new Server(httpServer);
app.set("io", io);

const manager = new ProductManager();

io.on("connection", async socket => {
  console.log("Cliente conectado a WebSocket");

  try {
    const products = await manager.getProducts({ limit: 100 });
    socket.emit("updateProducts", products.payload); 
  } catch (error) {
    console.error("Error enviando productos por socket:", error.message);
  }
});