import PlantModel from "../models/plantModel.js";
import { interpretInverterStatus } from "../../utils/statusUtils.js";

let sensorData = null;
let inverterData = [];

const updateInverterData = (inverter) => {
  const index = inverterData.findIndex(
    (inv) => inv.address === inverter.address
  );
  if (index !== -1) inverterData[index] = inverter;
  else inverterData.push(inverter);
};

const savePlantData = () => {
  if (sensorData && inverterData.length > 0) {
    const plantData = {
      ...sensorData,
      inverters: inverterData,
      createdAt: new Date(),
    };
    PlantModel.save(plantData);
    console.log("Plant data saved:", plantData);
  } else {
    console.warn(
      "Incomplete data. Skipping save. Sensor data:",
      sensorData,
      "Inverter data:",
      inverterData
    );
  }
};

const SAVE_INTERVAL = 5000; // Intervalo em milissegundos (5 segundos por padrão)

const startPeriodicSave = () => {
  setInterval(() => {
    console.log("Periodic save triggered...");
    savePlantData();
  }, SAVE_INTERVAL);
};

// Inicie o loop periódico ao carregar o módulo
startPeriodicSave();

let saveTimeout;
const debounceSavePlantData = () => {
  console.log("Debouncing savePlantData...");
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    console.log("Executing savePlantData...");
    savePlantData();
  }, 1000); // Aguarda 1 segundo antes de salvar
};

const handleMqttMessage = async (topic, data) => {
  console.log(`Processing MQTT message from topic: ${topic}`);
  console.log("Received data:", data);

  if (topic.includes("sensors")) {
    sensorData = { ...data.s, id: data.id };
    console.log("Updated sensor data:", sensorData);
  } else if (topic.includes("inverters")) {
    const inverter = { ...data.i, id: data.id };
    updateInverterData(inverter);
    console.log("Updated inverter data:", inverterData);
  }

  // Save plant data with debounce
  debounceSavePlantData();
};

const getLatestPlantData = () => {
  return PlantModel.getLatest();
};

const getInverterStatus = (address) => {
  console.log("Fetching inverter status for address:", address);
  console.log("Current inverter data:", inverterData);

  const inverter = inverterData.find((inv) => inv.address === address);
  if (!inverter) throw new Error("Inverter not found");
  return {
    // ...inverter,
    statusHex: inverter.status,
    status: interpretInverterStatus(inverter.status),
  };
};

const getAllInverters = () => {
  return inverterData.map((inverter) => ({
    address: inverter.address,
    statusHex: inverter.status,
    interpretedStatus: interpretInverterStatus(inverter.status),
  }));
};

export default {
  handleMqttMessage,
  getLatestPlantData,
  getInverterStatus,
  getAllInverters,
};
