import axios from 'axios';
import { DataGrid, GridColDef, GridColumnGroupingModel, GridColumnVisibilityModel, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid';
import { useState } from 'react';
import { formatTime, User, UserInfo } from '../utils/type';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Autocomplete, Box, Button, Card, Container, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Skeleton, Stack, styled, TextField, Typography, useTheme, CircularProgress } from '@mui/material';
import { Bounce, toast } from 'react-toastify';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { viVN as viVNGrid } from '@mui/x-data-grid/locales';
import { getCheckinDataByUserIdPaging } from '../apis/CheckinDataApi';
import { useUser } from '../contexts/AuthUserContext';
import { getDateFromString } from '../utils/calendarCalculate';
// import { useThemeContext } from '../contexts/ThemeContext';

export default function CheckinTablePage() {
    const [rows, setRows] = useState([]);
    const { nameOfUsers, loadingUsername } = useUser();
    // const [nameOfUsers, setNameOfUsers] = useState<UserInfo[]>([]);
    const [selectedName, setSelectedName] = useState<UserInfo>();
    const [selectedMonth, setSelectedMonth] = useState(() => (new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    // const [loadingNames, setLoadingNames] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useTranslation();
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
        userId: !isMobile,
        totalTime: !isMobile
    })


    const columnGroupingModel: GridColumnGroupingModel = [
        {
            groupId: t('table.personalInfo'),
            children: [{ field: 'id' }, { field: 'userId' }],
            headerAlign: 'center',
        }, {
            groupId: t('table.workingTime'),
            children: [{ field: 'workingDate' }, { field: 'inAt' }, { field: 'outAt' }, { field: 'totalTime' }],
            headerAlign: 'center',
        }
    ]

    const columns: GridColDef[] = [
        { field: 'id', headerName: '#', flex: 0.5, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'userId', headerName: 'Email', flex: 2, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'workingDate', headerName: t('table.day'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'inAt', headerName: t('table.inTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'outAt', headerName: t('table.outTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'totalTime', headerName: t('table.totalTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
    ];


    const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
        setColumnVisibilityModel(newModel);
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
            <GridToolbarContainer
                sx={{
                    gap: 2,
                    p: 2,
                    '& .MuiButton-root': {
                        color: 'text.primary',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                            color: 'text.primary'
                        },
                    },
                    '& .MuiButton-startIcon': {
                        color: 'text.primary'
                    }

                }}
            >
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector
                    slotProps={{ tooltip: { title: 'Change density' } }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    onClick={handleExportExcel}
                    disabled={exportLoading}
                    variant="contained"
                    sx={{
                        mb: 2,
                        px: 3,
                        py: 1.5,
                        backgroundColor: 'primary.light',
                        color: '#ffffff !important',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        boxShadow: 2,

                        '&:disabled': {
                            backgroundColor: 'action.disabledBackground',
                            color: 'action.disabled',
                        },
                        transition: 'all 0.3s ease'

                    }}
                    startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadRoundedIcon sx={{ color: "#ffffff !important" }} />}
                >
                    {exportLoading ? t('exporting') : t('ExportExcel')}
                </Button>
            </GridToolbarContainer>
        );
    }


    // useEffect(() => {
    //     async function fetchAllUserName() {
    //         try {
    //             setLoadingNames(true);
    //             const data = await getAllUserName();
    //             if (!data) {
    //                 setNameOfUsers([]);
    //                 toast.error(t('toastMessages.errorFetchingUsernames'), {
    //                     position: "top-center",
    //                     autoClose: 5000,
    //                     hideProgressBar: false,
    //                     closeOnClick: false,
    //                     pauseOnHover: true,
    //                     draggable: true,
    //                     progress: undefined,
    //                     theme: "light",
    //                     transition: Bounce,
    //                 });
    //             } else {
    //                 setNameOfUsers(data);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching user names:', error);
    //             setNameOfUsers([]);
    //         } finally {
    //             setLoadingNames(false);
    //         }
    //     }
    //     fetchAllUserName();
    // }, [t]);

    function handleSearch() {
        if (selectedName?.emailAndName === '' || selectedMonth === '' || selectedYear === '') {
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
        } else {
            if (selectedName?.emailAndName != undefined) {
                fetchDataByUserId(selectedName.emailAndName, parseInt(selectedMonth), parseInt(selectedYear));
            }
        }
    }

    const handleMonthChange = (e: SelectChangeEvent) => {
        setSelectedMonth(e.target.value);
    };

    const handleYearChange = (e: SelectChangeEvent) => {
        setSelectedYear(e.target.value);
    };

    async function fetchDataByUserId(userId: string, month: number, year: number): Promise<void> {
        setLoading(true);
        try {
            const userIdBeforeDash = userId.split('-')[0];
            const apiUrl = `${import.meta.env.VITE_API_URL}api/DataOnly_APIaCheckIn/GetUserByUserIdPaging`;
            const response = await axios.get(apiUrl, {
                params: {
                    month,
                    year,
                    userId: userIdBeforeDash,
                    page: paginationModel.page,
                    pageSize: paginationModel.pageSize
                },
            });

            const data = response.data;
            if (!data || !data.items || data.items.length === 0) {
                setRows([]);
                setRowCount(0);
                toast.error(t('canNotFind'), {
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

            const formattedData = data.items.map((item: User, index: number) => {
                const inAt = item.inAt ? new Date(item.inAt) : null;
                const outAt = item.outAt ? new Date(item.outAt) : null;

                const oneHour = 1 * 3600000; // 1 hour in milliseconds
                const oneMinute = 1 * 60000; // 1 minute in milliseconds

                let totalTime = 0;
                if (inAt && outAt) {
                    totalTime = (outAt.getTime() - inAt.getTime() - oneHour) / oneMinute;
                }

                const hours = Math.floor(totalTime / 60);
                const minutes = Math.floor(totalTime % 60);

                const formattedMinutes = minutes.toString().padStart(2, "0");

                return {
                    id: index + 1,
                    userId: item.userId,
                    workingDate: getDateFromString(item.inAt.toString()),
                    inAt: formatTime(item.inAt.toString()),
                    outAt: formatTime(item.outAt.toString()),
                    totalTime: hours > 0 || minutes > 0 ? `${hours}:${formattedMinutes}` : "N/A",
                };
            });
            setRowCount(data.totalCount);
            setRows(formattedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setRows([]);
            setRowCount(0);
        } finally {
            setLoading(false);
        }
    }

    const handleExportExcel = async () => {
        if (selectedName?.emailAndName === '' || selectedMonth === '' || selectedYear === '') {
            toast.error('Vui lòng chọn tên, tháng và năm trước khi xuất file!', {
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
        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}api/export/ExportUserCheckinData`;
            const selectedNameBeforeDash = selectedName?.emailAndName.split('-')[0];
            const response = await axios.get(apiUrl, {
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                    userID: selectedNameBeforeDash,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `checkin-data-${selectedName}-${new Date().toISOString()}.xlsx`);
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
            console.error('Error exporting Excel:', error);
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
    };

    async function fetchCheckinData(page: number, pageSize: number) {
        if (selectedName?.emailAndName === '' || selectedMonth === '' || selectedYear === '') {
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

        setLoading(true);
        try {
            const userId = selectedName?.emailAndName.split('-')[0];
            if (!userId) {
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
            const result = await getCheckinDataByUserIdPaging(
                parseInt(selectedMonth),
                parseInt(selectedYear),
                userId,
                page,
                pageSize
            );

            if (!result || !result.items || result.items.length === 0) {
                setRows([]);
                setRowCount(0);
                toast.error(t('canNotFind'), {
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

            const formattedData = result.items.map((item: User, index: number) => {
                const rowIndex = (page * pageSize) + index + 1
                const inAt = item.inAt ? new Date(item.inAt) : null;
                const outAt = item.outAt ? new Date(item.outAt) : null;

                const oneHour = 1 * 3600000; // 1 hour in milliseconds
                const oneMinute = 1 * 60000; // 1 minute in milliseconds

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
                    workingDate: getDateFromString(item.inAt.toString()),
                    inAt: formatTime(item.inAt.toString()),
                    outAt: formatTime(item.outAt.toString()),
                    totalTime: hours > 0 || minutes > 0 ? `${hours}:${formattedMinutes}` : "N/A",
                };
            });

            setRows(formattedData);
            setRowCount(result.totalCount);
        } catch (error) {
            console.error('Error fetching data:', error);
            setRows([]);
            setRowCount(0);
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
    };

    function handlePaginationModelChange(newModel: GridPaginationModel) {
        setPaginationModel(newModel);
        fetchCheckinData(newModel.page, newModel.pageSize);
    }

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
                        {t('staffCheckinTable')}
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
                        <Stack spacing={3}>
                            {/* Name Autocomplete */}
                            <Box sx={{ position: 'relative', overflow: 'visible' }}>
                                {loadingUsername ? (
                                    <Box sx={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: '4px',
                                            zIndex: 1
                                        }
                                    }}>
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                position: 'relative',
                                                zIndex: 2
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Autocomplete
                                        disablePortal
                                        options={nameOfUsers}
                                        getOptionLabel={(option) => option.emailAndName}
                                        value={selectedName}
                                        onChange={(_event, value) => setSelectedName(value || undefined)}
                                        slotProps={{
                                            popper: {
                                                sx: {
                                                    zIndex: 9999
                                                },
                                                placement: "bottom-start",
                                                modifiers: [
                                                    {
                                                        name: 'preventOverflow',
                                                        enabled: false
                                                    },
                                                    {
                                                        name: 'flip',
                                                        enabled: false
                                                    }
                                                ]
                                            },
                                            listbox: {
                                                sx: {
                                                    backgroundColor: 'background.paper',
                                                    color: 'text.primary',
                                                    zIndex: 9999,
                                                    maxHeight: '300px',
                                                    '& .MuiAutocomplete-option': {
                                                        '&[aria-selected="true"]': {
                                                            backgroundColor: 'primary.light',
                                                            color: 'primary.contrastText',
                                                            '&.Mui-focused': {
                                                                backgroundColor: 'primary.main',
                                                                color: 'primary.contrastText',
                                                            }
                                                        },
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover',
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('selectName')}
                                                variant="outlined"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        backgroundColor: 'background.paper',
                                                        color: 'text.primary',
                                                        '& fieldset': {
                                                            borderColor: 'grey.400',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'grey.600',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: 'text.primary',
                                                        },
                                                        '& .MuiAutocomplete-input': {
                                                            color: 'text.primary',
                                                            paddingLeft: '4px !important',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'text.secondary',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: 'text.secondary',
                                                    },
                                                    '& .MuiAutocomplete-popupIndicator': { color: 'text.secondary' },
                                                    '& .MuiAutocomplete-clearIndicator': { color: 'text.secondary' },
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            </Box>

                            {/* Month, Year Selection and Search Button */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                alignItems="center"
                                justifyContent="center"
                            >
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel id="month-select-label">{t('selectMonth')}</InputLabel>
                                    <Select
                                        labelId="month-select-label"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        label={t('selectMonth')}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel id="year-select-label">{t('selectYear')}</InputLabel>
                                    <Select
                                        labelId="year-select-label"
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        label={t('selectYear')}
                                    >
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <MenuItem key={i} value={2025 - i}>
                                                {2025 - i}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    startIcon={<SearchRoundedIcon />}
                                    sx={{
                                        mb: 2,
                                        px: 3,
                                        py: 1.5,
                                        backgroundColor: 'primary.light',
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        boxShadow: 2,
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                        '&:disabled': {
                                            backgroundColor: 'action.disabledBackground',
                                            color: 'action.disabled',
                                        },
                                        transition: 'all 0.3s ease'

                                    }}
                                >
                                    {t('Find')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Card>

                    {/* Data Grid Section */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            // background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            height: 'calc(100vh - 300px)',
                            minHeight: 800,
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
                                onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
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
                                columnGroupingModel={columnGroupingModel}
                                columnVisibilityModel={columnVisibilityModel}
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    '& .MuiDataGrid-columnHeader': {
                                        backgroundColor: 'background.paper',
                                        color: 'text.primary',
                                        fontWeight: 'bold'
                                    },
                                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                                        backgroundColor: 'background.paper',
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderColor: 'divider',
                                        color: 'text.primary'
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: 1,
                                        borderColor: 'divider',
                                        color: 'text.primary'
                                    },
                                    '& .MuiDataGrid-toolbarContainer': {
                                        color: 'text.primary'
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        borderBottom: 1,
                                        borderColor: 'divider'
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        backgroundColor: 'background.paper'
                                    }
                                }}
                            />
                        )}
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
