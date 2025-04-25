import mqttService from "../api/services/mqttService.js";

const loaders = async () => {
  try {
    // Initialize MQTT
    await mqttService;
    console.log("MQTT service initialized successfully.");

    // Continuous loop to keep the service running
    setInterval(() => {
      console.log("MQTT service is running...");
    }, 5000); // Log every 5 seconds
  } catch (error) {
    console.error("Failed to initialize MQTT service:", error);
  }
};

export default loaders;
