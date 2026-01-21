import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
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
import { format } from 'date-fns';
import { POSITION_LABELS, STATUS_LABELS } from '../utils/constants';

const WorkersTable = ({
  workers,
  totalElements,
  page,
  rowsPerPage,
  orderBy,
  order,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    onSort(property, isAsc ? 'desc' : 'asc');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FIRED':
        return 'error';
      case 'RECOMMENDED_FOR_PROMOTION':
        return 'success';
      case 'PROBATION':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    { id: 'id', label: 'ID', sortable: true, width: 80 },
    { id: 'name', label: 'Имя', sortable: true, width: 200 },
    { id: 'position', label: 'Должность', sortable: true, width: 180 },
    { id: 'status', label: 'Статус', sortable: true, width: 200 },
    { id: 'salary', label: 'Зарплата', sortable: true, width: 120 },
    { id: 'rating', label: 'Рейтинг', sortable: true, width: 100 },
    { id: 'creationDate', label: 'Дата создания', sortable: true, width: 150 },
    { id: 'actions', label: 'Действия', sortable: false, width: 150 },
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
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {workers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" style={{ padding: '40px' }}>
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            ) : (
              workers.map((worker) => (
                <TableRow key={worker.id} hover>
                  <TableCell>{worker.id}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>
                    {worker.position ? (
                      <Chip
                        label={POSITION_LABELS[worker.position] || worker.position}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {worker.status ? (
                      <Chip
                        label={STATUS_LABELS[worker.status] || worker.status}
                        size="small"
                        color={getStatusColor(worker.status)}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{worker.salary?.toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell>{worker.rating || '-'}</TableCell>
                  <TableCell>
                    {worker.creationDate ? format(new Date(worker.creationDate), 'dd.MM.yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Просмотр">
                      <IconButton size="small" onClick={() => onView(worker)} color="info">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {onEdit && (
                      <Tooltip title="Редактировать">
                        <IconButton size="small" onClick={() => onEdit(worker)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Удалить">
                        <IconButton size="small" onClick={() => onDelete(worker)} color="error">
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
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
      />
    </Paper>
  );
};

export default WorkersTable;

