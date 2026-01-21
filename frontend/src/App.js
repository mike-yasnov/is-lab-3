import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Container,
  Button,
  Chip,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { 
  BusinessCenter as WorkIcon, 
  Business as OrgIcon, 
  Functions as OperationsIcon,
  CloudUpload as ImportIcon,
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle,
} from '@mui/icons-material';
import WorkersPage from './pages/WorkersPage';
import OrganizationsPage from './pages/OrganizationsPage';
import SpecialOperationsPage from './pages/SpecialOperationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ImportPage from './pages/ImportPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
        },
      },
    },
  },
});

// Компонент защищённого маршрута
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>Загрузка...</Box>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/workers" replace />;
  }
  
  return children;
};

function NavigationTabs() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  // Определяем активную вкладку
  const getTabValue = () => {
    if (['/workers', '/organizations', '/operations', '/import', '/admin'].includes(currentPath)) {
      return currentPath;
    }
    return false;
  };

  return (
    <Tabs value={getTabValue()} textColor="inherit" indicatorColor="secondary">
      <Tab label="Работники" value="/workers" component={Link} to="/workers" icon={<WorkIcon />} iconPosition="start" />
      <Tab label="Организации" value="/organizations" component={Link} to="/organizations" icon={<OrgIcon />} iconPosition="start" />
      <Tab label="Спец. операции" value="/operations" component={Link} to="/operations" icon={<OperationsIcon />} iconPosition="start" />
      {user && (
        <Tab label="Импорт" value="/import" component={Link} to="/import" icon={<ImportIcon />} iconPosition="start" />
      )}
      {user?.role === 'ADMIN' && (
        <Tab label="Админ" value="/admin" component={Link} to="/admin" icon={<AdminIcon />} iconPosition="start" />
      )}
    </Tabs>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          component={Link} 
          to="/login" 
          color="inherit" 
          startIcon={<LoginIcon />}
        >
          Войти
        </Button>
        <Button 
          component={Link} 
          to="/register" 
          color="inherit" 
          variant="outlined"
          sx={{ borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          Регистрация
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip 
        label={user.role} 
        size="small" 
        color={user.role === 'ADMIN' ? 'secondary' : 'default'}
        sx={{ color: 'white', borderColor: 'white' }}
        variant="outlined"
      />
      <IconButton
        size="large"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem disabled>
          <Typography variant="body2">{user.username}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} /> Выйти
        </MenuItem>
      </Menu>
    </Box>
  );
}

function AppContent() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <WorkIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 0, fontWeight: 'bold', mr: 4 }}>
              Система управления работниками
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <NavigationTabs />
            </Box>
            <UserMenu />
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/workers" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/operations" element={<SpecialOperationsPage />} />
            <Route 
              path="/import" 
              element={
                <ProtectedRoute>
                  <ImportPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Box>

        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 Информационная система управления работниками. ИТМО. Лабораторная работа №2
            </Typography>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
