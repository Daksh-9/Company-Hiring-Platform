import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import TestTypeResults from "./components/TestTypeResults";

function App() {
  return (
    <Router>
      <div className="App w-screen h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
          <Route
            path="/admin/results/:testType"
            element={<TestTypeResults />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
