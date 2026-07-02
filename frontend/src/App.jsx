// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EmergencyButton from "./components/EmergencyButton";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// ✅ Existing Patient Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import AppointmentHistory from "./pages/AppointmentHistory";
import Reports from "./pages/Reports";
import OrderMedicine from "./pages/OrderMedicine";
import OrderHistory from "./pages/OrderHistory";
import Consultations from "./pages/Consultations";
import About from "./pages/About";
import Departments from "./pages/Departments";
import PatientProfile from "./pages/PatientProfile";

// ✅ Newly added Doctor Pages
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import AddReport from "./pages/AddReport";
import DoctorProfile from "./pages/DoctorProfile";

// ✅ Newly added Admin Pages (v1.5)
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// ✅ Forgot / reset password (shared by patients and doctors)
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  console.log("✅ App rendering");

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <EmergencyButton />

        <div className="flex-grow-1">
          <ErrorBoundary>
            <Routes>
              {/* 🌐 Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
  
              {/* 👨‍⚕️ Doctor Routes */}
              <Route path="/doctor-login" element={<DoctorLogin />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/report/:appointmentId" element={<AddReport />} />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
  
              {/* 🛠️ Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin-dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
  
              {/* 🔒 Protected Patient Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <PatientProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    <Appointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointment-history"
                element={
                  <PrivateRoute>
                    <AppointmentHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-medicine"
                element={
                  <PrivateRoute>
                    <OrderMedicine />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-history"
                element={
                  <PrivateRoute>
                    <OrderHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/consultations"
                element={
                  <PrivateRoute>
                    <Consultations />
                  </PrivateRoute>
                }
              />
  
              {/* 🧭 Fallback Route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </ErrorBoundary>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
