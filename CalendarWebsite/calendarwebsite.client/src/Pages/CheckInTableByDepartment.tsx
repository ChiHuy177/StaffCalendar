import { Autocomplete, Box, Button, Card, CardContent, Fade, IconButton, Skeleton, Stack, styled, TextField, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { Department, formatTime, User } from "../utils/type";
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from "@mui/x-data-grid";
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs, { Dayjs } from "dayjs";
import { PickersShortcutsItem } from "@mui/x-date-pickers";
import { DateRange } from "@mui/x-date-pickers-pro/models";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { Bounce, toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
// import i18n from "../i18n";
import { viVN as viVNGrid } from '@mui/x-data-grid/locales';
import { getAllDepartmentName, getCheckinDataByDepartmentId, getUserFullNameByDepartmentId } from "../apis/CheckinDataApi";
import { useThemeContext } from "../contexts/ThemeContext";
import { getDateFromString } from "../utils/calendarCalculate";


export default function CheckInTableByDepartment() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [nameOfUsers, setNameOfUsers] = useState<string[]>([]);
    const [rows, setRows] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
    const [dateValue, setDateValue] = useState<[Dayjs | null, Dayjs | null]>([dayjs(), dayjs()]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [userId, setUserId] = useState<string>("");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { t, i18n } = useTranslation();
    const { isDarkMode } = useThemeContext();
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
        userId: !isMobile,
        totalTime: !isMobile
    })

    const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
        setColumnVisibilityModel(newModel);
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


    const columns: GridColDef[] = [
        { field: 'id', headerName: '#', flex: 0.5, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'userId', headerName: 'Email', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'userFullName', headerName: t('table.fullName'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'workingDate', headerName: t('table.day'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'inAt', headerName: t('table.inTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'outAt', headerName: t('table.outTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'totalTime', headerName: t('table.workingTime'), flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
    ];

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
                    '& .MuiButton-root': {
                        color: 'text.primary',
                        '&:hover': {
                            backgroundColor: 'action.hover'
                        }
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
            </GridToolbarContainer>
        );
    }
    useEffect(() => {
        async function fetchDepartment() {
            const data = await getAllDepartmentName();
            if (data === undefined) {
                setDepartments([]);
            } else {
                setDepartments(data);
            }
        }
        fetchDepartment();
        // Force Vietnamese language
        i18n.changeLanguage('vi');
    }, [i18n])


    async function fetchAllUserNameByDeparId(id: number) {
        const data = await getUserFullNameByDepartmentId(id);
        setNameOfUsers(data);
    }

    async function handleFind(page: number, pageSize: number) {
        setLoading(true);
        const newValue = dateValue;
        if (newValue[0] === null || newValue[1] === null || departmentId === undefined || userId === "") {
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
            setRows([]);
            setLoading(false);
            return;
        }
        // Nếu đã chọn đủ ngày bắt đầu và kết thúc, lấy thông tin chi tiết cho ngày
        if (newValue[0] && newValue[1]) {
            const startDate = newValue[0];
            const endDate = newValue[1];

            const startDay = startDate.date();
            const startMonth = startDate.month() + 1; // getMonth() trả về giá trị từ 0 đến 11
            const startYear = startDate.year();

            const endDay = endDate.date();
            const endMonth = endDate.month() + 1;
            const endYear = endDate.year();

            console.log(`Từ: ${startDay}/${startMonth}/${startYear} - Đến: ${endDay}/${endMonth}/${endYear}`);
            try {
                const data = await getCheckinDataByDepartmentId(departmentId, userId, startDay, startMonth, startYear, endDay, endMonth, endYear, page, pageSize);
                const formattedData = data.items.map((item: User, index: number) => {
                    const rowIndex = (page * pageSize) + index + 1;
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
                        userFullName: item.fullName,
                        workingDate: getDateFromString(item.inAt.toString()),
                        inAt: formatTime(item.inAt.toString()),
                        outAt: formatTime(item.outAt.toString()),
                        totalTime: hours > 0 || minutes > 0 ? `${hours}:${formattedMinutes}` : "N/A",
                    };
                });
                setRows(formattedData);
                setRowCount(data.totalCount)
                setTimeout(() => {
                    setLoading(false);
                }, 2000)

            } catch (error) {
                console.log(error);
            }

        }
    };
    async function handleDepartmentChange(value: number | undefined) {
        setDepartmentId(value);
        if (value !== undefined)
            fetchAllUserNameByDeparId(value);
    }
    async function handleDateRangeChange(newValue: [Dayjs | null, Dayjs | null]) {
        setDateValue(newValue);
    }

    function handlePaginationModelChange(newModel: GridPaginationModel) {
        setPaginationModel(newModel);
        handleFind(newModel.page, newModel.pageSize);
    }

    function handleSelectionOfStaffNameChange(value: string | undefined) {
        console.log(value);
        if (value !== undefined) {
            const parts = value.split('-');
            const email = parts.length > 1 ? parts[1].trim() : null;
            if (email !== null) {
                setUserId(email);
            }
        }
    }


    return (
        <Fade in={true} timeout={800}>
            <div className="p-4 md:p-8 bg-gradient-to-br from-[#083B75] to-[#0A4C94] min-h-screen text-center max-w-screen" style={{ position: 'relative' }}>
                <div className="max-w-7xl mx-auto" style={{ position: 'relative' }}>
                    <h1 className="font-bold text-3xl md:text-4xl pb-6 md:pb-8 text-white tracking-wide animate-fade-in relative">
                        {t('staffCheckinTableByDept')}
                        <div className="w-24 h-1 bg-[#00CAFF] mx-auto mt-4 rounded-full"></div>
                    </h1>

                    <Card
                        elevation={3}
                        sx={{
                            mb: 10,
                            p: 3,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'visible',
                            zIndex: 2
                        }} >
                        <Stack spacing={3}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ position: 'relative', overflow: 'visible' }}>
                                <div className="space-y-2" style={{ position: 'relative', overflow: 'visible' }}>
                                    <Autocomplete
                                        disablePortal
                                        options={departments.map((department: Department) => ({
                                            label: department.title || `Noname-${department.id}`,
                                            key: department.id
                                        }))}
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
                                        onChange={(_event, value) => handleDepartmentChange(value?.key)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('selectDept')}
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
                                    <div className="text-xs text-gray-500 ml-2">
                                        <span key={i18n.language}>{t('selectDeptHelper')}</span>
                                    </div>
                                </div>

                                <div className="space-y-2" style={{ position: 'relative', overflow: 'visible' }}>
                                    <Autocomplete
                                        disablePortal
                                        options={nameOfUsers.map((name: string, index: number) => ({
                                            label: name,
                                            key: index
                                        }))}
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
                                        onChange={(_event, value) => handleSelectionOfStaffNameChange(value?.label)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('selectStaff')}
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
                                    <div className="text-xs text-gray-500 ml-2">
                                        <span key={i18n.language}>{t('selectStaffHelper')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full space-y-2">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DateRangePicker']}>
                                        <DateRangePicker
                                            defaultValue={[dayjs(), dayjs()]}
                                            sx={{
                                                width: '100%',
                                                '& .MuiInputBase-root': {
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: 'background.paper',
                                                    border: isDarkMode ? '' : '1px solid black'
                                                },
                                                '& .MuiFormLabel-root': {
                                                    color: 'text.primary',
                                                    backgroundColor: 'background.paper',

                                                    '&.Mui-focused': {
                                                        color: 'text.primary !important',
                                                    },
                                                },

                                            }}
                                            slotProps={{
                                                shortcuts: { items: shortcutsItems },
                                                actionBar: {
                                                    actions: ['clear', 'accept'],
                                                    sx: {
                                                        '& .MuiButtonBase-root': {
                                                            color: 'text.primary',
                                                            '&:hover': {
                                                                backgroundColor: 'action.hover',
                                                            },
                                                        },
                                                    },
                                                },
                                                popper: {
                                                    sx: {
                                                        '& .MuiPaper-root': {
                                                            borderRadius: '12px',
                                                            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(1,1,1,10)',
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            backgroundColor: 'background.paper',
                                                        },
                                                    },
                                                },
                                            }}
                                            onChange={handleDateRangeChange}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                                <div className="text-xs text-gray-500 ml-2">
                                    <span key={i18n.language}>{t('dateRangeHelper')}</span>
                                </div>
                            </div>

                            <div className="flex justify-center items-center space-x-4">
                                <Button
                                    sx={{
                                        mb: 2,
                                        mr: 2,
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
                                    className="w-full md:w-1/3 text-lg py-3"
                                    onClick={() => handleFind(paginationModel.page, paginationModel.pageSize)}
                                >
                                    {t('Find')}
                                </Button>
                                <Tooltip title={t('refresh')} arrow>
                                    <IconButton
                                        onClick={() => handleFind(paginationModel.page, paginationModel.pageSize)}
                                        sx={{
                                            mb: 2,
                                            mr: 2,
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
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </Stack>
                    </Card>

                    <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl backdrop-blur-sm bg-white/95" style={{ position: 'relative', zIndex: 1 }}>
                        <CardContent>
                            {loading ? (
                                <Box sx={{ width: '100%', height: '400px' }}>
                                    <Skeleton variant="rectangular" height={400} animation="wave" />
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
                                    columnVisibilityModel={columnVisibilityModel}
                                    sx={{
                                        border: 'none',
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Fade>
    )
}