import express from "express";
import cors from "cors";
import config from "./config";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./controllers/auth";

dotenv.config();

const init = async () => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use("/api/auth", authRoute);

  app.get("/api", (_, res) => {
    res.send("Server up and running");
  });

  await mongoose
    .connect(process.env.DATABASE_URL as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to database"))
    .catch((err) =>
      console.log(`Error connecting to the database: `, err.message)
    );

  app.listen(config.server.PORT, () =>
    console.log(`Server running on ${config.server.PORT}`)
  );
};

init();
