import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import { ORGANIZATION_TYPES, ORG_TYPE_LABELS } from '../utils/constants';

const OrganizationForm = ({ organization, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    annualTurnover: '',
    employeesCount: '',
    rating: '',
    type: '',
    officialAddress: {
      street: '',
      zipCode: '',
    },
    postalAddress: {
      street: '',
      zipCode: '',
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (organization) {
      setFormData({
        annualTurnover: organization.annualTurnover || '',
        employeesCount: organization.employeesCount || '',
        rating: organization.rating || '',
        type: organization.type || '',
        officialAddress: {
          street: organization.officialAddress?.street || '',
          zipCode: organization.officialAddress?.zipCode || '',
        },
        postalAddress: {
          street: organization.postalAddress?.street || '',
          zipCode: organization.postalAddress?.zipCode || '',
        },
      });
    }
  }, [organization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.annualTurnover || formData.annualTurnover <= 0)
      newErrors.annualTurnover = 'Годовой оборот должен быть > 0';
    if (!formData.employeesCount || formData.employeesCount <= 0)
      newErrors.employeesCount = 'Количество сотрудников должно быть > 0';
    if (!formData.rating || formData.rating <= 0)
      newErrors.rating = 'Рейтинг должен быть > 0';
    if (!formData.postalAddress.zipCode)
      newErrors.postalZipCode = 'Почтовый индекс обязателен';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        ...formData,
        annualTurnover: Number(formData.annualTurnover),
        employeesCount: Number(formData.employeesCount),
        rating: Number(formData.rating),
        officialAddress: formData.officialAddress.zipCode
          ? {
              street: formData.officialAddress.street || null,
              zipCode: formData.officialAddress.zipCode,
            }
          : null,
        postalAddress: {
          street: formData.postalAddress.street || null,
          zipCode: formData.postalAddress.zipCode,
        },
      };
      onSubmit(submitData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Основная информация
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Годовой оборот *"
            name="annualTurnover"
            type="number"
            value={formData.annualTurnover}
            onChange={handleChange}
            error={!!errors.annualTurnover}
            helperText={errors.annualTurnover}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Количество сотрудников *"
            name="employeesCount"
            type="number"
            value={formData.employeesCount}
            onChange={handleChange}
            error={!!errors.employeesCount}
            helperText={errors.employeesCount}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Рейтинг *"
            name="rating"
            type="number"
            value={formData.rating}
            onChange={handleChange}
            error={!!errors.rating}
            helperText={errors.rating}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Тип организации"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <MenuItem value="">Не указано</MenuItem>
            {ORGANIZATION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {ORG_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Официальный адрес
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Улица"
            name="officialAddress.street"
            value={formData.officialAddress.street}
            onChange={handleChange}
            inputProps={{ maxLength: 113 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Индекс"
            name="officialAddress.zipCode"
            value={formData.officialAddress.zipCode}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Почтовый адрес *
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Улица"
            name="postalAddress.street"
            value={formData.postalAddress.street}
            onChange={handleChange}
            inputProps={{ maxLength: 113 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Индекс *"
            name="postalAddress.zipCode"
            value={formData.postalAddress.zipCode}
            onChange={handleChange}
            error={!!errors.postalZipCode}
            helperText={errors.postalZipCode}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Отмена
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {organization ? 'Сохранить' : 'Создать'}
        </Button>
      </Box>
    </Box>
  );
};

export default OrganizationForm;

