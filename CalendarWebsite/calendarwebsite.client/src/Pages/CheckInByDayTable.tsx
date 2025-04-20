
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Button } from '@mui/material';
import axios from 'axios';

export default function CheckInByDayTable() {

    const [dateValue, setDateValue] = useState<Dayjs>(dayjs());

    async function handleTest(){
        // alert(dateValue.format('YYYY-MM-DD'));
        const date = dateValue.date();
        const month = dateValue.month() + 1;
        const year = dateValue.year();
        // axios.get(`${import.meta.env.VITE_API_URL}api/dataonly_apiacheckin/GetAllCheckinInDay?day=${date}&month=${month}&year=${year}`)
        const apiURL = `${import.meta.env.VITE_API_URL}api/dataonly_apiacheckin/GetAllCheckinInDay`;
        const response = await axios.get(apiURL, {
            params: {
                day: date,
                month: month,
                year: year
            }
        })
        const data = response.data;
        console.log(data);
    }

    return (
        <div className="p-6 bg-[#083B75] min-h-screen text-center max-w-screen rounded-lg">
            <h1 className="font-bold text-5xl pb-6 text-white">Staff Checkin Table By Day</h1>
            <Button onClick={handleTest}>Test</Button>
            <div className="mb-8 flex flex-col items-center">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
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
                        }} />
                </LocalizationProvider>

            </div>
        </div>
    );
}