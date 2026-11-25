import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Route Guards & Layout
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/common/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Faculty from './pages/Faculty';
import Marks from './pages/Marks';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Dashboard Shell Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Universal Authenticated Route */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* Student Directory - Admin & Faculty Only */}
              <Route
                path="students"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <Students />
                  </ProtectedRoute>
                }
              />

              {/* Student Details - Admin & Faculty have broad access; Students can only access their own ID */}
              <Route
                path="students/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']} checkStudentParam={true}>
                    <StudentDetails />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Directory - Admin Only */}
              <Route
                path="faculty"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Faculty />
                  </ProtectedRoute>
                }
              />

              {/* Marks - Admin, Faculty, Student (filtered at view/service level) */}
              <Route
                path="marks"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                    <Marks />
                  </ProtectedRoute>
                }
              />

              {/* Attendance - Admin, Faculty, Student */}
              <Route
                path="attendance"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                    <Attendance />
                  </ProtectedRoute>
                }
              />

              {/* Reports - Admin, Faculty, Student */}
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Institutional Analytics - Admin Only */}
              <Route
                path="analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Application Settings - Admin Only */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Access Denied Warning Page */}
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
