import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    IconButton,
    useTheme,
    Switch,
    Button,
    Container,
    Stack,
    Card
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';

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

    const handleAddWorkDay = () => {
        console.log('Add new work day configuration');
    };

    const handleRefresh = () => {
        console.log('Refresh work day configurations');
    };

    // Custom toolbar for DataGrid
    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector 
                    slotProps={{ tooltip: { title: 'Change density' } }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    onClick={handleAddWorkDay}
                    className="mb-6 cursor-pointer px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    startIcon={<AddIcon />}
                >
                    {t('add')}
                </Button>
                <Button
                    onClick={handleRefresh}
                    className="mb-6 ml-2 cursor-pointer px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
                    startIcon={<RefreshIcon />}
                >
                    {t('refresh')}
                </Button>
            </GridToolbarContainer>
        );
    }

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
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #083B75 0%, #052A5E 100%)',
                py: 4,
                px: { xs: 2, sm: 4, md: 6 }
            }}
        >
            <Container maxWidth="xl">
                <Stack spacing={4}>
                    {/* Header */}
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            color: 'white',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            mb: 2,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        {t('customWorkWeek')}
                    </Typography>

                    {/* Description Card */}
                    <Card
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'visible',
                            zIndex: 2
                        }}
                    >
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                            {t('configureWorkHours')}
                        </Typography>
                    </Card>

                    {/* Data Grid Section */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            height: 'calc(100vh - 300px)',
                            minHeight: 400,
                            position: 'relative',
                            zIndex: 1,
                            '& .MuiDataGrid-root': {
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: isDarkMode 
                                        ? '1px solid rgba(255, 255, 255, 0.08)' 
                                        : '1px solid rgba(0, 0, 0, 0.08)'
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : '#f5f5f5',
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
                                    '&:nth-of-type(odd)': {
                                        backgroundColor: isDarkMode 
                                            ? 'rgba(15, 23, 42, 0.3)'
                                            : '#fafafa'
                                    },
                                    '&:hover': {
                                        backgroundColor: isDarkMode 
                                            ? 'rgba(30, 64, 175, 0.15)'
                                            : '#e3f2fd'
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
                            slots={{
                                toolbar: CustomToolbar
                            }}
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
                </Stack>
            </Container>
        </Box>
    );
} 