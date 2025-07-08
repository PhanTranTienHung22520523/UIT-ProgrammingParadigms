import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MoviesPage from './pages/MoviesPage';
import CinemasPage from './pages/CinemasPage';
import ScreensPage from './pages/ScreensPage';
import SeatsPage from './pages/SeatsPage';
import ShowtimesPage from './pages/ShowtimesPage';
import BookingsPage from './pages/BookingsPage';
import PaymentsPage from './pages/PaymentsPage';
import UsersPage from './pages/UsersPage';
import CleanupPage from './pages/CleanupPage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const globalStyles = (
  <GlobalStyles
    styles={{
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
        '&:hover': {
          background: '#a8a8a8',
        },
      },
    }}
  />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/movies" element={<MoviesPage />} />
                      <Route path="/cinemas" element={<CinemasPage />} />
                      <Route path="/screens" element={<ScreensPage />} />
                      <Route path="/seats" element={<SeatsPage />} />
                      <Route path="/showtimes" element={<ShowtimesPage />} />
                      <Route path="/bookings" element={<BookingsPage />} />
                      <Route path="/payments" element={<PaymentsPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/cleanup" element={<CleanupPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
