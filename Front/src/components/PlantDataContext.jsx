import React, { createContext, useContext, useState, useEffect } from "react";

const PlantDataContext = createContext();

// Função utilitária para conversão dos valores recebidos do tópico
function convertPlantData(rawData) {
  // Fatores de conversão para cada campo (edite conforme necessário)
  const conversionFactors = {
    // Campos principais
    current_r: 0.1, // exemplo: valor inteiro * 0.1
    current_s: 0.1,
    current_t: 0.1,
    voltage_r: 0.1,
    voltage_s: 0.1,
    voltage_t: 0.1,
    // Adicione outros campos principais aqui
  };
  // Fatores para campos de inverters
  const inverterFactors = {
    frequency: 0.01, // exemplo
    voltage: 0.1,
    DcVoltage: 0.1,
    power: 0.1,
    rpm: 1,
    temperature: 0.1,
    current: 0.01,
    // Adicione outros campos de inverter aqui
  };
  // Fatores para campos de motors
  const motorFactors = {
    temperature: 0.1,
    vibration_x: 0.1,
    vibration_y: 0.1,
    vibration_z: 0.1,
    displacement_x: 0.1,
    displacement_y: 0.1,
    displacement_z: 0.1,
    // Adicione outros campos de motor aqui
  };

  const converted = { ...rawData };
  // Converte campos principais
  Object.keys(conversionFactors).forEach((key) => {
    if (converted[key] !== undefined && converted[key] !== null) {
      converted[key] = Math.round(converted[key] * conversionFactors[key] * 10) / 10;
    }
  });
  // Converte campos dos inverters
  if (Array.isArray(converted.inverters)) {
    converted.inverters = converted.inverters.map((inv) => {
      const newInv = { ...inv };
      Object.keys(inverterFactors).forEach((key) => {
        if (newInv[key] !== undefined && newInv[key] !== null) {
          newInv[key] = Math.round(newInv[key] * inverterFactors[key] * 10) / 10;
        }
      });
      return newInv;
    });
  }
  // Converte campos dos motors
  if (Array.isArray(converted.motors)) {
    converted.motors = converted.motors.map((motor) => {
      const newMotor = { ...motor };
      Object.keys(motorFactors).forEach((key) => {
        if (newMotor[key] !== undefined && newMotor[key] !== null) {
          newMotor[key] = Math.round(newMotor[key] * motorFactors[key] * 10) / 10;
        }
      });
      return newMotor;
    });
  }
  return converted;
}

export function PlantDataProvider({ children }) {
  const [data, setData] = useState({ sensors: {}, inverters: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isDev = import.meta.env.MODE === "development";
        const isPreview = import.meta.env.MODE === "preview";
        let baseUrl = "";
        if (isPreview) {
          baseUrl = "http://192.168.62.80:3000";
        } else if (isDev) {
          baseUrl = "http://192.168.62.80:3000";
        }
        // Busca dados do plant
        const plantResponse = await fetch(`${baseUrl}/api/plant`);
        const plantResult = await plantResponse.json();
        // Busca status dos inversores
        const statusResponse = await fetch(`${baseUrl}/api/status`);
        const statusResult = await statusResponse.json();
        // Mescla interpretedStatus e statusHex nos inverters
        const invertersWithStatus = (plantResult.inverters || []).map((inv) => {
          const status = statusResult.find((s) => s.address === inv.address);
          return {
            ...inv,
            statusHex: status ? status.statusHex : inv.statusHex,
            interpretedStatus: status
              ? status.interpretedStatus
              : inv.interpretedStatus,
          };
        });
        // Converte os dados recebidos usando a função utilitária
        const convertedPlant = convertPlantData(plantResult);
        setData({ ...convertedPlant, inverters: invertersWithStatus });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const interval = setInterval(fetchData, 100);
    return () => clearInterval(interval);
  }, []);

  // Exemplo dos campos disponíveis em usePlantData():
  // id
  // createdAt
  // current_r
  // current_s
  // current_t
  // voltage_r
  // voltage_s
  // voltage_t
  // dIn (array)
  // dOut (array)
  // inverters (array de objetos):
  //    - id
  //    - address
  //    - model
  //    - frequency
  //    - voltage
  //    - DcVoltage
  //    - power
  //    - rpm
  //    - temperature
  //    - current
  //    - status
  //    - faultLog (array)
  // motors (array de objetos):
  //    - id
  //    - address
  //    - name
  //    - temperature
  //    - vibration_x
  //    - vibration_y
  //    - vibration_z
  //    - displacement_x
  //    - displacement_y
  //    - displacement_z

  return (
    <PlantDataContext.Provider value={data}>
      {children}
    </PlantDataContext.Provider>
  );
}

export function usePlantData() {
  return useContext(PlantDataContext);
}
