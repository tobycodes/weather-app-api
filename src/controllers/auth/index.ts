import {
  loginValidationSchema,
  registerValidationSchema,
} from "./schema/validation";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import verify from "./middlewares/verify";

const router = express.Router();

router.post("/register", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (token)
    return res.status(400).send({ message: "You are already logged in" });

  const { error, value } = registerValidationSchema.validate(req.body);

  if (error) {
    return res.status(422).send(error);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value.password, salt);
    const user = new User({
      username: value.username,
      password: hashedPassword,
    });

    await user.save();
    const expiryDate = Date.now() + 60 * 60 * 24 * 7;
    const token = jwt.sign(
      { _id: user._id },
      process.env.TOKEN_SECRET as string,
      { expiresIn: expiryDate }
    );

    res.status(200).send({
      user: { username: user.username, createdAt: user.createdAt },
      token,
    });
  } catch (error) {
    if (error.code == 11000) {
      return res.status(400).send({ message: "Username already exists" });
    }
  }
});

router.post("/login", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (token)
    return res.status(400).send({ message: "You are already logged in" });

  const { error, value } = loginValidationSchema.validate(req.body);

  if (error) {
    return res.status(422).send(error);
  }

  try {
    const user = await User.findOne({ username: value.username });

    if (!user)
      return res
        .status(403)
        .send({ message: "Username or password incorrect" });

    const isValid = await bcrypt.compare(value.password, user.password);
    if (!isValid)
      return res
        .status(403)
        .send({ message: "Username or password incorrect" });

    const expiryDate = Date.now() + 60 * 60 * 24 * 7;
    const token = jwt.sign(
      { _id: user._id },
      process.env.TOKEN_SECRET as string,
      { expiresIn: expiryDate }
    );

    return res.status(200).send({ token });
  } catch (error) {
    res.send(error);
  }
});

router.post("/logout", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token)
    return res.status(400).send({ message: "You are already logged out" });

  try {
    res.send("Logged out successfully");
  } catch (error) {
    res.status(400).send({ message: "Invalid token provided" });
  }
});

router.get("/profile", verify, async (req, res) => {
  const info = (req as any).user;
  const user = await User.findOne({ _id: info._id });

  if (!user) return res.status(404).send({ message: "User not found" });

  const { username, _id, createdAt, updatedAt } = user;
  res.send({ username, id: _id, createdAt, updatedAt });
});

export default router;
