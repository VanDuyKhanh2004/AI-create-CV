import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import APIConnectionStatus from "./components/APIConnectionStatus";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CVBuilder from "./pages/CVBuilder";
import CVList from "./pages/CVList";
import CVEdit from "./pages/CVEdit";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import TestAPI from "./pages/TestAPI";

function App() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/test-api" element={<TestAPI />} />
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv-builder"
            element={
              <ProtectedRoute>
                <CVBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv-list"
            element={
              <ProtectedRoute>
                <CVList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv/:id/edit"
            element={
              <ProtectedRoute>
                <CVEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
      <APIConnectionStatus />
    </Box>
  );
}

export default App;
