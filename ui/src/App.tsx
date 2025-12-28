
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import type { ReactNode } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

const PrivateRoute = ({ children, role }: { children: ReactNode, role?: string }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />; // Redirect to home or unauthorized
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        user?.role === 'DOCTOR' ? <Navigate to="/doctor-dashboard" /> :
          user?.role === 'PATIENT' ? <Navigate to="/patient-dashboard" /> :
            <Navigate to="/login" />
      } />

      <Route path="/patient-dashboard" element={
        <PrivateRoute role="PATIENT">
          <PatientDashboard />
        </PrivateRoute>
      } />

      <Route path="/doctor-dashboard" element={
        <PrivateRoute role="DOCTOR">
          <DoctorDashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
