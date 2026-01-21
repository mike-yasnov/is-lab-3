import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  DeleteForever as DeleteIcon,
  Calculate as CalculateIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  WorkOutline as HireIcon,
} from '@mui/icons-material';
import { workersAPI, organizationsAPI } from '../services/api';
import { ORG_TYPE_LABELS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const SpecialOperations = ({ onOperationComplete, showSnackbar }) => {
  const { isAuthenticated } = useAuth();
  const [ratingToDelete, setRatingToDelete] = useState('');
  const [searchPrefix, setSearchPrefix] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [coefficient, setCoefficient] = useState('');
  const [hireWorkerId, setHireWorkerId] = useState('');
  const [hireOrgId, setHireOrgId] = useState('');
  const [sumDialog, setSumDialog] = useState(false);
  const [ratingSum, setRatingSum] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchDialog, setSearchDialog] = useState(false);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    // Загрузка списка организаций
    const fetchOrganizations = async () => {
      try {
        const response = await organizationsAPI.getAll();
        setOrganizations(response.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    fetchOrganizations();
  }, []);

  const handleDeleteByRating = async () => {
    if (!ratingToDelete) {
      showSnackbar('Введите рейтинг', 'warning');
      return;
    }
    try {
      await workersAPI.deleteByRating(Number(ratingToDelete));
      showSnackbar(`Удалены работники с рейтингом ${ratingToDelete}`, 'success');
      setRatingToDelete('');
      onOperationComplete();
    } catch (error) {
      showSnackbar('Ошибка удаления', 'error');
    }
  };

  const handleGetRatingSum = async () => {
    try {
      const response = await workersAPI.getRatingSum();
      setRatingSum(response.data);
      setSumDialog(true);
    } catch (error) {
      showSnackbar('Ошибка получения суммы', 'error');
    }
  };

  const handleSearchByName = async () => {
    if (!searchPrefix) {
      showSnackbar('Введите префикс имени', 'warning');
      return;
    }
    try {
      const response = await workersAPI.searchByName(searchPrefix);
      setSearchResults(response.data);
      setSearchDialog(true);
    } catch (error) {
      showSnackbar('Ошибка поиска', 'error');
    }
  };

  const handleIndexSalary = async () => {
    if (!workerId || !coefficient) {
      showSnackbar('Заполните все поля', 'warning');
      return;
    }
    if (Number(coefficient) <= 0) {
      showSnackbar('Коэффициент должен быть больше 0', 'warning');
      return;
    }
    try {
      await workersAPI.indexSalary(Number(workerId), Number(coefficient));
      showSnackbar(`Зарплата работника ${workerId} проиндексирована на ${((coefficient - 1) * 100).toFixed(0)}%`, 'success');
      setWorkerId('');
      setCoefficient('');
      onOperationComplete();
    } catch (error) {
      showSnackbar('Ошибка индексации зарплаты', 'error');
    }
  };

  const handleHireToOrganization = async () => {
    if (!hireWorkerId || !hireOrgId) {
      showSnackbar('Заполните все поля', 'warning');
      return;
    }
    try {
      await workersAPI.hireToOrganization(Number(hireWorkerId), Number(hireOrgId));
      showSnackbar(`Работник ${hireWorkerId} принят на работу в организацию ${hireOrgId}`, 'success');
      setHireWorkerId('');
      setHireOrgId('');
      onOperationComplete();
    } catch (error) {
      showSnackbar('Ошибка принятия на работу', 'error');
    }
  };

  return (
    <>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Специальные операции
          </Typography>

          {!isAuthenticated() && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Войдите в систему для выполнения операций, изменяющих данные
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Удаление по рейтингу */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DeleteIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Удалить по рейтингу</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Рейтинг"
                  type="number"
                  value={ratingToDelete}
                  onChange={(e) => setRatingToDelete(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={handleDeleteByRating}
                  startIcon={<DeleteIcon />}
                  disabled={!isAuthenticated()}
                >
                  Удалить
                </Button>
              </Box>
            </Grid>

            {/* Сумма рейтингов */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalculateIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Сумма рейтингов</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Рассчитать сумму значений поля rating для всех объектов
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleGetRatingSum}
                  startIcon={<CalculateIcon />}
                >
                  Рассчитать
                </Button>
              </Box>
            </Grid>

            {/* Поиск по префиксу имени */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SearchIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Поиск по префиксу</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Начало имени"
                  value={searchPrefix}
                  onChange={(e) => setSearchPrefix(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={handleSearchByName}
                  startIcon={<SearchIcon />}
                >
                  Найти
                </Button>
              </Box>
            </Grid>

            {/* Индексация зарплаты */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Индексация зарплаты</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="ID работника"
                  type="number"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Коэффициент (напр. 1.15 = +15%)"
                  type="number"
                  value={coefficient}
                  onChange={(e) => setCoefficient(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  inputProps={{ step: 0.01 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleIndexSalary}
                  startIcon={<TrendingUpIcon />}
                  disabled={!isAuthenticated()}
                >
                  Индексировать
                </Button>
              </Box>
            </Grid>

            {/* Принять на работу */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HireIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Принять на работу</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="ID работника"
                  type="number"
                  value={hireWorkerId}
                  onChange={(e) => setHireWorkerId(e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  select
                  label="Организация"
                  value={hireOrgId}
                  onChange={(e) => setHireOrgId(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">Выберите организацию</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {ORG_TYPE_LABELS[org.type] || 'Организация'} (ID: {org.id})
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleHireToOrganization}
                  startIcon={<HireIcon />}
                  disabled={!isAuthenticated()}
                >
                  Принять на работу
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog для суммы рейтингов */}
      <Dialog open={sumDialog} onClose={() => setSumDialog(false)}>
        <DialogTitle>Сумма рейтингов</DialogTitle>
        <DialogContent>
          <Typography variant="h4" align="center" color="primary" sx={{ py: 3 }}>
            {ratingSum}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Общая сумма рейтингов всех работников
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSumDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog для результатов поиска */}
      <Dialog open={searchDialog} onClose={() => setSearchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Результаты поиска</DialogTitle>
        <DialogContent>
          {searchResults.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
              Ничего не найдено
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Найдено работников: {searchResults.length}
              </Typography>
              {searchResults.map((worker) => (
                <Box key={worker.id} sx={{ mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="body1">
                    <strong>{worker.name}</strong> (ID: {worker.id})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {worker.position || 'Должность не указана'} • {worker.salary?.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SpecialOperations;

