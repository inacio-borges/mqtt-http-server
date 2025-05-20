import PlantModel from "../models/plantModel.js";
import { interpretInverterStatus } from "../../utils/statusUtils.js";

let sensorData = null;
let inverterData = {}; // Agora armazena múltiplos inversores por address
let motorData = {}; // Já armazena múltiplos motores por address

const updateInverterData = (inverter) => {
  if (inverter.address) {
    inverterData[inverter.address] = inverter;
  }
};

const savePlantData = () => {
  if (sensorData && Object.keys(inverterData).length > 0) {
    const plantData = {
      ...sensorData,
      inverters: Object.values(inverterData), // Retorna todos os inversores como array
      motors: Object.values(motorData),
      createdAt: new Date(),
    };
    PlantModel.save(plantData);
  }
};

const SAVE_INTERVAL = 5000; // Intervalo em milissegundos (5 segundos por padrão)

const startPeriodicSave = () => {
  setInterval(() => {
    savePlantData();
  }, SAVE_INTERVAL);
};

// Inicie o loop periódico ao carregar o módulo
startPeriodicSave();

let saveTimeout;
const debounceSavePlantData = () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    savePlantData();
  }, 100); // Aguarda 1 segundo antes de salvar
};

const handleMqttMessage = async (topic, data) => {
  if (topic.includes("sensors")) {
    // Atualiza para aceitar dIn e dOut
    sensorData = { ...data.s, id: data.id };
    if (data.s.dIn) sensorData.dIn = data.s.dIn;
    if (data.s.dOut) sensorData.dOut = data.s.dOut;
  } else if (topic.includes("inverters")) {
    const inverter = { ...data.i, id: data.id };
    updateInverterData(inverter);
  } else if (topic.includes("motors")) {
    // Suporte a múltiplos motores por address
    if (data.m && data.m.address) {
      motorData[data.m.address] = { ...data.m, id: data.id };
    }
  }

  // Save plant data with debounce
  debounceSavePlantData();
};

const getLatestPlantData = async () => {
  const latest = await PlantModel.getLatest();
  if (!latest) return null;
  return {
    ...latest,
    inverters: Object.values(inverterData), // Garante que retorna array
    motors: Object.values(motorData),
  };
};

const getInverterStatus = (address) => {
  const inverter = inverterData[address];
  if (!inverter) throw new Error("Inverter not found");
  return {
    statusHex: inverter.status,
    status: interpretInverterStatus(inverter.status),
  };
};

const getAllInverters = () => {
  return Object.values(inverterData).map((inverter) => ({
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
