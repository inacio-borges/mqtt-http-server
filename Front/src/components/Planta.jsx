import React, { useState } from "react";
import { usePlantData } from "./PlantDataContext";
import "./Planta.css";
import fc302Image from "/assets/fc302.jpg";
import fc202Image from "/assets/fc202.jpg";
import cfw500Image from "/assets/cfw500.jpg";
import fc51Image from "/assets/fc51.webp";

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
  // Calcula o RPM baseado na frequência (regra de 3: 60 Hz = 1790 RPM)
  const rpm = ((frequencia || 0) * 1790) / 60;
  return (
    <div className="motor">
      <div className="motor-info">
        <div>
          <strong>{nome || "Motor"}</strong>
        </div>
        <div>Temperatura: {temperatura}°C</div>
        <div>Vibração: {vibracao} mm/s</div>
        <div>Corrente: {corrente} A</div>
        <div>RPM: {rpm.toFixed(0)}</div>
      </div>
      <img
        src={running ? "images/motor-spinning.gif" : "images/motor-stoped.png"}
        alt="Motor"
        className="motor-img"
      />
    </div>
  );
};

const getImageForInverter = (model) => {
  const images = {
    fc302: fc302Image,
    fc202: fc202Image,
    cfw500: cfw500Image,
    fc51: fc51Image,
  };
  return (
    images[model] ||
    "https://res.cloudinary.com/rsc/image/upload/b_rgb:FFFFFF,c_pad,dpr_2.625,f_auto,h_214,q_auto,w_380/c_pad,h_214,w_380/R8918833-01?pgw=1"
  );
};

const Inverter = ({ nome, temperatura, frequencia, status, model }) => (
  <div className="inverter-info">
    <img
      src={getImageForInverter(model)}
      alt="Inversor"
      className="inverter-img"
    />
    <div className="motor-info">
      <div>
        <strong>{nome || "Inversor"}</strong>
      </div>
      <div>Temperatura: {temperatura} ºC</div>
      <div>Frequência: {frequencia} Hz</div>
      <div>Status: {status}</div>
    </div>
  </div>
);

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
              // Troca para 'Ready' se status for 'Controle pronto'
              const inverterStatus = running
                ? "Run"
                : inverter.interpretedStatus &&
                  inverter.interpretedStatus.length > 0
                ? inverter.interpretedStatus[0]
                : "Desconhecido";
              const showStatus =
                inverterStatus &&
                inverterStatus
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase() === "controle pronto"
                  ? "Ready"
                  : inverterStatus;
              return (
                <div
                  key={motor.address || idx}
                  className="motor-inverter-group"
                >
                  {inverter && (
                    <Inverter
                      nome={inverter.name || `Inversor ${inverter.address}`}
                      temperatura={inverter.temperature || 0}
                      frequencia={inverter.frequency || 0}
                      status={showStatus}
                      model={inverter.model}
                    />
                  )}
                  <Motor
                    nome={motor.name || `Motor ${idx + 1}`}
                    temperatura={motor.temperature / 10}
                    vibracao={motor.vibration_x}
                    corrente={inverter ? inverter.current : 0}
                    RPM={inverter ? inverter.frequency : 0}
                    running={running}
                  />
                </div>
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
