import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Functions as FunctionsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import SpecialOperations from '../components/SpecialOperations';

const SpecialOperationsPage = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOperationComplete = () => {
    // Можно добавить дополнительную логику после выполнения операций
    console.log('Operation completed');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FunctionsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Специальные операции
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Дополнительные операции для работы с данными работников
            </Typography>
          </Box>
        </Box>
      </Box>


      {/* Специальные операции */}
      <SpecialOperations 
        onOperationComplete={handleOperationComplete}
        showSnackbar={showSnackbar}
      />

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

export default SpecialOperationsPage;

