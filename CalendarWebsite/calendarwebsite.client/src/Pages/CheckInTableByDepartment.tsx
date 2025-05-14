import { Autocomplete, Box, Button, Card, CardContent, Fade, IconButton, Skeleton, styled, TextField, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { Department, formatTime, User } from "../utils/type";
import { DataGrid, GridColDef, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from "@mui/x-data-grid";
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDate } from "@fullcalendar/core/index.js";
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

    // Add debug logs
    // console.log('Current language:', i18n.language);
    // console.log('selectDeptHelper translation:', t('selectDeptHelper'));
    // console.log('selectStaffHelper translation:', t('selectStaffHelper'));
    // console.log('dateRangeHelper translation:', t('dateRangeHelper'));

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

    const columnVisibilityModel = {
        userId: !isMobile,
        totalTime: !isMobile,
        // Các cột khác không định nghĩa sẽ mặc định hiển thị
    };
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
                        workingDate: formatDate(item.at),
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
            <div className="p-4 md:p-8 bg-gradient-to-br from-[#083B75] to-[#0A4C94] min-h-screen text-center max-w-screen" style={{ position: 'relative' }}>
                <div className="max-w-7xl mx-auto" style={{ position: 'relative' }}>
                    <h1 className="font-bold text-3xl md:text-4xl pb-6 md:pb-8 text-white tracking-wide animate-fade-in relative">
                        {t('staffCheckinTableByDept')}
                        <div className="w-24 h-1 bg-[#00CAFF] mx-auto mt-4 rounded-full"></div>
                    </h1>

                    <Card className="mb-8 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl backdrop-blur-sm bg-white/95" style={{ position: 'relative', overflow: 'visible', zIndex: 2 }}>
                        <CardContent className="space-y-6" style={{ position: 'relative', overflow: 'visible' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ position: 'relative', overflow: 'visible' }}>
                                <div className="space-y-2" style={{ position: 'relative', overflow: 'visible' }}>
                                    <Autocomplete
                                        disablePortal
                                        options={departments.map((department: Department) => ({
                                            label: department.title || `Noname-${department.id}`,
                                            key: department.id
                                        }))}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                borderRadius: '12px',
                                                transition: 'all 0.3s ease',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                '&:hover': {
                                                    boxShadow: '0 4px 8px rgba(8, 59, 117, 0.1)',
                                                    backgroundColor: 'white',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#083B75',
                                                backgroundColor: 'white',
                                                padding: '0 8px',
                                            },
                                            position: 'relative',
                                            zIndex: 9999
                                        }}
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
                                                    backgroundColor: 'white',
                                                    color: 'text.primary',
                                                    zIndex: 9999,
                                                    maxHeight: '300px',
                                                    '& .MuiAutocomplete-option':{
                                                        '&[aria-selected="true"]':{
                                                            backgroundColor: 'primary.light',
                                                            color: 'primary.contrastText',
                                                            '&.Mui-focused': {
                                                                backgroundColor: 'primary.main',
                                                                color: 'primary.contrastText',
                                                            }
                                                        },
                                                        '&:hover':{
                                                            backgroundColor: 'action.hover',
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        onChange={(_event, value) => handleDepartmentChange(value?.key)}
                                        renderInput={(params) => (
                                            <TextField {...params} label={t('selectDept')} />
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
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                borderRadius: '12px',
                                                transition: 'all 0.3s ease',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                '&:hover': {
                                                    boxShadow: '0 4px 8px rgba(8, 59, 117, 0.1)',
                                                    backgroundColor: 'white',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#083B75',
                                                backgroundColor: 'white',
                                                padding: '0 8px',
                                            },
                                            position: 'relative',
                                            
                                        }}
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
                                                    backgroundColor: 'white',
                                                    color: 'text.primary',
                                                    zIndex: 9999,
                                                    maxHeight: '300px',
                                                    '& .MuiAutocomplete-option':{
                                                        '&[aria-selected="true"]':{
                                                            backgroundColor: 'primary.light',
                                                            color: 'primary.contrastText',
                                                            '&.Mui-focused': {
                                                                backgroundColor: 'primary.main',
                                                                color: 'primary.contrastText',
                                                            }
                                                        },
                                                        '&:hover':{
                                                            backgroundColor: 'action.hover',
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        onChange={(_event, value) => handleSelectionOfStaffNameChange(value?.label)}
                                        renderInput={(params) => (
                                            <TextField {...params} label={t('selectStaff')} />
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
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 8px rgba(8, 59, 117, 0.1)',
                                                        backgroundColor: 'white',
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'rgba(8, 59, 117, 0.2)',
                                                        transition: 'all 0.3s ease',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#083B75',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#083B75',
                                                        borderWidth: '2px',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#083B75',
                                                    '&.Mui-focused': {
                                                        color: '#083B75',
                                                    },
                                                },
                                                '& .MuiPickersDay-root': {
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    margin: '2px',
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
                                                    '&.Mui-inRange': {
                                                        backgroundColor: 'rgba(8, 59, 117, 0.1)',
                                                        color: '#083B75',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(8, 59, 117, 0.2)',
                                                        },
                                                    },
                                                },
                                                '& .MuiPickersCalendarHeader-root': {
                                                    marginBottom: '8px',
                                                    '& .MuiPickersCalendarHeader-label': {
                                                        color: '#083B75',
                                                        fontWeight: 'bold',
                                                    },
                                                    '& .MuiIconButton-root': {
                                                        color: '#083B75',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(8, 59, 117, 0.1)',
                                                        },
                                                    },
                                                },
                                                '& .MuiPickersArrowSwitcher-root': {
                                                    '& .MuiIconButton-root': {
                                                        color: '#083B75',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(8, 59, 117, 0.1)',
                                                        },
                                                    },
                                                },
                                                '& .MuiPickersShortcuts-root': {
                                                    '& .MuiButtonBase-root': {
                                                        color: '#083B75',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(8, 59, 117, 0.1)',
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#083B75',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: '#0A4C94',
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                            slotProps={{
                                                shortcuts: { items: shortcutsItems },
                                                actionBar: {
                                                    actions: ['clear', 'accept'],
                                                    sx: {
                                                        '& .MuiButtonBase-root': {
                                                            color: '#083B75',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(8, 59, 117, 0.1)',
                                                            },
                                                        },
                                                    },
                                                },
                                                popper: {
                                                    sx: {
                                                        '& .MuiPaper-root': {
                                                            borderRadius: '12px',
                                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                                            border: '1px solid rgba(8, 59, 117, 0.1)',
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
                                <CustomButton
                                    className="w-full md:w-1/3 text-lg py-3"
                                    onClick={() => handleFind(paginationModel.page, paginationModel.pageSize)}
                                >
                                    {t('Find')}
                                </CustomButton>
                                <Tooltip title={t('refresh')} arrow>
                                    <IconButton 
                                        onClick={() => handleFind(paginationModel.page, paginationModel.pageSize)}
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
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl backdrop-blur-sm bg-white/95" style={{ position: 'relative', zIndex: 1 }}>
                        <CardContent>
                            {loading ? (
                                <Box sx={{ width: '100%', height: '400px' }}>
                                    <Skeleton variant="rectangular" height={400} animation="wave" />
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Fade>
    )
}