import http from 'http';
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://broker.emqx.io');

let sensorData = {};
let inverterData = [];

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(['embasa/sensors', 'embasa/inverters']);
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    if (topic === 'embasa/sensors') {
      sensorData = data;
    } else if (topic === 'embasa/inverters') {
      inverterData.push(data); // Push individual inverter data
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

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
