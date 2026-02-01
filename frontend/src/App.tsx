import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ForcePasswordChange from './pages/ForcePasswordChange';

// User Pages
import Dashboard from './pages/user/Dashboard';
import LoansList from './pages/user/LoansList';
import LoanDetails from './pages/user/LoanDetails';
import AddLoan from './pages/user/AddLoan';
import EditLoan from './pages/user/EditLoan';
import Notifications from './pages/user/Notifications';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import UserDetails from './pages/admin/UserDetails';
import AllLoans from './pages/admin/AllLoans';
import AdminLoanDetails from './pages/admin/AdminLoanDetails';

// Route Guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Components
import Loader from './components/common/Loader';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Force Password Change */}
      <Route
        path="/change-password-required"
        element={
          <PrivateRoute>
            <ForcePasswordChange />
          </PrivateRoute>
        }
      />

      {/* Protected User Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="loans" element={<LoansList />} />
        <Route path="loans/new" element={<AddLoan />} />
        <Route path="loans/:id" element={<LoanDetails />} />
        <Route path="loans/:id/edit" element={<EditLoan />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout isAdmin />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="loans" element={<AllLoans />} />
        <Route path="loans/:id" element={<AdminLoanDetails />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;