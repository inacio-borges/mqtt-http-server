import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import History from "./components/History";
import RealTime from "./components/RealTime";
import Planta from "./components/Planta";

function App() {
  return (
    <Router>
      <div className="main-container">
        <nav
          style={{
            marginTop: "1rem",
            padding: "1rem",
            color: "green", // cor da fonte azul
          }}
        >
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              style={{
                backgroundColor: "transparent",
                border: "1px solid #e5e7eb",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
              }}
            >
              <Link to="/">Planta</Link>
            </button>
            <button
              style={{
                backgroundColor: "transparent",
                border: "1px solid #e5e7eb",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
              }}
            >
              <Link to="/history">Gráfico</Link>
            </button>
            <button
              style={{
                backgroundColor: "transparent",
                border: "1px solid #e5e7eb",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
              }}
            >
              <Link to="/realtime">Dados da Planta</Link>
            </button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Planta />} />
          <Route path="/history" element={<History />} />
          <Route path="/realtime" element={<RealTime />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
