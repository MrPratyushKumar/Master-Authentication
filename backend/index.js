// const express = require('express'); // common js module

// ES6 module
import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import autRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello world We are on a Home Page Now!");
});

// use inbuilt  controller 
app.use("/api/auth" , autRoutes)

app.listen(3000, () => {
  connectDB();
  console.log("Server is running on port 3000");
});
