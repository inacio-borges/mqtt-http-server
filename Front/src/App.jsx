import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import History from "./components/History";
import RealTime from "./components/RealTime";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Planta</Link>
            </li>
            <li>
              <Link to="/history">Histórico</Link>
            </li>
            <li>
              <Link to="/realtime">Detalhes do Sistema</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/history" element={<History />} />
          <Route path="/realtime" element={<RealTime />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
