import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { usePlantData } from "./PlantDataContext";
import "./History.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const getAllVariableOptions = (plantData) => {
  const options = [
    { label: "Corrente R", value: "current_r", type: "main" },
    { label: "Corrente S", value: "current_s", type: "main" },
    { label: "Corrente T", value: "current_t", type: "main" },
    { label: "Tensão R", value: "voltage_r", type: "main" },
    { label: "Tensão S", value: "voltage_s", type: "main" },
    { label: "Tensão T", value: "voltage_t", type: "main" },
    { label: "Saída Digital 1", value: "dOut[0]", type: "main" },
    { label: "Saída Digital 2", value: "dOut[1]", type: "main" },
    { label: "Saída Digital 3", value: "dOut[2]", type: "main" },
    { label: "Saída Digital 4", value: "dOut[4]", type: "main" },
    { label: "Saída Digital 5", value: "dOut[5]", type: "main" },
  ];
  // Inversores dinâmicos
  if (plantData && Array.isArray(plantData.inverters)) {
    plantData.inverters.forEach((inv, idx) => {
      options.push({
        label: `Frequência Inversor ${idx + 1}`,
        value: `inverter_${idx}_frequency`,
        type: "inverter",
      });
      options.push({
        label: `Tensão Inversor ${idx + 1}`,
        value: `inverter_${idx}_voltage`,
        type: "inverter",
      });
      options.push({
        label: `Corrente Inversor ${idx + 1}`,
        value: `inverter_${idx}_current`,
        type: "inverter",
      });
      options.push({
        label: `Temperatura Inversor ${idx + 1}`,
        value: `inverter_${idx}_temperature`,
        type: "inverter",
      });
      options.push({
        label: `Potência Inversor ${idx + 1}`,
        value: `inverter_${idx}_power`,
        type: "inverter",
      });
    });
  }
  // Motores dinâmicos
  if (plantData && Array.isArray(plantData.motors)) {
    plantData.motors.forEach((motor, idx) => {
      options.push({
        label: `Temperatura Motor ${idx + 1}`,
        value: `motor_${idx}_temperature`,
        type: "motor",
      });
      options.push({
        label: `Vibração X Motor ${idx + 1}`,
        value: `motor_${idx}_vibration_x`,
        type: "motor",
      });
      options.push({
        label: `Vibração Y Motor ${idx + 1}`,
        value: `motor_${idx}_vibration_y`,
        type: "motor",
      });
      options.push({
        label: `Vibração Z Motor ${idx + 1}`,
        value: `motor_${idx}_vibration_z`,
        type: "motor",
      });
      options.push({
        label: `Deslocamento X Motor ${idx + 1}`,
        value: `motor_${idx}_displacement_x`,
        type: "motor",
      });
      options.push({
        label: `Deslocamento Y Motor ${idx + 1}`,
        value: `motor_${idx}_displacement_y`,
        type: "motor",
      });
      options.push({
        label: `Deslocamento Z Motor ${idx + 1}`,
        value: `motor_${idx}_displacement_z`,
        type: "motor",
      });
    });
  }
  return options;
};

function extractValue(plantData, selectedVar) {
  if (!plantData) return null;
  if (selectedVar.startsWith("dOut")) {
    const idx = parseInt(selectedVar.match(/\d+/)[0], 10);
    return Array.isArray(plantData.dOut) ? plantData.dOut[idx] : null;
  }
  if (selectedVar.startsWith("inverter_")) {
    const [, idx, field] = selectedVar.match(/inverter_(\d+)_(.+)/) || [];
    if (
      idx !== undefined &&
      field &&
      plantData.inverters &&
      plantData.inverters[idx]
    ) {
      return plantData.inverters[idx][field];
    }
    return null;
  }
  if (selectedVar.startsWith("motor_")) {
    const [, idx, field] = selectedVar.match(/motor_(\d+)_(.+)/) || [];
    if (
      idx !== undefined &&
      field &&
      plantData.motors &&
      plantData.motors[idx]
    ) {
      return plantData.motors[idx][field];
    }
    return null;
  }
  return plantData[selectedVar];
}

function HistoricoGrafico() {
  const plantData = usePlantData();
  const [data, setData] = useState([]);
  const [selectedVar, setSelectedVar] = useState("current_r");
  const dataBuffer = useRef([]);
  const variableOptions = getAllVariableOptions(plantData);

  useEffect(() => {
    const value = extractValue(plantData, selectedVar);
    if (value !== undefined && value !== null) {
      dataBuffer.current.push({
        value,
        createdAt: plantData.createdAt,
      });
      if (dataBuffer.current.length > 100) {
        dataBuffer.current.shift();
      }
      setData([...dataBuffer.current]);
    }
  }, [plantData, selectedVar]);

  useEffect(() => {
    dataBuffer.current = [];
    setData([]);
  }, [selectedVar]);

  const chartData = {
    labels: data.map((d) =>
      d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : ""
    ),
    datasets: [
      {
        label:
          variableOptions.find((v) => v.value === selectedVar)?.label ||
          "Variável",
        data: data.map((d) => d.value),
        borderColor: "rgb(0 0 255)", // azul principal
        borderWidth: 3,
        backgroundColor: "rgb(0 0 255)", // azul claro com transparência
        tension: 0.3,
        pointRadius: 0,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointHoverBackgroundColor: "#3b82f6",
        pointHoverBorderColor: "#fff",
        fill: true,
      },
    ],
  };

  // Plugin para forçar fundo branco no canvas do Chart.js
  const whiteBgPlugin = {
    id: 'customWhiteBackground',
    beforeDraw: (chart, args, options) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#fff';
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    },
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "#222", font: { weight: "bold" } } },
      title: {
        display: true,
        text: "Histórico da Variável",
        color: "#222",
        font: { size: 26, weight: "bold" },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#222",
        bodyColor: "#222",
        borderColor: "#bbb",
        borderWidth: 1,
      },
      customWhiteBackground: whiteBgPlugin,
    },
    scales: {
      x: {
        title: { display: true, text: "Horário", color: "#222" },
        ticks: { color: "#222" },
        grid: { color: "#eee" },
      },
      y: {
        title: { display: true, text: "Valor", color: "#222" },
        ticks: { color: "#222" },
        grid: { color: "#eee" },
        // Ajuste automático da escala com margem de 10%
        beginAtZero: false,
        suggestedMin: (() => {
          if (data.length === 0) return 0;
          const min = Math.min(...data.map((d) => d.value));
          const max = Math.max(...data.map((d) => d.value));
          const margin = (max - min) * 0.5;
          return min - margin;
        })(),
        suggestedMax: (() => {
          if (data.length === 0) return 1;
          const min = Math.min(...data.map((d) => d.value));
          const max = Math.max(...data.map((d) => d.value));
          const margin = (max - min) * 0.5;
          return max + margin;
        })(),
      },
    },
    layout: {
      padding: 24,
    },
  };

  return (
    <div
      className="history-container"
      style={{
        maxWidth: "98vw",
        minHeight: 700,
        width: "100%",
        margin: "0 auto",
      }}
    >
      <h1>Gráfico de Variáveis</h1>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="var-select">Selecione a variável: </label>
        <select
          id="var-select"
          value={selectedVar}
          onChange={(e) => setSelectedVar(e.target.value)}
        >
          {variableOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="chart-modern" style={{ minHeight: 600, width: "95%", background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001' }}>
        <Line data={chartData} options={chartOptions} plugins={[whiteBgPlugin]} />
      </div>
    </div>
  );
}

export default HistoricoGrafico;
