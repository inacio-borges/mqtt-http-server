import React, { useState, useEffect } from "react";
import { usePlantData } from "./PlantDataContext";
import { getVibrationTotal, getVibrationRatingByClass } from "./vibrationUtils";
import "./Planta.css";
import fc302Image from "/assets/fc302.jpg";
import fc202Image from "/assets/fc202.jpg";
import cfw500Image from "/assets/cfw500.jpg";
import fc51Image from "/assets/fc51.png";

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
    </div>
  );
};

const HomePage = () => {
  const data = usePlantData();
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
              // Cálculo do status de vibração
              const vibTotal = getVibrationTotal(
                motor.vibration_x,
                motor.vibration_y,
                motor.vibration_z
              );
              // Classe do motor (fixo para "I" conforme solicitado)
              const machineClass = motor.class || "I";
              const vibRating = getVibrationRatingByClass(
                vibTotal,
                machineClass
              );
              // Status textual para lógica de cor (normal/alerta/critico)
              let vibStatus;
              if (vibRating.rating === "A" || vibRating.rating === "B") {
                vibStatus = "normal";
              } else if (vibRating.rating === "C") {
                vibStatus = "alerta";
              } else if (vibRating.rating === "D") {
                vibStatus = "critico";
              }
              // Alternância de cor para alerta (amarelo/verde) usando classe CSS
              let vibClass = "";
              if (vibStatus === "critico" || vibRating.rating === "D") {
                vibClass = " motor-info-fault";
              } else if (vibStatus === "alerta" || vibRating.rating === "C") {
                vibClass = " motor-info-alarm";
              } else if (
                vibStatus === "normal" ||
                vibRating.rating === "A" ||
                vibRating.rating === "B"
              ) {
                vibClass = " motor-info-run";
              }
              return (
                <div
                  key={motor.address || idx}
                  className={(() => {
                    let statusClass = "motor-inverter-group";
                    const status = showStatus;
                    if (status) {
                      const statusNorm = status.toString().toLowerCase();
                      if (
                        statusNorm === "run" ||
                        statusNorm === "em operação"
                      ) {
                        statusClass += " motor-info-run";
                      } else if (
                        statusNorm.includes("falha") ||
                        statusNorm.includes("erro") ||
                        statusNorm === "fault"
                      ) {
                        statusClass += " motor-info-fault";
                      } else if (
                        statusNorm.includes("alarme") ||
                        statusNorm === "alarm"
                      ) {
                        statusClass += " motor-info-alarm";
                      }
                    }
                    // Prioriza classe de vibração
                    return statusClass + vibClass;
                  })()}
                >
                  {inverter && (
                    <div className="inverter-info">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "1rem",
                        }}
                      >
                        <img
                          src={getImageForInverter(inverter.model)}
                          alt="Inversor"
                          className="inverter-img"
                        />
                        <img
                          src={
                            running
                              ? "images/motor-spinning.gif"
                              : "images/motor-stoped.png"
                          }
                          alt="Motor"
                          className="motor-img"
                        />
                      </div>
                      <div className="motor-info">
                        <div className="inverter-info-text">
                          <div>
                            <strong>{inverter.model.toUpperCase()}</strong>
                          </div>
                          <div>
                            Temp:{" "}
                            <strong>{inverter.temperature || 0} ºC</strong>
                          </div>
                          <div>
                            Ref: <strong>{inverter.frequency || 0} Hz</strong>
                          </div>
                          <div>
                            Freq: <strong>{inverter.frequency || 0} Hz</strong>
                          </div>
                          <div>
                            Stats: <strong>{showStatus}</strong>
                          </div>
                        </div>
                        <div className="motor-info-text">
                          <div>
                            <strong>{motor.name || `Motor ${idx + 1}`}</strong>
                          </div>
                          <div>
                            Temp: <strong>{motor.temperature}°C</strong>
                          </div>
                          <div
                            className={
                              vibStatus === "alerta" || vibStatus === "critico"
                                ? "vibration-blink"
                                : ""
                            }
                          >
                            Vibração:{" "}
                            <strong>{vibTotal.toFixed(2)} mm/s</strong>{" "}
                          </div>
                          <div>
                            Corrente:{" "}
                            <strong>{inverter ? inverter.current : 0} A</strong>
                          </div>
                          <div>
                            RPM:{" "}
                            <strong>
                              {inverter
                                ? (
                                    ((inverter.frequency || 0) * 1790) /
                                    60
                                  ).toFixed(0)
                                : 0}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!inverter && (
                    <div className="motor-info">
                      <div>
                        <strong>{motor.name || `Motor ${idx + 1}`}</strong>
                      </div>
                      <div>
                        Temperatura Motor:{" "}
                        <strong>{motor.temperature / 10}°C</strong>
                      </div>
                      <div>
                        Vibração: <strong>{motor.vibration_x} mm/s</strong>
                      </div>
                      <div>
                        Corrente: <strong>0 A</strong>
                      </div>
                      <div>
                        RPM: <strong>0</strong>
                      </div>
                    </div>
                  )}
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
