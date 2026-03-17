// const express = require('express'); // common js module

// ES6 module
import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import autRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello world We are on a Home Page Now!");
});

// use inbuilt  controller 
app.use("/api/auth" , autRoutes)
app.use(express.json());// allows us to parse incoming requests : req.body
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port:${PORT}`);
});
