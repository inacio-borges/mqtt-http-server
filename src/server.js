import app from "./app.js";
import dotenv from "dotenv";
import path from "path";
import express from "express";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Serve static files from the dist folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "Front/dist")));

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Front/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
