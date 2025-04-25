import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import loaders from "./loaders/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load modules (e.g., MQTT)
loaders(); // Inicializa os loaders, incluindo o serviço MQTT

// Routes
app.use("/api", routes);

export default app;
