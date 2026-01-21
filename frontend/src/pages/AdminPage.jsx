import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  AdminPanelSettings as AdminIcon,
  Cached as CacheIcon,
  Refresh as RefreshIcon,
  Delete as ClearIcon,
} from '@mui/icons-material';
import { adminAPI, cacheAPI } from '../services/api';

const AdminPage = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Cache statistics
  const [cacheStats, setCacheStats] = useState(null);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [loggingEnabled, setLoggingEnabled] = useState(false);

  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingAdmins();
      setPendingAdmins(response.data);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      showSnackbar('Ошибка загрузки заявок', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCacheStats = async () => {
    try {
      setCacheLoading(true);
      const [statsResponse, statusResponse] = await Promise.all([
        cacheAPI.getStatistics(),
        cacheAPI.getLoggingStatus(),
      ]);
      setCacheStats(statsResponse.data);
      setLoggingEnabled(statusResponse.data.enabled);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      showSnackbar('Ошибка загрузки статистики кэша', 'error');
    } finally {
      setCacheLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
    fetchCacheStats();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveAdmin(userId);
      showSnackbar('Администратор подтверждён', 'success');
      fetchPendingAdmins();
    } catch (error) {
      showSnackbar('Ошибка подтверждения', 'error');
    }
  };

  const handleReject = async (userId) => {
    try {
      await adminAPI.rejectAdmin(userId);
      showSnackbar('Заявка отклонена', 'info');
      fetchPendingAdmins();
    } catch (error) {
      showSnackbar('Ошибка отклонения', 'error');
    }
  };

  const handleToggleLogging = async () => {
    try {
      if (loggingEnabled) {
        await cacheAPI.disableLogging();
        setLoggingEnabled(false);
        showSnackbar('Логирование статистики кэша отключено', 'info');
      } else {
        await cacheAPI.enableLogging();
        setLoggingEnabled(true);
        showSnackbar('Логирование статистики кэша включено', 'success');
      }
    } catch (error) {
      showSnackbar('Ошибка изменения настроек логирования', 'error');
    }
  };

  const handleLogStats = async () => {
    try {
      await cacheAPI.logStatistics();
      await fetchCacheStats();
      showSnackbar('Статистика выведена в лог сервера', 'success');
    } catch (error) {
      showSnackbar('Ошибка вывода статистики', 'error');
    }
  };

  const handleClearStats = async () => {
    try {
      await cacheAPI.clearStatistics();
      await fetchCacheStats();
      showSnackbar('Статистика кэша сброшена', 'success');
    } catch (error) {
      showSnackbar('Ошибка сброса статистики', 'error');
    }
  };

  const formatPercent = (value) => {
    return typeof value === 'number' ? `${value.toFixed(2)}%` : '0%';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Панель администратора
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Управление заявками и мониторинг системы
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Заявки на регистрацию */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Ожидающие подтверждения
                </Typography>
                <Chip 
                  label={`${pendingAdmins.length} заявок`} 
                  color={pendingAdmins.length > 0 ? 'warning' : 'default'}
                />
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : pendingAdmins.length === 0 ? (
                <Alert severity="info">
                  Нет ожидающих заявок на регистрацию администраторов
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Имя пользователя</TableCell>
                        <TableCell>Роль</TableCell>
                        <TableCell align="right">Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingAdmins.map((admin) => (
                        <TableRow key={admin.id} hover>
                          <TableCell>{admin.id}</TableCell>
                          <TableCell>{admin.username}</TableCell>
                          <TableCell>
                            <Chip label="ADMIN" color="primary" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleApprove(admin.id)}
                              sx={{ mr: 1 }}
                            >
                              Подтвердить
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<RejectIcon />}
                              onClick={() => handleReject(admin.id)}
                            >
                              Отклонить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Статистика L2 Cache */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CacheIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">L2 JPA Cache (Ehcache)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={fetchCacheStats}
                    disabled={cacheLoading}
                  >
                    Обновить
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleLogStats}
                    disabled={cacheLoading}
                  >
                    В лог
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={handleClearStats}
                    disabled={cacheLoading}
                  >
                    Сбросить
                  </Button>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={loggingEnabled}
                    onChange={handleToggleLogging}
                    color="primary"
                  />
                }
                label="Логирование статистики кэша (AOP)"
              />

              <Divider sx={{ my: 2 }} />

              {cacheLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : cacheStats ? (
                <Grid container spacing={2}>
                  {/* Second Level Cache Stats */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Second Level Cache
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Cache Hits:
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {cacheStats.secondLevelHits}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Cache Misses:
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {cacheStats.secondLevelMisses}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Put Count:
                          </Typography>
                          <Typography variant="h6">
                            {cacheStats.secondLevelPuts}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Hit Ratio:
                          </Typography>
                          <Typography 
                            variant="h6" 
                            color={cacheStats.secondLevelHitRatio > 50 ? 'success.main' : 'warning.main'}
                          >
                            {formatPercent(cacheStats.secondLevelHitRatio)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Query Cache Stats */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Query Cache
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Cache Hits:
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {cacheStats.queryHits}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Cache Misses:
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {cacheStats.queryMisses}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Put Count:
                          </Typography>
                          <Typography variant="h6">
                            {cacheStats.queryPuts}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="warning">
                  Не удалось загрузить статистику кэша
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage;
