import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
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
  Business as BusinessIcon,
} from '@mui/icons-material';
import OrganizationsTable from '../components/OrganizationsTable';
import OrganizationForm from '../components/OrganizationForm';
import { organizationsAPI } from '../services/api';
import { ORG_TYPE_LABELS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const OrganizationsPage = () => {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchOrganizations = async () => {
    try {
      const response = await organizationsAPI.getAll();
      setOrganizations(response.data);
    } catch (error) {
      showSnackbar('Ошибка загрузки организаций', 'error');
      console.error('Error fetching organizations:', error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenForm = (org = null) => {
    setSelectedOrg(org);
    setIsEditMode(!!org);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedOrg(null);
    setIsEditMode(false);
  };

  const handleSubmitForm = async (data) => {
    try {
      if (isEditMode) {
        await organizationsAPI.update(selectedOrg.id, data);
        showSnackbar('Организация успешно обновлена', 'success');
      } else {
        await organizationsAPI.create(data);
        showSnackbar('Организация успешно создана', 'success');
      }
      handleCloseForm();
      fetchOrganizations();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка при сохранении организации';
      showSnackbar(errorMessage, 'error');
      console.error('Error saving organization:', error);
    }
  };

  const handleView = (org) => {
    setSelectedOrg(org);
    setOpenDetails(true);
  };

  const handleDelete = (org) => {
    setSelectedOrg(org);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await organizationsAPI.delete(selectedOrg.id);
      showSnackbar('Организация успешно удалена', 'success');
      setOpenDelete(false);
      fetchOrganizations();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка при удалении организации';
      showSnackbar(errorMessage, 'error');
      console.error('Error deleting organization:', error);
      setOpenDelete(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Управление организациями
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Список организаций, в которых могут работать сотрудники
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">
                    Всего организаций: {organizations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Создавайте организации для назначения работников
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, height: '100%', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={fetchOrganizations}
              startIcon={<RefreshIcon />}
            >
              Обновить
            </Button>
            {isAuthenticated() ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                size="large"
              >
                Добавить организацию
              </Button>
            ) : (
              <Tooltip title="Войдите для добавления организаций">
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    disabled
                    size="large"
                  >
                    Добавить организацию
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <OrganizationsTable
          organizations={organizations}
          onView={handleView}
          onEdit={isAuthenticated() ? handleOpenForm : null}
          onDelete={isAuthenticated() ? handleDelete : null}
        />
      </Box>

      {/* Organization Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Редактировать организацию' : 'Создать организацию'}
        </DialogTitle>
        <DialogContent>
          <OrganizationForm
            organization={selectedOrg}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Organization Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Информация об организации</DialogTitle>
        <DialogContent>
          {selectedOrg && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedOrg.id}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Тип</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ORG_TYPE_LABELS[selectedOrg.type] || 'Не указан'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Годовой оборот</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedOrg.annualTurnover?.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Сотрудников</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedOrg.employeesCount?.toLocaleString('ru-RU')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Рейтинг</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedOrg.rating}</Typography>
                </Grid>
                {selectedOrg.officialAddress && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Официальный адрес</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedOrg.officialAddress.street || ''} {selectedOrg.officialAddress.zipCode}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Почтовый адрес</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedOrg.postalAddress?.street || ''} {selectedOrg.postalAddress?.zipCode}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить организацию <strong>{ORG_TYPE_LABELS[selectedOrg?.type] || 'ID: ' + selectedOrg?.id}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Внимание: Если с этой организацией связаны работники, удаление будет невозможно.
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

export default OrganizationsPage;

