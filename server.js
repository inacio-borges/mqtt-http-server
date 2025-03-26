import http from 'http';
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://broker.emqx.io');

let sensorData = []; 
let inverterData = [];
let inverterTopic = 'ClienteX/Instancia1/inverters';
let sensorTopic = 'ClienteX/Instancia1/sensors';

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe([inverterTopic, sensorTopic]);
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    if (topic === sensorTopic) {
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
        created_at: new Date().toLocaleString('pt-BR')
      };
      sensorData.push(newSensorData);
      const MAX_SENSOR_ENTRIES = 10; // Keep only the last 10 entries
      while (sensorData.length > MAX_SENSOR_ENTRIES) {
        sensorData.shift();
      }
    } else if (topic === inverterTopic) {
      // Correção do timestamp para inverterData
      data.created_at = new Date().toLocaleString('pt-BR');
      inverterData.push(data);
      // Limit inverterData array size to prevent infinite growth
      const MAX_INVERTER_ENTRIES = 4; // Adjust as needed
      if (inverterData.length > MAX_INVERTER_ENTRIES) {
        inverterData.shift();
      }
    }
    console.log(`Received data on topic ${topic}:`, data);
  } catch (error) {
    console.error('Error parsing MQTT message:', error);
  }
});

// HTTP server to handle API requests
const server = http.createServer((req, res) => {
  const { url, method } = req;

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  if (method === 'OPTIONS') {
    res.writeHead(204); // Respond to preflight requests
    res.end();
    return;
  }

  if (method === 'GET') {
    if (url === '/api/sensors') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(sensorData));
    } else if (url === '/api/inverters') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(inverterData)); 
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

// Start the server on a dynamic port or fallback to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
