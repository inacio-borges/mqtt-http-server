import React, { useState } from "react";
import { usePlantData } from "./PlantDataContext";
import "./Planta.css";

const VoltageDisplay = ({ voltage }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
      {voltage.toFixed(1)} V
    </div>
  </div>
);

const CurrentDisplay = ({ current }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
      {current.toFixed(1)} A
    </div>
  </div>
);

const Motor = ({
  nome,
  temperatura,
  vibracao,
  corrente,
  frequencia,
  running,
}) => {
  return (
    <div className="motor">
      <div className="motor-info">
        <div>
          <strong>{nome || "Motor"}</strong>
        </div>
        <div>Temperatura: {temperatura}°C</div>
        <div>Vibração: {vibracao} mm/s</div>
        <div>Corrente: {corrente} A</div>
        <div>Frequência: {frequencia} Hz</div>
      </div>
      <img
        src={running ? "images/motor-spinning.gif" : "images/motor-stoped.png"}
        alt="Motor"
        className="motor-img"
      />
    </div>
  );
};

const Panel = () => {
  const data = usePlantData();
  // Pega as tensões e correntes reais do contexto, se existirem, senão usa valores padrão
  const voltages = [
    data.voltage_r || 0,
    data.voltage_s || 0,
    data.voltage_t || 0,
  ];
  const currents = [
    data.current_r || 0,
    data.current_s || 0,
    data.current_t || 0,
  ];
  const fases = ["R", "S", "T"];

  return (
    <div className="planta-panel-container">
      {/* Painel */}
      <div className="panel">
        {/* Adesivo das fases */}
        <div className="panel-fases">
          {fases.map((f, i) => (
            <div key={i} className="panel-fase">
              {f}
            </div>
          ))}
        </div>
        {/* Displays */}
        <div className="panel-displays">
          {voltages.map((v, i) => (
            <div key={i} className="panel-display">
              {v.toFixed(0)}
              <span className="panel-display-unit">V</span>
            </div>
          ))}
          {currents.map((c, i) => (
            <div key={i} className="panel-display">
              {c.toFixed(1)}
              <span className="panel-display-unit">A</span>
            </div>
          ))}
        </div>
        {/* Chave preta */}
        <div className="panel-chave-row">
          <div className="panel-chave">
            <div className="panel-chave-inner"></div>
          </div>
        </div>
      </div>
      {/* Calha visual */}
      <div className="panel-calha"></div>
    </div>
  );
};

const HomePage = () => {
  const data = usePlantData();

  // Parâmetro de ligação: mapeamento entre address do motor e do inversor
  // Exemplo: motor com address 200 está ligado ao inversor address 10
  // Ajuste conforme necessário
  const motorToInverterAddress = {
    200: 10, // Motor 1 -> Inversor 10
    201: 10, // Motor 2 -> Inversor 11 (exemplo, ajuste conforme seu sistema)
  };

  return (
    <div className="planta-root">
      <div className="planta-main-row">
        <div className="planta-panel-container">
          <Panel />
        </div>
        <div className="planta-motors-row">
          {data.motors && data.motors.length > 0 ? (
            data.motors.map((motor, idx) => {
              const inverterAddress = motorToInverterAddress[motor.address];
              const inverter =
                data.inverters &&
                data.inverters.find((inv) => inv.address === inverterAddress);
              // Debug: imprimir objeto inverter completo
              if (inverter) {
                console.log(
                  `Motor address: ${motor.address}, Inverter address: ${inverter.address}, inverter object:`,
                  inverter
                );
              } else {
                console.log(
                  `Motor address: ${motor.address}, Inverter não encontrado!`
                );
              }
              // Considera rodando se interpretedStatus contém exatamente "Em operação" (não "Sem operação")
              const running =
                inverter && Array.isArray(inverter.interpretedStatus)
                  ? inverter.interpretedStatus.some(
                      (status) =>
                        status &&
                        status
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .toLowerCase() === "em operacao"
                    )
                  : false;
              return (
                <Motor
                  key={motor.address || idx}
                  nome={motor.name || `Motor ${idx + 1}`}
                  temperatura={motor.temperature / 10}
                  vibracao={motor.vibration_x}
                  corrente={inverter.current || 0}
                  frequencia={inverter ? inverter.frequency : 0}
                  running={running}
                />
              );
            })
          ) : (
            <div>Nenhum motor encontrado</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
