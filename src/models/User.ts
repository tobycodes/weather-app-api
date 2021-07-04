import mongoose from "mongoose";
const { Schema } = mongoose;

const schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("Users", schema);

export default User;
