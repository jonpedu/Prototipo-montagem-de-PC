
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BuildPage from './pages/BuildPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage
import LoadingSpinner from './components/core/LoadingSpinner';


const ProtectedRoute: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" text="Verificando autenticação..." /></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            
            {/* Build routes are now public */}
            <Route path="/build" element={<BuildPage />} />
            <Route path="/build/:buildId" element={<BuildPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            
            <Route path="*" element={
              <div className="text-center py-10">
                <h1 className="text-4xl font-bold text-accent mb-4">404 - Página Não Encontrada</h1>
                <p className="text-neutral-dark">Desculpe, a página que você está procurando não existe.</p>
                <Link to="/" className="mt-6 inline-block px-6 py-2 text-sm font-medium text-primary bg-accent rounded hover:bg-opacity-80 transition">
                  Voltar para Home
                </Link>
              </div>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
