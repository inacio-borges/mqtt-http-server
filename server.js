import http from "http";
import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = mqtt.connect("mqtt://broker.emqx.io");

let sensorData = [];
let inverterData = [];
let inverterTopic = null;
let sensorTopic = null;

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe(["global/sign_of_life"]); // Subscribe to the global topic
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    if (topic === "global/sign_of_life") {
      // Update topics dynamically from the received JSON
      inverterTopic = data.mqttTopicInverters;
      sensorTopic = data.mqttTopicSensors;

      // Subscribe to the new topics
      if (inverterTopic && sensorTopic) {
        client.subscribe([inverterTopic, sensorTopic]);
        console.log(`Subscribed to topics: ${inverterTopic}, ${sensorTopic}`);
      }
    } else if (topic === sensorTopic) {
      // Transform sensor JSON structure into expected format
      const newSensorData = {
        id: data.id,
        current_r: data.sensors.cR,
        current_s: data.sensors.cS,
        current_t: data.sensors.cT,
        voltage_r: data.sensors.vR,
        voltage_s: data.sensors.vS,
        voltage_t: data.sensors.vT,
        vibration: data.sensors.vib,
        level: data.sensors.lvl,
        created_at: new Date().toLocaleString("pt-BR"),
      };
      sensorData.push(newSensorData);
      const MAX_SENSOR_ENTRIES = 10; // Keep only the last 10 entries
      while (sensorData.length > MAX_SENSOR_ENTRIES) {
        sensorData.shift();
      }
    } else if (topic === inverterTopic) {
      // Correção do timestamp para inverterData
      data.created_at = new Date().toLocaleString("pt-BR");
      inverterData.push(data);
      // Limit inverterData array size to prevent infinite growth
      const MAX_INVERTER_ENTRIES = 4; // Adjust as needed
      if (inverterData.length > MAX_INVERTER_ENTRIES) {
        inverterData.shift();
      }
    }
    console.log(`Received data on topic ${topic}:`, data);
  } catch (error) {
    console.error("Error parsing MQTT message:", error);
  }
});

// HTTP server to handle API requests and serve static files
const server = http.createServer((req, res) => {
  const { url, method } = req;

  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers

  if (method === "OPTIONS") {
    res.writeHead(204); // Respond to preflight requests
    res.end();
    return;
  }

  // Serve static files from the 'build' directory
  const filePath = path.join(
    __dirname,
    "build",
    url === "/" ? "index.html" : url
  );
  fs.readFile(filePath, (err, data) => {
    if (!err) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".json": "application/json",
      };
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    } else if (url.startsWith("/api/")) {
      // Handle API requests
      if (method === "GET") {
        if (url === "/api/sensors") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(sensorData));
        } else if (url === "/api/inverters") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(inverterData));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not Found" }));
        }
      } else {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method Not Allowed" }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  });
});

// Start the server on a dynamic port or fallback to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
