import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { Box, Button, Card, CardContent, Container, Fade, IconButton, Paper, Skeleton, Stack, styled, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid';
import { formatTime, User } from '../utils/type';
import { formatDate } from '@fullcalendar/core/index.js';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import { PickersShortcutsItem } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import { viVN as viVNGrid } from '@mui/x-data-grid/locales';
import i18n from '../i18n';
import { getExportDataByDayRange } from '../apis/ExportDataApi';
import { getCheckinDataByDayRange } from '../apis/CheckinDataApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Bounce, toast } from 'react-toastify';
import { CircularProgress } from '@mui/material';

export default function CheckInByDayTable() {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [dateValue, setDateValue] = useState<[Dayjs | null, Dayjs | null]>([dayjs(), dayjs()]);
    const [rows, setRows] = useState<User[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useTranslation();

    async function handleExportExcelOfAllStaffByDateRange() {
        const dateRangeSelected = dateValue;
        const startDate = dateRangeSelected[0];
        const endDate = dateRangeSelected[1];
        if (startDate == null || endDate == null) {
            toast.error(t('error.inValidInput'), {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
            return;
        }

        setExportLoading(true);
        const startDay = startDate.date();
        const startMonth = startDate.month() + 1;
        const startYear = startDate.year();

        const endDay = endDate.date();
        const endMonth = endDate.month() + 1;
        const endYear = endDate.year();
        try {
            const response = await getExportDataByDayRange(startDay, startMonth, startYear, endDay, endMonth, endYear);
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `checkin-data-${new Date().toISOString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success(t('exportSuccess'), {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            toast.error(t('error.exportFailed'), {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } finally {
            setExportLoading(false);
        }
    }

    const shortcutsItems: PickersShortcutsItem<DateRange<Dayjs>>[] = [
        {
            label: t('dayRange.thisWeek'),
            getValue: () => {
                const today = dayjs();
                return [today.startOf('week'), today.endOf('week')];
            },
        },
        {
            label: t('dayRange.lastWeek'),
            getValue: () => {
                const today = dayjs();
                const prevWeek = today.subtract(7, 'day');
                return [prevWeek.startOf('week'), prevWeek.endOf('week')];
            },
        },
        {
            label: t('dayRange.last7days'),
            getValue: () => {
                const today = dayjs();
                return [today.subtract(7, 'day'), today];
            },
        },
        {
            label: t('dayRange.thisMonth'),
            getValue: () => {
                const today = dayjs();
                return [today.startOf('month'), today.endOf('month')];
            },
        },
        { label: t('dayRange.reset'), getValue: () => [null, null] },
    ];

    const columnVisibilityModel = {
        userId: !isMobile,
        totalTime: !isMobile,
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: '#', flex: 0.5, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'userId', headerName: 'Email', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'userFullName', headerName: t('table.fullName'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'workingDate', headerName: t('table.day'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'inAt', headerName: t('table.inTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'outAt', headerName: t('table.outTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'totalTime', headerName: t('table.workingTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
    ];

    function handleDateRangeChange(newValue: [Dayjs | null, Dayjs | null]) {
        setDateValue(newValue);
    }

    async function handleSearch(page: number, pageSize: number) {
        const dateValueSelected = dateValue;
        setLoading(true);
        if (dateValueSelected[0] && dateValueSelected[1]) {
            const startDate = dateValueSelected[0];
            const endDate = dateValueSelected[1];

            const startDay = startDate.date();
            const startMonth = startDate.month() + 1;
            const startYear = startDate.year();

            const endDay = endDate.date();
            const endMonth = endDate.month() + 1;
            const endYear = endDate.year();

            try {
                const data = await getCheckinDataByDayRange(startDay, startMonth, startYear, endDay, endMonth, endYear, page, pageSize);
                const formattedData = data.items.map((item: User, index: number) => {
                    const rowIndex = (page * pageSize) + index + 1;
                    const inAt = item.inAt ? new Date(item.inAt) : null;
                    const outAt = item.outAt ? new Date(item.outAt) : null;

                    const oneHour = 1 * 3600000;
                    const oneMinute = 1 * 60000;

                    let totalTime = 0;
                    if (inAt && outAt) {
                        totalTime = (outAt.getTime() - inAt.getTime() - oneHour) / oneMinute;
                    }

                    const hours = Math.floor(totalTime / 60);
                    const minutes = Math.floor(totalTime % 60);

                    const formattedMinutes = minutes.toString().padStart(2, "0");

                    return {
                        id: rowIndex,
                        userId: item.userId,
                        userFullName: item.fullName,
                        workingDate: formatDate(item.at),
                        inAt: formatTime(item.inAt.toString()),
                        outAt: formatTime(item.outAt.toString()),
                        totalTime: hours > 0 || minutes > 0 ? `${hours}:${formattedMinutes}` : "N/A",
                    };
                });
                setRows(formattedData);
                setRowCount(data.totalCount);
                setTimeout(() => {
                    setLoading(false);
                }, 2000)
            }
            catch (error) {
                console.error('Error fetching data:', error);
                toast.error(t('error.fetchFailed'), {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            } finally {
                setLoading(false);
            }
        }
    }

    function handlePaginationModelChange(newModel: GridPaginationModel) {
        setPaginationModel(newModel);
        handleSearch(newModel.page, newModel.pageSize);
    }

    const StyledGridOverlay = styled('div')(({ theme }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        '& .no-rows-primary': {
            fill: '#3D4751',
            ...theme.applyStyles('light', {
                fill: '#AEB8C2',
            }),
        },
        '& .no-rows-secondary': {
            fill: '#1D2126',
            ...theme.applyStyles('light', {
                fill: '#E8EAED',
            }),
        },
    }));

    function CustomNoRowsOverlay() {
        return (
            <StyledGridOverlay>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    width={96}
                    viewBox="0 0 452 257"
                    aria-hidden
                    focusable="false"
                    className='pt-5'
                >
                    <path
                        className="no-rows-primary"
                        d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
                    />
                    <path
                        className="no-rows-primary"
                        d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
                    />
                    <path
                        className="no-rows-primary"
                        d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
                    />
                    <path
                        className="no-rows-secondary"
                        d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
                    />
                </svg>
                <Box sx={{ mt: 2 }}>{t('dataGrid.noRows')}</Box>
            </StyledGridOverlay>
        );
    }

    function MyCustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector
                    slotProps={{ tooltip: { title: 'Change density' } }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    onClick={handleExportExcelOfAllStaffByDateRange}
                    disabled={exportLoading}
                    className="mb-6 cursor-pointer px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadRoundedIcon />}
                >
                    {exportLoading ? t('exporting') : t('ExportExcel')}
                </Button>
            </GridToolbarContainer>
        );
    }

    const CustomButton = styled(Button)(() => ({
        background: 'linear-gradient(45deg, #00CAFF 30%, #0A4C94 90%)',
        borderRadius: '12px',
        border: 0,
        color: 'white',
        padding: '12px 24px',
        boxShadow: '0 3px 5px 2px rgba(8, 59, 117, .3)',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(8, 59, 117, .4)',
        },
    }));

    return (
        <Fade in={true} timeout={800}>
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
                            {t('staffCheckinTableByDay')}
                        </Typography>

                        {/* Search Section */}
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
                            <CardContent>
                                <Stack spacing={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateRangePicker']}>
                                            <DateRangePicker
                                                defaultValue={[dayjs(), dayjs()]}
                                                sx={{
                                                    width: '100%',
                                                    '& .MuiInputBase-root': {
                                                        borderRadius: '12px',
                                                        transition: 'all 0.3s ease',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 8px rgba(8, 59, 117, 0.1)',
                                                            backgroundColor: 'white',
                                                        },
                                                    },
                                                    '& .MuiPickersDay-root': {
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            backgroundColor: '#D1E4F6',
                                                            transform: 'scale(1.1)',
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#083B75',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: '#0A4C94',
                                                            },
                                                        },
                                                    },
                                                }}
                                                slotProps={{
                                                    shortcuts: { items: shortcutsItems },
                                                }}
                                                onChange={handleDateRangeChange}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>

                                    <div className="flex justify-center items-center space-x-4">
                                        <CustomButton
                                            className="w-full md:w-1/3 text-lg py-3"
                                            onClick={() => handleSearch(paginationModel.page, paginationModel.pageSize)}
                                        >
                                            {t('Find')}
                                        </CustomButton>
                                        <Tooltip title={t('refresh')} arrow>
                                            <IconButton 
                                                onClick={() => handleSearch(paginationModel.page, paginationModel.pageSize)}
                                                sx={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    }
                                                }}
                                            >
                                                <RefreshIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </Stack>
                            </CardContent>
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
                                zIndex: 1
                            }}
                        >
                            {loading ? (
                                <Box sx={{ width: '100%', height: '100%' }}>
                                    <Skeleton animation="wave" height={60} />
                                    <Skeleton animation="wave" height={60} />
                                    <Skeleton animation="wave" height={60} />
                                    <Skeleton animation="wave" height={60} />
                                </Box>
                            ) : (
                                <DataGrid
                                    disableVirtualization={true}
                                    rows={rows}
                                    columns={columns}
                                    paginationMode='server'
                                    rowCount={rowCount}
                                    pageSizeOptions={[5, 10, 20, 50]}
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={handlePaginationModelChange}
                                    localeText={i18n.language === 'vi' ? viVNGrid.components.MuiDataGrid.defaultProps.localeText : undefined}
                                    slots={{
                                        toolbar: MyCustomToolbar,
                                        noRowsOverlay: CustomNoRowsOverlay
                                    }}
                                    columnVisibilityModel={columnVisibilityModel}
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-columnHeader': {
                                            backgroundColor: '#f8fafc',
                                            color: '#083B75',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem',
                                            '&:hover': {
                                                backgroundColor: '#D1E4F6',
                                            }
                                        },
                                        '& .MuiDataGrid-row': {
                                            transition: 'background-color 0.2s ease',
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: '#f8fafc',
                                            },
                                            '&:hover': {
                                                backgroundColor: '#D1E4F6',
                                                transform: 'scale(1.002)',
                                            },
                                        },
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #e2e8f0',
                                            '&:hover': {
                                                color: '#083B75',
                                            }
                                        },
                                        '& .MuiDataGrid-columnSeparator': {
                                            display: 'none',
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            borderTop: '1px solid #e2e8f0',
                                        },
                                        '& .MuiTablePagination-root': {
                                            color: '#083B75',
                                        }
                                    }}
                                />
                            )}
                        </Paper>
                    </Stack>
                </Container>
            </Box>
        </Fade>
    );
}
