import React, { useState, useEffect } from "react";
import fc302Image from "../assets/fc302.jpg";
import fc202Image from "../assets/fc202.jpg";
import cfw500Image from "../assets/cfw500.jpg";
import qgbtImage from "../assets/qgbt.avif";
import "./RealTime.css";

function RealTime() {
  const [data, setData] = useState({ sensors: {}, inverters: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/plant");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const getImageForInverter = (model) => {
    const images = {
      fc302: fc302Image,
      fc202: fc202Image,
      cfw500: cfw500Image,
    };
    return (
      images[model] ||
      "https://res.cloudinary.com/rsc/image/upload/b_rgb:FFFFFF,c_pad,dpr_2.625,f_auto,h_214,q_auto,w_380/c_pad,h_214,w_380/R8918833-01?pgw=1"
    );
  };
  const idParts = (data.id || "Unknown Client/Unknown Instance").split("/"); // Safely split the id
  const client = idParts[0] || "Unknown Client";
  const instance = idParts[1] || "Unknown Instance";

  return (
    <div className="real-time-page">
      <div className="real-time-container" style={{}}>
        <h1>{client}</h1> {/* Cliente como H1 */}
        <h2>{instance}</h2> {/* Instância como subtítulo */}
        <h4>Detalhes do Sistema</h4>
        <div className="system-details">
          <div className="sensors">
            <img
              src={qgbtImage}
              alt="icone-quadro"
              style={{
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
                <strong>Vibração do Motor X:</strong> {data.motor_vibration_x}
              </p>
              <p>
                <strong>Vibração do Motor Y:</strong> {data.motor_vibration_y}
              </p>
              <p>
                <strong>Vibração do Motor Z:</strong> {data.motor_vibration_z}
              </p>
              <p>
                <strong>Temperatura do Motor:</strong> {data.motor_temperature}{" "}
                °C
              </p>
              <p>
                <strong>Nível:</strong> {data.level}
              </p>
              <p>{data.createdAt}</p>
            </div>
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
                    {item.faultLog.join(", ")}
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
