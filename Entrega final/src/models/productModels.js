import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  code: { type: String, unique: true },
  price: Number,
  stock: Number,
  category: String,
  thumbnail: String,
  status: { type: Boolean, default: true }
});

productSchema.plugin(mongoosePaginate);

export default mongoose.model("Product", productSchema);