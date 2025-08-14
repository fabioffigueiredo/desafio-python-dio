import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles, theme } from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SelectedAccountProvider, useSelectedAccount } from './hooks/useSelectedAccount';
import { NotificationProvider } from './hooks/useNotification';
import NotificationList from './components/Notification';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AccountSelector from './pages/AccountSelector';
import { Operations } from './pages/Operations';
import { Statement } from './pages/Statement';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Verificando autenticação..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Protected Route with Account Selection
interface ProtectedRouteWithAccountProps {
  children: React.ReactNode;
}

const ProtectedRouteWithAccount: React.FC<ProtectedRouteWithAccountProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { selectedAccount, accounts, loading: accountLoading, hasMultipleAccounts } = useSelectedAccount();

  if (authLoading || accountLoading) {
    return <Loading fullScreen message="Verificando autenticação..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se tem múltiplas contas e nenhuma selecionada, redireciona para seleção
  if (hasMultipleAccounts && !selectedAccount) {
    return <Navigate to="/selecionar-conta" replace />;
  }

  // Se tem apenas uma conta, ela já foi selecionada automaticamente
  // Se tem múltiplas contas e uma foi selecionada, prossegue
  return <Layout>{children}</Layout>;
};

// Public Route Component (redirect if authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Verificando autenticação..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <NotificationProvider>
        <AuthProvider>
          <SelectedAccountProvider>
            <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/registro"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Account Selection Route */}
                <Route
                  path="/selecionar-conta"
                  element={
                    <ProtectedRoute>
                      <AccountSelector />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRouteWithAccount>
                      <Dashboard />
                    </ProtectedRouteWithAccount>
                  }
                />

                {/* Banking Operations Routes */}
                <Route
                  path="/operacoes"
                  element={
                    <ProtectedRouteWithAccount>
                      <Operations />
                    </ProtectedRouteWithAccount>
                  }
                />
                <Route
                  path="/extrato"
                  element={
                    <ProtectedRouteWithAccount>
                      <Statement />
                    </ProtectedRouteWithAccount>
                  }
                />
                <Route
                  path="/contas"
                  element={
                    <ProtectedRouteWithAccount>
                      <Accounts />
                    </ProtectedRouteWithAccount>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRouteWithAccount>
                      <Settings />
                    </ProtectedRouteWithAccount>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              <NotificationList />
            </div>
          </Router>
          </SelectedAccountProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
