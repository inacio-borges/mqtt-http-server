import http from "http";
import mqtt from "mqtt";
import fs, { stat } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { create } from "domain";
import { toUnicode } from "punycode";

// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateInterval = 1000; // 10 seconds

const client = mqtt.connect("mqtt://broker.emqx.io");

let sensorData;
let inverterData = []; //Array to store multiple inverters
let plantData;
let inverterTopic = "ClienteX/Instancia1/d00463004f8c/inverters";
let sensorTopic = "ClienteX/Instancia1/d00463004f8c/sensors";
let globalTopic = "global/sign_of_life";

// MQTT connection options
client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe([globalTopic, inverterTopic, sensorTopic]); // Subscribe to topics
});

// Handle connection
client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    if (topic === globalTopic) {
      console.log("plant alive");
    } else if (topic === sensorTopic) {
      const newSensorData = {
        id: data.id,
        current_r: data.s.cR,
        current_s: data.s.cS,
        current_t: data.s.cT,
        voltage_r: data.s.vR,
        voltage_s: data.s.vS,
        voltage_t: data.s.vT,
        motor_vibration_x: data.s.vibX,
        motor_vibration_y: data.s.vibY,
        motor_vibration_z: data.s.vibZ,
        motor_temperature: data.s.temp,
        level: data.s.lvl,
      };
      sensorData = newSensorData;
    } else if (topic === inverterTopic) {
      let newInverterData;

      if (data.i.m == "fc302" || data.i.m == "fc202") {
        newInverterData = {
          id: data.id,
          address: data.i.ad,
          model: data.i.m,
          frequency: parseFloat(data.i.f / 10),
          voltage: data.i.v,
          DcVoltage: data.i.dc,
          power: parseFloat(data.i.p / 100),
          rpm: data.i.rpm,
          temperature: data.i.t,
          current: parseFloat(data.i.c / 100),
          status: data.i.st,
          faultLog: data.i.flt,
        };
      } else {
        newInverterData = {
          id: data.id,
          address: data.i.ad,
          model: data.i.m,
          frequency: data.i.f / 10, // Convert to Hz
          voltage: data.i.v,
          DcVoltage: data.i.dc,
          power: data.i.p,
          rpm: data.i.rpm,
          temperature: data.i.t,
          current: data.i.c,
          status: data.i.st,
          faultLog: data.i.flt,
        };
      }

      // Update or add inverter based on address
      const existingInverterIndex = inverterData.findIndex(
        (inverter) => inverter.address === newInverterData.address
      );
      if (existingInverterIndex !== -1) {
        inverterData[existingInverterIndex] = newInverterData; // Update existing inverter
      } else {
        inverterData.push(newInverterData); // Add new inverter
      }

      // console.log("Inverter data:", inverterData);
    }
  } catch (error) {
    console.error("Error parsing MQTT message:", error);
  }
});

// Function to interpret inverter status from hex to human-readable format
// This function interprets the inverter status from a hexadecimal string to a human-readable format
function interpretInverterStatus(statusHex) {
  const status = parseInt(statusHex, 16); // Convert hex string to decimal
  const binaryStatus = status.toString(2).padStart(16, "0").split("").reverse(); // Convert to binary and reverse for bit indexing

  const statusTable = [
    ["Controle não pronto", "Controle pronto"],
    ["Drive não pronto", "Drive pronto"],
    ["Em inércia", "Habilitado"],
    ["Sem erro", "Desligamento por falha"],
    ["Sem erro", "Erro (sem desligamento)"],
    ["Reservado", "-"],
    ["Sem erro", "Bloqueio por falha"],
    ["Sem aviso", "Aviso"],
    ["Referência de velocidade #", "Velocidade = referência"],
    ["Operação local", "Controle via barramento"],
    ["Fora do limite de frequência", "Dentro do limite"],
    ["Sem operação", "Em operação"],
    ["Drive OK", "Parado, auto início"],
    ["Tensão OK", "Tensão excedida"],
    ["Torque OK", "Torque excedido"],
    ["Temporizador OK", "Tempo excedido"],
  ];

  const interpretedStatus = statusTable.map((messages, index) => {
    const bitValue = parseInt(binaryStatus[index], 10); // Get the bit value (0 or 1)
    return messages[bitValue]; // Select the corresponding message
  });

  return interpretedStatus;
}

// Function to update plant data
// This function updates the plant data object with the latest sensor and inverter data
function updatePlantData() {
  console.log("Updating plant data...");
  console.log(inverterData[0].status);
  console.log(interpretInverterStatus(inverterData[0].status)); // Example usage of interpretInverterStatus
  // Check if sensorData is available before creating plantData object
  if (!sensorData) {
    console.error("Sensor data is not available yet.");
    return;
  }
  plantData = {
    id: sensorData.id,
    inverters: inverterData, // Use the array of inverters
    current_r: sensorData.current_r,
    current_s: sensorData.current_s,
    current_t: sensorData.current_t,
    voltage_r: sensorData.voltage_r,
    voltage_s: sensorData.voltage_s,
    voltage_t: sensorData.voltage_t,
    motor_vibration_x: sensorData.motor_vibration_x,
    motor_vibration_y: sensorData.motor_vibration_y,
    motor_vibration_z: sensorData.motor_vibration_z,
    motor_temperature: sensorData.motor_temperature,
    level: sensorData.level,
    createdAt: new Date().toISOString(), // Add timestamp
  };
  // Log the plant data
  console.log("Plant data:", plantData);
}

// Run the updatePlantData function every 10 seconds (adjust as needed)
setInterval(updatePlantData, updateInterval);

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
        } else if (url.startsWith("/api/status")) {
          const queryParams = new URLSearchParams(url.split("?")[1]);
          const address = queryParams.get("address");

          if (address) {
            const inverter = inverterData.find(
              (inv) => inv.address === address
            );

            if (!inverter) {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Inverter not found" }));
              return;
            }

            const interpretedStatus = interpretInverterStatus(inverter.status);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                // id: inverter.id,
                address: inverter.address,
                rawStatus: inverter.status,
                interpretedStatus,
              })
            );
          } else {
            const allStatuses = inverterData.map((inverter) => ({
              // id: inverter.id,
              address: inverter.address,
              rawStatus: inverter.status,
              interpretedStatus: interpretInverterStatus(inverter.status),
            }));

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(allStatuses));
          }
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
