import React, { createContext, useContext, useState, useEffect } from "react";

const PlantDataContext = createContext();

export function PlantDataProvider({ children }) {
  const [data, setData] = useState({ sensors: {}, inverters: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca dados do plant
        const plantResponse = await fetch(`/api/plant`);
        const plantResult = await plantResponse.json();
        // Busca status dos inversores
        const statusResponse = await fetch(`/api/status`);
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
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PlantDataContext.Provider value={data}>
      {children}
    </PlantDataContext.Provider>
  );
}

export function usePlantData() {
  return useContext(PlantDataContext);
}
