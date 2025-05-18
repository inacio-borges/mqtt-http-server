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
    id: "customWhiteBackground",
    beforeDraw: (chart, args, options) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#fff";
      ctx.fillRect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      );
      ctx.restore();
    },
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: { color: "#222", font: { weight: "bold" } },
      },
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
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
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

        beginAtZero: true,

        suggestedMax: (() => {
          if (data.length === 0) return 1;
          const min = Math.min(...data.map((d) => d.value));
          const max = Math.max(...data.map((d) => d.value));
          const margin = (max - min) * 0.8;
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
        maxWidth: "85vw",
        minHeight: window.innerWidth < 600 ? 400 : 700,
        width: "100vw",
        margin: 0,
        padding: window.innerWidth < 600 ? 4 : 24,
        borderRadius: window.innerWidth < 600 ? 8 : 18,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <h1
        style={{
          fontSize: window.innerWidth < 600 ? 18 : 32,
          textAlign: "center",
          margin: window.innerWidth < 600 ? "8px 0" : "24px 0",
        }}
      >
        Gráfico de Variáveis
      </h1>
      <div
        style={{
          marginBottom: 16,
          width: window.innerWidth < 600 ? "100%" : "auto",
          textAlign: "center",
        }}
      >
        <label
          htmlFor="var-select"
          style={{ fontSize: window.innerWidth < 600 ? 12 : 16 }}
        >
          Selecione a variável:{" "}
        </label>
        <select
          id="var-select"
          value={selectedVar}
          onChange={(e) => setSelectedVar(e.target.value)}
          style={{
            fontSize: window.innerWidth < 600 ? 12 : 16,
            width: window.innerWidth < 600 ? "90%" : "auto",
            marginTop: window.innerWidth < 600 ? 4 : 0,
          }}
        >
          {variableOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div
        className="chart-modern"
        style={{
          minHeight: window.innerWidth < 600 ? 280 : 400,
          width: "100%",
          maxWidth: "100vw",
          background: "#fff",
          borderRadius: window.innerWidth < 600 ? 8 : 16,
          boxShadow: "0 2px 16px #0001",
          overflowX: "auto",
          padding: window.innerWidth < 600 ? 2 : 24,
          boxSizing: "border-box",
        }}
      >
        <Line
          data={chartData}
          options={{
            ...chartOptions,
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                ...chartOptions.plugins.legend,
                labels: {
                  ...chartOptions.plugins.legend.labels,
                  font: {
                    size: window.innerWidth < 600 ? 12 : 16,
                    weight: "bold",
                  },
                },
              },
              title: {
                ...chartOptions.plugins.title,
                font: {
                  size: window.innerWidth < 600 ? 16 : 26,
                  weight: "bold",
                },
              },
            },
            layout: {
              padding: window.innerWidth < 600 ? 4 : 24,
            },
            scales: {
              x: {
                ...chartOptions.scales.x,
                ticks: {
                  ...chartOptions.scales.x.ticks,
                  font: { size: window.innerWidth < 600 ? 10 : 14 },
                  maxRotation: 45,
                  minRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: window.innerWidth < 600 ? 4 : 10,
                },
                title: {
                  ...chartOptions.scales.x.title,
                  font: { size: window.innerWidth < 600 ? 10 : 14 },
                },
              },
              y: {
                ...chartOptions.scales.y,
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  font: { size: window.innerWidth < 600 ? 10 : 14 },
                },
                title: {
                  ...chartOptions.scales.y.title,
                  font: { size: window.innerWidth < 600 ? 10 : 14 },
                },
              },
            },
          }}
          plugins={[whiteBgPlugin]}
          height={window.innerWidth < 600 ? 160 : 600}
        />
      </div>
    </div>
  );
}

export default HistoricoGrafico;
