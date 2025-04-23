import axios from 'axios';
import { DataGrid, GridColDef, GridColumnGroupingModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { formatTime, User } from '../interfaces/type';
import { formatDate } from '@fullcalendar/core/index.js';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Skeleton, styled, TextField, useTheme } from '@mui/material';
import { Bounce, toast } from 'react-toastify';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';


export default function ExportCustomToolbar() {
    const [rows, setRows] = useState([]);
    const [nameOfUsers, setNameOfUsers] = useState<string[]>([]);
    const [selectedName, setSelectedName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(() => (new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useTranslation();


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
                <Box sx={{ mt: 2 }}>No rows</Box>
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
                    onClick={handleExportExcel}
                    className="mb-6 cursor-pointer px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                    <DownloadRoundedIcon /> {t('ExportExcel')}
                </Button>
            </GridToolbarContainer>
        );
    }


    async function fetchDataByUserId(userId: string, month: number, year: number): Promise<void> {
        try {
            setLoading(true);
            const userIdBeforeDash = userId.split('-')[0];
            const apiUrl = `${import.meta.env.VITE_API_URL}api/DataOnly_APIaCheckIn/GetUserByUserId`;
            const response = await axios.get(apiUrl, {
                params: {
                    month,
                    year,
                    userId: userIdBeforeDash,
                },
            });

            const data = response.data;
            const formattedData = data.map((item: User, index: number) => {
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
                    workingDate: formatDate(item.at),
                    inAt: formatTime(item.inAt.toString()),
                    outAt: formatTime(item.outAt.toString()),
                    totalTime: hours > 0 || minutes > 0 ? `${hours}:${formattedMinutes}` : "N/A",
                };
            });
            setRows(formattedData);
            setTimeout(() => {
                setLoading(false);
            }, 2000)
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please try again.');
        }
    }

    function handleSearch() {
        if (selectedName === '' || selectedMonth === '' || selectedYear === '') {
            toast.error('Vui lòng nhập đầy đủ tên, tháng và năm tìm kiếm!', {
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
            fetchDataByUserId(selectedName, parseInt(selectedMonth), parseInt(selectedYear));
        }
    }

    const handleMonthChange = (e: SelectChangeEvent) => {
        setSelectedMonth(e.target.value);
    };

    const handleYearChange = (e: SelectChangeEvent) => {
        setSelectedYear(e.target.value);
    };

    const handleExportExcel = async () => {
        if (selectedName === '' || selectedMonth === '' || selectedYear === '') {
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
        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}api/export/ExportUserCheckinData`;
            const selectedNameBeforeDash = selectedName.split('-')[0];
            const response = await axios.get(apiUrl, {
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                    userID: selectedNameBeforeDash,
                },
                responseType: 'blob', // Để nhận file dưới dạng blob
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `checkin-data-${selectedName}-${new Date().toISOString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Failed to export Excel file. Please try again.');
        }
    };

    useEffect(() => {
        async function getAllUserName() {
            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}api/personalprofiles/GetAllUsersName`;
                const response = await axios.get(apiUrl);
                setNameOfUsers(response.data);
            } catch (error) {
                console.error('Error fetching user names:', error);
                alert('Failed to fetch user names. Please try again.');
            }
        }
        getAllUserName();
    }, []);



    return (
        <div className="p-6 bg-[#083B75] min-h-screen text-center max-w-screen rounded-lg">
            <h1 className="font-bold text-5xl pb-6 text-white">{t('staffCheckinTable')}</h1>
            <div className="mb-8 flex flex-col items-center">
                <Autocomplete
                    disablePortal
                    options={nameOfUsers}
                    sx={{
                        width: '50%',
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center', // Căn giữa nội dung trong ô
                        },
                        '& .MuiInputLabel-root': {
                            color: '#083B75', // Màu chữ của label
                            backgroundColor: 'white', // Màu nền của label
                            padding: '0 5px',
                            borderRadius: '5px', // Bo tròn góc của label
                        },
                    }}
                    value={selectedName}
                    onChange={(_event, value) => setSelectedName(value || '')}
                    renderInput={(params) => (
                        <TextField {...params}
                            label={t('selectName')}
                        ></TextField>)
                    }
                />
            </div>

            <div className="mb-6 flex justify-center space-x-4">
                <Box sx={{
                    minWidth: 120,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                }}>
                    <FormControl fullWidth>
                        <InputLabel id="month-select-label"
                            sx={{
                                backgroundColor: 'white',
                                padding: '0 5px',
                                borderRadius: '4px',
                            }}>
                            {t('selectMonth')}
                        </InputLabel>
                        <Select
                            labelId="month-select-label"
                            id="month-select"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <MenuItem key={i + 1} value={i + 1}>
                                     {i + 1}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{
                    minWidth: 120,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                }}>
                    <FormControl fullWidth>
                        <InputLabel id="year-select-label"
                            sx={{
                                backgroundColor: 'white',
                                padding: '0 5px',
                                borderRadius: '4px',
                            }}>
                            {t('selectYear')}
                        </InputLabel>
                        <Select
                            labelId="year-select-label"
                            id="year-select"
                            value={selectedYear}
                            onChange={handleYearChange}
                        >
                            {Array.from({ length: 10 }, (_, i) => (
                                <MenuItem key={i} value={2025 - i}>
                                    {2025 - i}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={{
                        backgroundColor: '#00B6E6', // Custom background color
                        color: 'white', // Text color
                        padding: '10px 20px', // Padding
                        borderRadius: '8px', // Rounded corners
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow
                        '&:hover': {
                            backgroundColor: '#052A5E', // Hover background color
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <SearchRoundedIcon
                        sx={{
                            fontSize: '1.5rem', // Icon size
                        }}
                    />
                    <span
                        className="font-medium ml-2 hidden sm:inline"
                    >
                        {t('Find')}
                    </span>
                </Button>
            </div>


            <div className="w-full h-screen overflow-x-auto p-5 bg-white rounded-lg shadow-md">
                {loading ? (<Box sx={{ width: '100%', height: '100vh' }}>
                    <Skeleton />
                    <Skeleton animation="wave" className='h-screen' />
                    <Skeleton animation={false} />
                </Box>) :
                    <DataGrid
                        disableVirtualization={true}
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: MyCustomToolbar,
                            noRowsOverlay: CustomNoRowsOverlay
                        }}
                        columnGroupingModel={columnGroupingModel}
                        columnVisibilityModel={columnVisibilityModel}
                        sx={{
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: '#f5f5f5',

                            },
                            '& .MuiDataGrid-row:nth-of-type(odd)': {
                                backgroundColor: '#EEEEEE', // Màu nền cho hàng lẻ
                            },
                            '& .MuiDataGrid-row:nth-of-type(even)': {
                                backgroundColor: '#ffffff', // Màu nền cho hàng chẵn
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#D1E4F6', // Màu nền khi hover
                            }
                        }}
                    />}

            </div>
        </div>
    );
}
