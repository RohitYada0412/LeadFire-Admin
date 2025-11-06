import React from "react";
import { Routes, Route, Outlet, BrowserRouter } from "react-router-dom";

import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Company from "./pages/Company";
import Agent from "./pages/Agent";
import AgentDashboard from "./components/agent/AgentDashboard";
import Zone from "./pages/Zone";

import PublicRoute from "./routers/PublicRoute";
import PrivateRoute from "./routers/PrivateRoute"; // <-- add this
import SendMail from "./pages/SendMail";
import ResetPassword from "./pages/ResetPassword";
import Issues from "./pages/issue";
import ForgotPassword from "./pages/forgotpassword";
import Pa from "./pages/PrivacyPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermAndCondition from "./pages/TermCondition";
import ContactUs from "./pages/ContactUs";

export default function App() {
  const basename = import.meta.env.VITE_ROUTER_BASENAME;
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route element={<PublicLayout />}>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="login"
              element={

                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="forgot-password"
              element={

                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="finish-sign-in"
              element={
                <PublicRoute>
                  <SendMail />
                </PublicRoute>
              }
            />
            <Route
              path="reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
          </Route>

          {/* Private routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <PrivateLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" index element={<Dashboard />} />
            <Route path="company" element={<Company />} />
            <Route path="agents" element={<Agent />} />
            <Route path="agents/:id" element={<AgentDashboard />} />
            <Route path="zones" element={<Zone />} />
            <Route path="issues" element={<Issues />} />

          </Route>
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="term-and-condition" element={<TermAndCondition />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
