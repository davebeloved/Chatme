import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
dotenv.config();

import { connectDB } from "./lib/connectDb.js";
import userRouter from "./routes/auth.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// routes
app.use("/api/auth", userRouter);

app.get("/test", (req, res) => {
  res.send("Server is working!");
});

// production setup
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(distPath));
  console.log("Serving index from:", path.resolve(distPath, "index.html"));

  // this must come AFTER all API routes
  app.get(/^(?!\/api).*/, (_, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server is running on port ${PORT}`);
});
