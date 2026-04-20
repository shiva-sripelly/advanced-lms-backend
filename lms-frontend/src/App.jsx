import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import AssignmentsPage from "./pages/AssignmentsPage";
import NotificationsPage from "./pages/NotificationsPage";
<<<<<<< HEAD
=======
import PaymentsPage from "./pages/PaymentsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
>>>>>>> 73c37ea (payment added)

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AssignmentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD
=======

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments/success"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentSuccessPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments/cancel"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentCancelPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
>>>>>>> 73c37ea (payment added)
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}