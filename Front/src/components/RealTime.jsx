import React from "react";
import { usePlantData } from "./PlantDataContext";
import fc302Image from "/assets/fc302.jpg";
import fc202Image from "/assets/fc202.jpg";
import cfw500Image from "/assets/cfw500.jpg";
import qgbtImage from "/assets/qgbt.avif";
import fc51Image from "/assets/fc51.png"; // Adicione a imagem se existir
import "./RealTime.css";

function RealTime() {
  const data = usePlantData();

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
  const idParts = (data.id || "Unknown Client/Unknown Instance").split("/");
  const client = idParts[0] || "Unknown Client";
  const instance = idParts[1] || "Unknown Instance";

  return (
    <div className="real-time-page">
      <div className="real-time-container" style={{}}>
        <h1>{client}</h1>
        <h2>{instance}</h2>
        <h4>Detalhes do Sistema</h4>
        <div className="system-details">
          <div className="inverter-container">
            <img
              src={qgbtImage}
              alt="icone-quadro"
              style={{
                filter: "invert(0.9)",
                height: "150px",
                objectFit: "cover",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
            />
            <div className="inverter-details">
              <p>
                <strong>Corrente R:</strong> {data.current_r} A
              </p>
              <p>
                <strong>Corrente S:</strong> {data.current_s} A
              </p>
              <p>
                <strong>Corrente T:</strong> {data.current_t} A
              </p>
              <p>
                <strong>Tensão R:</strong> {data.voltage_r} V
              </p>
              <p>
                <strong>Tensão S:</strong> {data.voltage_s} V
              </p>
              <p>
                <strong>Tensão T:</strong> {data.voltage_t} V
              </p>
              <p>
                <strong>Entradas Digitais (dIn):</strong>{" "}
                {data.dIn && data.dIn.join(", ")}
              </p>
              <p>
                <strong>Saídas Digitais (dOut):</strong>{" "}
                {data.dOut && data.dOut.join(", ")}
              </p>
              <p>{data.createdAt}</p>
            </div>
          </div>
          {/* Motores */}
          <div className="motors-section">
            {data.motors &&
              data.motors.map((motor, idx) => {
                // Mapeamento entre address do motor e do inversor (ajuste conforme necessário)
                const motorToInverterAddress = {
                  200: 10, // Motor 1 -> Inversor 10
                  201: 10, // Motor 2 -> Inversor 10 (exemplo, ajuste conforme seu sistema)
                };
                const inverterAddress = motorToInverterAddress[motor.address];
                const inverter =
                  data.inverters &&
                  data.inverters.find((inv) => inv.address === inverterAddress);
                // Considera rodando se interpretedStatus contém exatamente "Em operação" (não "Sem operação")
                const running =
                  inverter && Array.isArray(inverter?.interpretedStatus)
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
                  <div>
                    <div className="inverter-container" key={idx}>
                      <img
                        src={
                          running
                            ? "images/motor-spinning.gif"
                            : "images/motor-stoped.png"
                        }
                        alt="Motor"
                        style={{
                          height: "150px",
                          objectFit: "cover",
                          marginBottom: "10px",
                          borderRadius: "5px",
                        }}
                      />

                      {/* Conteúdo do motor */}
                      <div className="inverter-details" key={idx}>
                        <h5>
                          {motor.name} (Endereço: {motor.address})
                        </h5>
                        <p>
                          <strong>Temperatura:</strong> {(motor.temperature)} °C
                        </p>
                        <p>
                          <strong>Vibração X:</strong> {(motor.vibration_x)} mm/s
                        </p>
                        <p>
                          <strong>Vibração Y:</strong> {(motor.vibration_y)} mm/s
                        </p>
                        <p>
                          <strong>Vibração Z: </strong> {(motor.vibration_z)} mm/s
                        </p>
                        <p>
                          <strong>Deslocamento X: </strong>{(motor.displacement_x)} mm
                        </p>
                        <p>
                          <strong>Deslocamento Y: </strong>{(motor.displacement_y)} mm
                        </p>
                        <p>
                          <strong>Deslocamento Z: </strong>{(motor.displacement_z)} mm
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {data.inverters.map((item, index) => {
            return (
              <div className="inverter-container" key={index}>
                <img
                  src={getImageForInverter(item.model)}
                  alt={`Inversor ${item.id}`}
                  style={{
                    width: "100px",
                    height: "150px",
                    objectFit: "cover",
                    marginBottom: "10px",
                    borderRadius: "5px",
                  }}
                />
                <div className="inverter-details">
                  <h3>Endereço ModBus: {item.address}</h3>
                  <p>
                    <strong>Modelo:</strong> {item.model}
                  </p>
                  <p>
                    <strong>Frequência:</strong> {item.frequency} Hz
                  </p>
                  <p>
                    <strong>Tensão:</strong> {item.voltage} V
                  </p>
                  <p>
                    <strong>Tensão DC:</strong> {item.DcVoltage} V
                  </p>
                  <p>
                    <strong>Potência:</strong> {item.power} W
                  </p>
                  <p>
                    <strong>RPM:</strong> {item.rpm}
                  </p>
                  <p>
                    <strong>Temperatura:</strong> {item.temperature} °C
                  </p>
                  <p>
                    <strong>Corrente:</strong> {item.current} A
                  </p>
                  <p>
                    <strong>Status:</strong> {item.status || "N/A"}
                  </p>
                  <p>
                    <strong>
                      Histórico de Falhas: <br />
                    </strong>{" "}
                    {item.faultLog && item.faultLog.length > 0
                      ? item.faultLog.join(", ")
                      : "Sem falhas"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RealTime;
