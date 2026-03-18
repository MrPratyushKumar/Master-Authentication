import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import autRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes AFTER
app.get("/", (req, res) => {
  res.send("Hello world We are on a Home Page Now!");
});

app.use("/api/auth", autRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port:${PORT}`);
});