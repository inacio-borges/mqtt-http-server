import React, { useState, useEffect } from "react";
import "./History.css";

function History() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/plant");
        const result = await response.json();
        setData((prevData) => {
          const newData = [result, ...prevData];
          return newData.slice(0, 20); // Keep only the 20 most recent entries
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="history-container">
      <h1>Histórico</h1>
      <div className="table-wrapper">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Current R</th>
              <th>Current S</th>
              <th>Current T</th>
              <th>Voltage R</th>
              <th>Voltage S</th>
              <th>Voltage T</th>
              <th>Motor Vibration X</th>
              <th>Motor Vibration Y</th>
              <th>Motor Vibration Z</th>
              <th>Motor Temperature</th>
              <th>Level</th>
              <th>Created At</th>
              <th>Inverter Address</th>
              <th>Inverter Model</th>
              <th>Inverter Frequency</th>
              <th>Inverter Voltage</th>
              <th>Inverter Power</th>
              <th>Inverter Current</th>
              <th>Inverter Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) =>
              entry.inverters.map((inverter, i) => (
                <tr key={`${index}-${i}`}>
                  <td>{entry.id}</td>
                  <td>{entry.current_r}</td>
                  <td>{entry.current_s}</td>
                  <td>{entry.current_t}</td>
                  <td>{entry.voltage_r}</td>
                  <td>{entry.voltage_s}</td>
                  <td>{entry.voltage_t}</td>
                  <td>{entry.motor_vibration_x}</td>
                  <td>{entry.motor_vibration_y}</td>
                  <td>{entry.motor_vibration_z}</td>
                  <td>{entry.motor_temperature}</td>
                  <td>{entry.level}</td>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>{inverter.address}</td>
                  <td>{inverter.model}</td>
                  <td>{inverter.frequency}</td>
                  <td>{inverter.voltage}</td>
                  <td>{inverter.power}</td>
                  <td>{inverter.current}</td>
                  <td>{inverter.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;
