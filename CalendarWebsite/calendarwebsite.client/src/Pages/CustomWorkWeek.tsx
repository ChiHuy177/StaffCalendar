import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    IconButton,
    useTheme,
    Switch
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface WorkDay {
    id: number;
    name: string;
    morningStart: string;
    morningEnd: string;
    afternoonStart: string;
    afternoonEnd: string;
    isWorkingDay: boolean;
}

export default function CustomWorkWeek() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    // Empty array for work days
    const [workDays, setWorkDays] = useState<WorkDay[]>([]);

    // Handlers would be connected to real functionality in a complete implementation
    const handleEdit = (id: number) => {
        console.log('Edit day with ID:', id);
    };

    const handleDelete = (id: number) => {
        console.log('Delete day with ID:', id);
    };

    const handleWorkingDayToggle = (id: number) => {
        setWorkDays(prevDays => 
            prevDays.map(day => 
                day.id === id ? { ...day, isWorkingDay: !day.isWorkingDay } : day
            )
        );
    };

    // Define columns for DataGrid
    const columns: GridColDef[] = [
        { 
            field: 'name', 
            headerName: t('day'), 
            flex: 2,
            headerClassName: 'data-grid-header'
        },
        { 
            field: 'morningStart', 
            headerName: t('morningStart'), 
            flex: 1.5,
            headerClassName: 'data-grid-header',
            valueGetter: ({ row }: { row: WorkDay }) => 
                row.isWorkingDay ? row.morningStart : '—'
        },
        { 
            field: 'morningEnd', 
            headerName: t('morningEnd'), 
            flex: 1.5,
            headerClassName: 'data-grid-header',
            valueGetter: ({ row }: { row: WorkDay }) => 
                row.isWorkingDay ? row.morningEnd : '—'
        },
        { 
            field: 'afternoonStart', 
            headerName: t('afternoonStart'), 
            flex: 1.5,
            headerClassName: 'data-grid-header',
            valueGetter: ({ row }: { row: WorkDay }) => 
                row.isWorkingDay ? row.afternoonStart : '—'
        },
        { 
            field: 'afternoonEnd', 
            headerName: t('afternoonEnd'), 
            flex: 1.5,
            headerClassName: 'data-grid-header',
            valueGetter: ({ row }: { row: WorkDay }) => 
                row.isWorkingDay ? row.afternoonEnd : '—'
        },
        { 
            field: 'isWorkingDay', 
            headerName: t('workingDay'), 
            flex: 1,
            headerClassName: 'data-grid-header',
            renderCell: (params: GridRenderCellParams) => {
                const row = params.row as WorkDay;
                return (
                    <Switch 
                        checked={row.isWorkingDay} 
                        onChange={() => handleWorkingDayToggle(row.id)}
                        color="primary"
                        size="small"
                    />
                );
            }
        },
        { 
            field: 'actions', 
            headerName: t('actions'), 
            flex: 1,
            headerClassName: 'data-grid-header',
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => {
                const row = params.row as WorkDay;
                return (
                    <Box display="flex">
                        <IconButton 
                            size="small" 
                            onClick={() => handleEdit(row.id)}
                            sx={{ color: isDarkMode ? '#60A5FA' : '#2563EB' }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            onClick={() => handleDelete(row.id)}
                            sx={{ color: isDarkMode ? '#F87171' : '#DC2626' }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                );
            }
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('customWorkWeek')}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    {t('configureWorkHours')}
                </Typography>
            </Box>

            <Paper 
                elevation={3} 
                sx={{ 
                    overflow: 'hidden',
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'white',
                    boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
                    height: 'calc(100vh - 250px)',
                    minHeight: 400,
                    '& .MuiDataGrid-root': {
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            borderBottom: isDarkMode 
                                ? '1px solid rgba(255, 255, 255, 0.08)' 
                                : '1px solid rgba(0, 0, 0, 0.08)'
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : '#f8fafc',
                            borderBottom: isDarkMode 
                                ? '2px solid rgba(255, 255, 255, 0.1)' 
                                : '2px solid rgba(0, 0, 0, 0.1)'
                        },
                        '& .data-grid-header': {
                            fontWeight: 'bold',
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none'
                        },
                        '& .MuiDataGrid-menuIcon': {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : undefined
                        },
                        '& .MuiDataGrid-toolbarContainer': {
                            padding: 2,
                            paddingBottom: 0,
                            color: isDarkMode ? 'white' : undefined
                        },
                        '& .MuiDataGrid-row': {
                            '&:hover': {
                                backgroundColor: isDarkMode 
                                    ? 'rgba(30, 64, 175, 0.15)'
                                    : 'rgba(59, 130, 246, 0.08)'
                            }
                        },
                        '& .MuiDataGrid-overlay': {
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : undefined
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: isDarkMode 
                                ? '1px solid rgba(255, 255, 255, 0.12)' 
                                : undefined,
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : undefined
                        },
                        '& .MuiTablePagination-root': {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined
                        },
                        '& .MuiDataGrid-selectedRowCount': {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined
                        }
                    }
                }}
            >
                <DataGrid
                    rows={workDays}
                    columns={columns}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    disableRowSelectionOnClick
                    autoHeight
                    localeText={{
                        noRowsLabel: t('dataGrid.noRows'),
                        footerRowSelected: (count) => `${count} ${t('row')} ${t('selected')}`,
                        columnMenuLabel: t('dataGrid.columns'),
                        columnMenuShowColumns: t('dataGrid.columns'),
                        columnMenuFilter: t('dataGrid.filter'),
                        columnMenuHideColumn: t('hide'),
                        columnMenuUnsort: t('unsort'),
                        columnMenuSortAsc: t('sortAsc'),
                        columnMenuSortDesc: t('sortDesc'),
                        columnHeaderSortIconLabel: t('sort'),
                    }}
                />
            </Paper>
        </motion.div>
    );
} 