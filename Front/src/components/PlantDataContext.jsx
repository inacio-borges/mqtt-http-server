import React, { createContext, useContext, useState, useEffect } from "react";

const PlantDataContext = createContext();

export function PlantDataProvider({ children }) {
  const [data, setData] = useState({ sensors: {}, inverters: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isDev = import.meta.env.MODE === "development";
        const baseUrl = isDev ? "http://192.168.62.80:3000" : "";
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
        setData({ ...plantResult, inverters: invertersWithStatus });
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
