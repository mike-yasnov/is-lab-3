import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { importAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ImportPage = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // История импорта
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [downloading, setDownloading] = useState({});

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await importAPI.getHistory(page, rowsPerPage);
      setHistory(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Error fetching import history:', error);
      showSnackbar('Ошибка загрузки истории импорта', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        showSnackbar('Поддерживается только JSON формат', 'error');
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showSnackbar('Выберите файл для импорта', 'warning');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await importAPI.importWorkers(file);
      setUploadResult(response.data);
      showSnackbar(`Успешно импортировано ${response.data.addedCount} работников`, 'success');
      setFile(null);
      fetchHistory();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка импорта';
      setUploadResult({ status: 'FAILED', errorMessage });
      showSnackbar(errorMessage, 'error');
      fetchHistory();
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = async (historyId, fileName) => {
    setDownloading(prev => ({ ...prev, [historyId]: true }));
    
    try {
      const response = await importAPI.downloadFile(historyId);
      
      // Создаём blob из ответа
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Создаём ссылку для скачивания
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `import_${historyId}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Очищаем
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar('Файл успешно скачан', 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      showSnackbar('Ошибка скачивания файла', 'error');
    } finally {
      setDownloading(prev => ({ ...prev, [historyId]: false }));
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <Chip icon={<SuccessIcon />} label="Успешно" color="success" size="small" />;
      case 'FAILED':
        return <Chip icon={<ErrorIcon />} label="Ошибка" color="error" size="small" />;
      case 'IN_PROGRESS':
        return <Chip icon={<PendingIcon />} label="В процессе" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const downloadSampleFile = () => {
    const sampleData = [
      {
        name: "Иван Иванов",
        coordinates: { x: 100, y: 200 },
        salary: 50000,
        rating: 5,
        startDate: "2024-01-15T00:00:00.000Z",
        position: "DEVELOPER",
        status: "PROBATION",
        person: {
          eyeColor: "BROWN",
          hairColor: "BLACK",
          height: 175.5,
          birthday: "1990-05-20",
          location: { x: 10, y: 20, name: "Москва" }
        }
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_workers.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Импорт работников
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Массовая загрузка работников из JSON файла
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Секция загрузки файла */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Загрузка файла</Typography>
              </Box>
              
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: file ? 'action.selected' : 'background.paper',
                  mb: 2,
                }}
              >
                <input
                  accept=".json"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                  >
                    Выбрать файл
                  </Button>
                </label>
                
                {file && (
                  <Typography sx={{ mt: 2 }} color="primary">
                    Выбран: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Typography>
                )}
              </Box>

              {uploading && <LinearProgress sx={{ mb: 2 }} />}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                  fullWidth
                >
                  {uploading ? 'Загрузка...' : 'Импортировать'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={downloadSampleFile}
                  startIcon={<DownloadIcon />}
                >
                  Пример
                </Button>
              </Box>

              {uploadResult && (
                <Alert 
                  severity={uploadResult.status === 'SUCCESS' ? 'success' : 'error'}
                  sx={{ mt: 2 }}
                >
                  {uploadResult.status === 'SUCCESS' 
                    ? `Успешно импортировано ${uploadResult.addedCount} работников`
                    : uploadResult.errorMessage}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Информация о формате */}
          <Card elevation={3} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Формат файла
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Файл должен содержать JSON-массив объектов работников. Каждый объект должен включать:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li><Typography variant="body2">name - имя (обязательно)</Typography></li>
                <li><Typography variant="body2">coordinates - координаты {'{x, y}'} (обязательно)</Typography></li>
                <li><Typography variant="body2">salary - зарплата {'> 0'} (обязательно)</Typography></li>
                <li><Typography variant="body2">startDate - дата начала работы (обязательно)</Typography></li>
                <li><Typography variant="body2">person - информация о персоне (обязательно)</Typography></li>
                <li><Typography variant="body2">rating, position, status, organization - опционально</Typography></li>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* История импорта */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">История импорта</Typography>
                {user?.role === 'ADMIN' && (
                  <Chip label="Все операции" size="small" sx={{ ml: 1 }} />
                )}
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Статус</TableCell>
                          <TableCell>Пользователь</TableCell>
                          <TableCell>Добавлено</TableCell>
                          <TableCell>Дата</TableCell>
                          <TableCell>Файл</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{getStatusChip(item.status)}</TableCell>
                            <TableCell>{item.username}</TableCell>
                            <TableCell>
                              {item.status === 'SUCCESS' ? item.addedCount : '-'}
                            </TableCell>
                            <TableCell>{formatDate(item.timestamp)}</TableCell>
                            <TableCell>
                              {item.fileAvailable ? (
                                <Tooltip title={`Скачать ${item.fileName || 'файл'}`}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleDownloadFile(item.id, item.fileName)}
                                    disabled={downloading[item.id]}
                                  >
                                    {downloading[item.id] ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <FileDownloadIcon />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {history.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              Нет записей
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={totalElements}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    labelRowsPerPage="Строк:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                  />
                </>
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

export default ImportPage;
