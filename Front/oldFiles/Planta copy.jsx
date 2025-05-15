import React, { useState, useEffect } from "react";

function Planta() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [temperatura, setTemperatura] = useState(25);
  const [vibracao, setVibracao] = useState(0.5);
  const [corrente, setCorrente] = useState(120);
  const [frequencia, setFrequencia] = useState(60);

  const toggleImage = () => {
    setIsSpinning((prev) => !prev);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperatura((prev) => (Math.random() * 2 + 30).toFixed(1));
      setVibracao((prev) => (Math.random() * 2).toFixed(2));
      setCorrente((prev) => (Math.random() * 5 + 170).toFixed(0));
      setFrequencia((prev) => (Math.random() * 1 + 58).toFixed(1));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Planta</h1>
      <p>Motor</p>
      <p>Estado: {isSpinning ? "Em funcionamento" : "Parado"}</p>
      <p>Temperatura: {temperatura}°C</p>
      <p>Vibração: {vibracao}mm/s</p>
      <p>Corrente: {corrente}A</p>
      <p>Frequência: {frequencia}Hz</p>
      <img
        src={
          isSpinning ? "/images/motor-spinning.gif" : "/images/motor-stoped.png"
        }
        alt={isSpinning ? "Motor Spinning" : "Motor Stopped"}
        style={{
          width: "200px",
          objectFit: "cover",
          marginBottom: "10px",
          borderRadius: "5px",
        }}
      />
      <button onClick={toggleImage}>
        {isSpinning ? "Parar Motor" : "Rodar Motor"}
      </button>
    </div>
  );
}

export default Plantassss;
