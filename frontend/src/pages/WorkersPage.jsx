import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import WorkersTable from '../components/WorkersTable';
import WorkerForm from '../components/WorkerForm';
import WorkerDetails from '../components/WorkerDetails';
import { workersAPI } from '../services/api';
import websocketService from '../services/websocket';
import { useAuth } from '../context/AuthContext';

const WorkersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [searchName, setSearchName] = useState('');
  
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchWorkers = async () => {
    try {
      const response = await workersAPI.getAll(
        page,
        rowsPerPage,
        orderBy,
        order.toUpperCase()
      );
      setWorkers(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      showSnackbar('Ошибка загрузки данных', 'error');
      console.error('Error fetching workers:', error);
    }
  };

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, orderBy, order]);

  useEffect(() => {
    // WebSocket подключение
    websocketService.connect();

    const unsubscribeCreated = websocketService.onWorkerCreated((worker) => {
      showSnackbar(`Создан новый работник: ${worker.name}`, 'info');
      fetchWorkers();
    });

    const unsubscribeUpdated = websocketService.onWorkerUpdated((worker) => {
      showSnackbar(`Обновлён работник: ${worker.name}`, 'info');
      fetchWorkers();
    });

    const unsubscribeDeleted = websocketService.onWorkerDeleted((workerId) => {
      showSnackbar(`Удалён работник ID: ${workerId}`, 'info');
      fetchWorkers();
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      websocketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property, direction) => {
    setOrderBy(property);
    setOrder(direction);
  };

  const handleOpenForm = (worker = null) => {
    setSelectedWorker(worker);
    setIsEditMode(!!worker);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedWorker(null);
    setIsEditMode(false);
  };

  const handleSubmitForm = async (data) => {
    try {
      if (isEditMode) {
        await workersAPI.update(selectedWorker.id, data);
        showSnackbar('Работник успешно обновлён', 'success');
      } else {
        await workersAPI.create(data);
        showSnackbar('Работник успешно создан', 'success');
      }
      handleCloseForm();
      fetchWorkers();
    } catch (error) {
      showSnackbar('Ошибка при сохранении', 'error');
      console.error('Error saving worker:', error);
    }
  };

  const handleView = (worker) => {
    setSelectedWorker(worker);
    setOpenDetails(true);
  };

  const handleDelete = (worker) => {
    setSelectedWorker(worker);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await workersAPI.delete(selectedWorker.id);
      showSnackbar('Работник успешно удалён', 'success');
      setOpenDelete(false);
      fetchWorkers();
    } catch (error) {
      showSnackbar('Ошибка при удалении', 'error');
      console.error('Error deleting worker:', error);
    }
  };

  const handleSearch = async () => {
    if (searchName.trim()) {
      try {
        const response = await workersAPI.searchByName(searchName);
        setWorkers(response.data);
        setTotalElements(response.data.length);
      } catch (error) {
        showSnackbar('Ошибка поиска', 'error');
      }
    } else {
      fetchWorkers();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Система управления работниками
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Управление данными о сотрудниках компании
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Поиск по имени"
                  variant="outlined"
                  size="small"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  fullWidth
                />
                <Button variant="contained" onClick={handleSearch}>
                  Поиск
                </Button>
                <Button
                  variant="outlined"
                  onClick={fetchWorkers}
                  startIcon={<RefreshIcon />}
                >
                  Сбросить
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
            {isAuthenticated() ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                size="large"
                sx={{ height: '56px' }}
              >
                Добавить работника
              </Button>
            ) : (
              <Tooltip title="Войдите для добавления работников">
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    disabled
                    size="large"
                    sx={{ height: '56px' }}
                  >
                    Добавить работника
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <WorkersTable
          workers={workers}
          totalElements={totalElements}
          page={page}
          rowsPerPage={rowsPerPage}
          orderBy={orderBy}
          order={order}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSort={handleSort}
          onView={handleView}
          onEdit={isAuthenticated() ? handleOpenForm : null}
          onDelete={isAuthenticated() ? handleDelete : null}
        />
      </Box>

      {/* Worker Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Редактировать работника' : 'Создать работника'}
        </DialogTitle>
        <DialogContent>
          <WorkerForm
            worker={selectedWorker}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Worker Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Информация о работнике</DialogTitle>
        <DialogContent>
          {selectedWorker && <WorkerDetails worker={selectedWorker} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Закрыть</Button>
          <Button onClick={() => {
            setOpenDetails(false);
            handleOpenForm(selectedWorker);
          }} variant="contained">
            Редактировать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить работника <strong>{selectedWorker?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Это действие нельзя отменить. Связанные объекты также будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Отмена</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WorkersPage;

