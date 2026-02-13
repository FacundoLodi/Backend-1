import mongoose from "mongoose";

const MONGO_URL = "mongodb+srv://LodiF3:d0WpW6ydYT56q9qx@backend1.eoz8iuk.mongodb.net/ecommerce?retryWrites=true&w=majority";

export const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("Error conectando a Mongo:", error);
  }
};