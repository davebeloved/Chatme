import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./lib/connectDb.js";
import userRouter from "./routes/auth.routes.js";
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());

const __dirname = path.resolve();
// routes here
app.use("/api/auth", userRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frotend/dist")));

  app.get("*", (_, res) => {
    // res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
