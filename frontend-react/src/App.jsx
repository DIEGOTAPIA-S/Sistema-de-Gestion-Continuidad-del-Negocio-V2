import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MapDashboard from './pages/MapDashboard';
import AdminPanel from './pages/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />; // Redirigir si no es admin
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MapDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute requireAdmin={true}>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
