import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  POSITION_LABELS,
  STATUS_LABELS,
  COLOR_LABELS,
  ORG_TYPE_LABELS,
} from '../utils/constants';

const WorkerDetails = ({ worker }) => {
  const InfoItem = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Основная информация</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="ID" value={worker.id} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Имя" value={worker.name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    label="Должность"
                    value={
                      worker.position && (
                        <Chip
                          label={POSITION_LABELS[worker.position]}
                          color="primary"
                          size="small"
                        />
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    label="Статус"
                    value={
                      worker.status && (
                        <Chip
                          label={STATUS_LABELS[worker.status]}
                          color="success"
                          size="small"
                        />
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoItem label="Зарплата" value={`${worker.salary?.toLocaleString('ru-RU')} ₽`} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoItem label="Рейтинг" value={worker.rating} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoItem
                    label="Дата создания"
                    value={worker.creationDate && format(new Date(worker.creationDate), 'dd.MM.yyyy')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    label="Дата начала работы"
                    value={worker.startDate && format(new Date(worker.startDate), 'dd.MM.yyyy')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Координаты */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Координаты</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoItem label="X" value={worker.coordinates?.x} />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem label="Y" value={worker.coordinates?.y} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Персональные данные */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Персональные данные</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoItem label="Цвет глаз" value={COLOR_LABELS[worker.person?.eyeColor]} />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem label="Цвет волос" value={COLOR_LABELS[worker.person?.hairColor]} />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem label="Рост" value={worker.person?.height && `${worker.person.height} см`} />
                </Grid>
                <Grid item xs={6}>
                  <InfoItem
                    label="Дата рождения"
                    value={worker.person?.birthday && format(new Date(worker.person.birthday), 'dd.MM.yyyy')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Организация */}
        {worker.organization && (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Организация</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <InfoItem
                      label="Тип"
                      value={ORG_TYPE_LABELS[worker.organization.type]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InfoItem
                      label="Годовой оборот"
                      value={worker.organization.annualTurnover?.toLocaleString('ru-RU')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InfoItem
                      label="Кол-во сотрудников"
                      value={worker.organization.employeesCount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="Рейтинг" value={worker.organization.rating} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default WorkerDetails;

