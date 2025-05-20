import mqttService from "../api/services/mqttService.js";

const loaders = async () => {
  try {
    // Initialize MQTT
    await mqttService;

    // Continuous loop to keep the service running
    setInterval(() => {}, 5000); // Log every 5 seconds
  } catch (error) {
    console.error("Failed to initialize MQTT service:", error);
  }
};

export default loaders;
