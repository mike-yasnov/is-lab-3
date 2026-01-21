import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { ORG_TYPE_LABELS } from '../utils/constants';

const OrganizationsTable = ({ organizations, onView, onEdit, onDelete }) => {
  const columns = [
    { id: 'id', label: 'ID', width: 80 },
    { id: 'type', label: 'Тип', width: 200 },
    { id: 'annualTurnover', label: 'Годовой оборот', width: 150 },
    { id: 'employeesCount', label: 'Сотрудников', width: 120 },
    { id: 'rating', label: 'Рейтинг', width: 100 },
    { id: 'postalAddress', label: 'Почтовый адрес', width: 250 },
    { id: 'actions', label: 'Действия', width: 150 },
  ];

  return (
    <Paper elevation={3}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}
                  width={column.width}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" style={{ padding: '40px' }}>
                  Нет организаций для отображения
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id} hover>
                  <TableCell>{org.id}</TableCell>
                  <TableCell>
                    {org.type ? (
                      <Chip
                        label={ORG_TYPE_LABELS[org.type] || org.type}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{org.annualTurnover?.toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell>{org.employeesCount?.toLocaleString('ru-RU')}</TableCell>
                  <TableCell>
                    <Chip label={org.rating} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    {org.postalAddress?.street || ''} {org.postalAddress?.zipCode}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Просмотр">
                      <IconButton size="small" onClick={() => onView(org)} color="info">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {onEdit && (
                      <Tooltip title="Редактировать">
                        <IconButton size="small" onClick={() => onEdit(org)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Удалить">
                        <IconButton size="small" onClick={() => onDelete(org)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OrganizationsTable;

