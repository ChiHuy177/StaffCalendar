
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import axios from 'axios';
import { Box, Button, Skeleton, styled } from '@mui/material';
import { DataGrid, GridColDef, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid';
import { formatTime, User } from '../interfaces/type';
import { formatDate } from '@fullcalendar/core/index.js';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';

import { DateRange } from '@mui/x-date-pickers-pro/models';
import { PickersShortcutsItem } from '@mui/x-date-pickers';

export default function CheckInByDayTable() {
    const [loading, setLoading] = useState(false);
    // const [dateValue, setDateValue] = useState<Dayjs>(dayjs());
    const [rows, setRows] = useState<User[]>([]);
    // const [value, setValue] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

    const shortcutsItems: PickersShortcutsItem<DateRange<Dayjs>>[] = [
        {
            label: 'This Week',
            getValue: () => {
                const today = dayjs();
                return [today.startOf('week'), today.endOf('week')];
            },
        },
        {
            label: 'Last Week',
            getValue: () => {
                const today = dayjs();
                const prevWeek = today.subtract(7, 'day');
                return [prevWeek.startOf('week'), prevWeek.endOf('week')];
            },
        },
        {
            label: 'Last 7 Days',
            getValue: () => {
                const today = dayjs();
                return [today.subtract(7, 'day'), today];
            },
        },
        {
            label: 'Current Month',
            getValue: () => {
                const today = dayjs();
                return [today.startOf('month'), today.endOf('month')];
            },
        },
        { label: 'Reset', getValue: () => [null, null] },
    ];

    

    

    const columns: GridColDef[] = [
        { field: 'id', headerName: '#', flex: 0.5, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'userId', headerName: 'Email', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'userFullName', headerName: 'Full name', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'workingDate', headerName: 'Day of working', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'inAt', headerName: 'Check-in Time', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'outAt', headerName: 'Check-out Time', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
        { field: 'totalTime', headerName: 'Total Working Time', flex: 1, headerAlign: 'center', cellClassName: 'grid-cell-center' },
    ];
    async function handleDateRangeChange(newValue: [Dayjs | null, Dayjs | null]) {
        // setValue(newValue);

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
            const apiURL = `${import.meta.env.VITE_API_URL}api/dataonly_apiacheckin/GetAllCheckinInDayRange`;
            await axios.get(apiURL, {
                params: {
                    day: startDay,
                    month: startMonth,
                    year: startYear,
                    dayTo: endDay,
                    monthTo: endMonth,
                    yearTo: endYear
                }
            }).then((response) => {
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
                        userFullName: item.fullName,
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
            }).catch((error) => {
                console.error('Error fetching data:', error);
            })
        }
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
                    // onClick={handleExportExcel}
                    className="mb-6 cursor-pointer px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                    <DownloadRoundedIcon /> Export to Excel
                </Button>
            </GridToolbarContainer>
        );
    }
    return (
        <div className="p-6 bg-[#083B75] min-h-screen text-center max-w-screen rounded-lg">
            <h1 className="font-bold text-5xl pb-6 text-white">Staff Checkin Table By Day</h1>
            <div className="mb-8 flex flex-col items-center">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* <DatePicker
                        label="Basic date picker"
                        onChange={(newValue) => {
                            if (newValue) {
                                setDateValue(newValue);
                            }
                        }}
                        value={dateValue}
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            '& .MuiInputLabel-root': {
                                color: '#083B75',
                                fontSize: '16px',
                                backgroundColor: 'white',
                                padding: '0 5px',
                                borderRadius: '4px',
                            },
                        }} /> */}
                    <DemoContainer components={['DateRangePicker']}>
                        <DateRangePicker
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                '& .MuiInputLabel-root': {
                                    color: '#083B75',
                                    fontSize: '16px',
                                    backgroundColor: 'white',
                                    padding: '0 5px',
                                    borderRadius: '4px',
                                },
                            }}
                            slotProps={{
                                shortcuts: {
                                    items: shortcutsItems,
                                }
                            }}
                            onChange={handleDateRangeChange}
                        />
                    </DemoContainer>

                </LocalizationProvider>

            </div>
            <div className="w-full overflow-x-auto p-5 bg-white rounded-lg shadow-md">
                {loading ? (<Box sx={{ width: '100%', height: '100%' }}>
                    <Skeleton />
                    <Skeleton animation="wave" />
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
                        // columnGroupingModel={columnGroupingModel}
                        // columnVisibilityModel={columnVisibilityModel}
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