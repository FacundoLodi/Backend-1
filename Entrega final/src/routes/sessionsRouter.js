import { Router } from "express";
import User from "../models/userModels.js";
import Cart from "../models/cartModels.js";
import { createHash, isValidPassword } from "../utils/hash.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { first_name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.redirect("/register?error=El usuario ya existe");

    const cart = await Cart.create({ products: [] });

    await User.create({
      first_name,
      email,
      password: createHash(password),
      cart: cart._id
    });

    res.redirect("/login?success=Cuenta creada correctamente");
  } catch (error) {
    res.redirect("/register?error=Error al registrar");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("cart");
    if (!user) return res.redirect("/login?error=Usuario no existe");

    if (!isValidPassword(user, password))
      return res.redirect("/login?error=Contraseña incorrecta");

    if (!user.cart) {
      const newCart = await Cart.create({ products: [] });
      user.cart = newCart._id;
      await user.save();
    }

    req.session.user = {
      id: user._id,
      name: user.first_name,
      email: user.email,
      role: user.role
    };

    req.session.cartId = user.cart._id.toString();

    res.redirect("/");
  } catch (error) {
    res.redirect("/login?error=Error del servidor");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

export default router;