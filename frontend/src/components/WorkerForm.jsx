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
import {
  POSITIONS,
  STATUSES,
  COLORS,
  POSITION_LABELS,
  STATUS_LABELS,
  COLOR_LABELS,
  ORG_TYPE_LABELS,
} from '../utils/constants';
import { organizationsAPI } from '../services/api';

const WorkerForm = ({ worker, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    salary: '',
    rating: '',
    startDate: '',
    position: '',
    status: '',
    organizationId: '',
    coordinates: {
      x: '',
      y: '',
    },
    person: {
      eyeColor: '',
      hairColor: '',
      height: '',
      birthday: '',
    },
  });

  const [organizations, setOrganizations] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Загрузка организаций
    const fetchOrganizations = async () => {
      try {
        const response = await organizationsAPI.getAll();
        setOrganizations(response.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    fetchOrganizations();

    if (worker) {
      setFormData({
        name: worker.name || '',
        salary: worker.salary || '',
        rating: worker.rating || '',
        startDate: worker.startDate ? worker.startDate.split('T')[0] : '',
        position: worker.position || '',
        status: worker.status || '',
        organizationId: worker.organization?.id || '',
        coordinates: {
          x: worker.coordinates?.x || '',
          y: worker.coordinates?.y || '',
        },
        person: {
          eyeColor: worker.person?.eyeColor || '',
          hairColor: worker.person?.hairColor || '',
          height: worker.person?.height || '',
          birthday: worker.person?.birthday || '',
        },
      });
    }
  }, [worker]);

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
    // Очистить ошибку поля при изменении
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Зарплата должна быть > 0';
    if (formData.rating && formData.rating <= 0) newErrors.rating = 'Рейтинг должен быть > 0';
    if (!formData.startDate) newErrors.startDate = 'Дата начала работы обязательна';

    if (!formData.coordinates.x) newErrors.coordinatesX = 'Координата X обязательна';
    else if (formData.coordinates.x > 500) newErrors.coordinatesX = 'Макс. значение: 500';

    if (formData.coordinates.y === '') newErrors.coordinatesY = 'Координата Y обязательна';
    else if (formData.coordinates.y > 381) newErrors.coordinatesY = 'Макс. значение: 381';

    if (!formData.person.eyeColor) newErrors.eyeColor = 'Цвет глаз обязателен';
    if (!formData.person.hairColor) newErrors.hairColor = 'Цвет волос обязателен';
    if (!formData.person.height || formData.person.height <= 0)
      newErrors.height = 'Рост должен быть > 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        ...formData,
        salary: Number(formData.salary),
        rating: formData.rating ? Number(formData.rating) : null,
        startDate: new Date(formData.startDate).toISOString(),
        organization: formData.organizationId
          ? organizations.find(org => org.id === Number(formData.organizationId))
          : null,
        coordinates: {
          x: Number(formData.coordinates.x),
          y: Number(formData.coordinates.y),
        },
        person: {
          ...formData.person,
          height: Number(formData.person.height),
          birthday: formData.person.birthday || null,
        },
      };
      // Убираем organizationId из submitData
      delete submitData.organizationId;
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
            label="Имя *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Зарплата *"
            name="salary"
            type="number"
            value={formData.salary}
            onChange={handleChange}
            error={!!errors.salary}
            helperText={errors.salary}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Рейтинг"
            name="rating"
            type="number"
            value={formData.rating}
            onChange={handleChange}
            error={!!errors.rating}
            helperText={errors.rating}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Должность"
            name="position"
            value={formData.position}
            onChange={handleChange}
          >
            <MenuItem value="">Не указано</MenuItem>
            {POSITIONS.map((pos) => (
              <MenuItem key={pos} value={pos}>
                {POSITION_LABELS[pos]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Статус"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <MenuItem value="">Не указано</MenuItem>
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Дата начала работы *"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Организация"
            name="organizationId"
            value={formData.organizationId}
            onChange={handleChange}
          >
            <MenuItem value="">Не указано</MenuItem>
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {ORG_TYPE_LABELS[org.type] || 'Организация'} (ID: {org.id}, Рейтинг: {org.rating})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Координаты
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="X (макс. 500) *"
            name="coordinates.x"
            type="number"
            value={formData.coordinates.x}
            onChange={handleChange}
            error={!!errors.coordinatesX}
            helperText={errors.coordinatesX}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Y (макс. 381) *"
            name="coordinates.y"
            type="number"
            value={formData.coordinates.y}
            onChange={handleChange}
            error={!!errors.coordinatesY}
            helperText={errors.coordinatesY}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Персональные данные
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Цвет глаз *"
            name="person.eyeColor"
            value={formData.person.eyeColor}
            onChange={handleChange}
            error={!!errors.eyeColor}
            helperText={errors.eyeColor}
          >
            {COLORS.map((color) => (
              <MenuItem key={color} value={color}>
                {COLOR_LABELS[color]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Цвет волос *"
            name="person.hairColor"
            value={formData.person.hairColor}
            onChange={handleChange}
            error={!!errors.hairColor}
            helperText={errors.hairColor}
          >
            {COLORS.map((color) => (
              <MenuItem key={color} value={color}>
                {COLOR_LABELS[color]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Рост (см) *"
            name="person.height"
            type="number"
            value={formData.person.height}
            onChange={handleChange}
            error={!!errors.height}
            helperText={errors.height}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Дата рождения"
            name="person.birthday"
            type="date"
            value={formData.person.birthday}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Отмена
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {worker ? 'Сохранить' : 'Создать'}
        </Button>
      </Box>
    </Box>
  );
};

export default WorkerForm;

