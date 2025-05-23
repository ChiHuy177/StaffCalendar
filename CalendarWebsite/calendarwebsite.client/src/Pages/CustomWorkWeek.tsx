import { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    IconButton,
    useTheme,
    Button,
    Container,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Divider,
    CircularProgress,
    Card
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { viVN as viVNGrid } from '@mui/x-data-grid/locales';
import { createCustomWorkingTime, updateCustomWorkingTime, softDeleteCustomWorkingTime, getCustomWorkingTimeByPersonalProfileId } from '../apis/CustomWorkingTimeApi';
import { UserInfo, WorkSchedule, WorkScheduleApiData } from '../utils/type';
import Swal from 'sweetalert2'
import i18n from '../i18n';
import { useUser } from '../contexts/AuthUserContext';

// Extend WorkSchedule to include the custom fields we need
interface ExtendedWorkSchedule extends WorkSchedule {
    stt?: number;
    name?: string;
    employeeName?: string;
    isWorkingDay?: boolean;
}



export default function CustomWorkWeek() {
    const {nameOfUsers} = useUser();
    const { t } = useTranslation();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const [workDays, setWorkDays] = useState<ExtendedWorkSchedule[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    // const [employees, setEmployees] = useState<UserInfo[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<UserInfo | null>(null);
    const [editingWorkSchedule, setEditingWorkSchedule] = useState<ExtendedWorkSchedule | null>(null);
    const [newWorkSchedule, setNewWorkSchedule] = useState<{
        workweekTitle: string;
        employeeName: UserInfo | null;
        morningStart: number | null;
        morningEnd: number | null;
        afternoonStart: number | null;
        afternoonEnd: number | null;
    }>({
        workweekTitle: '',
        employeeName: null,
        morningStart: null,
        morningEnd: null,
        afternoonStart: null,
        afternoonEnd: null
    });
    const [errors, setErrors] = useState<{
        workweekTitle?: string;
        personalProfileId?: string;
        morningTime?: string;
        afternoonTime?: string;
    }>({});
    const [loading, setLoading] = useState(false);
    const [filteredWorkDays, setFilteredWorkDays] = useState<ExtendedWorkSchedule[]>([]);

    // Fetch employees for autocomplete
    // useEffect(() => {
    //     async function fetchEmployees() {
    //         try {
    //             setLoading(true);
    //             const data = await getAllUserName();
                
    //             // Kiểm tra dữ liệu trả về từ API
    //             if (!data || !Array.isArray(data)) {
    //                 console.error("API getAllUserName không trả về mảng dữ liệu hợp lệ:", data);
    //                 setEmployees([]);  // Gán mảng rỗng thay vì undefined
    //             } else {
    //                 setEmployees(data);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching employees:", error);
    //             setEmployees([]);  // Gán mảng rỗng khi có lỗi
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     fetchEmployees();
    // }, []);


    const handleRefresh = (personalProfileId?: number) => {
        // console.log('Refresh work day configurations');
        async function fetchCustomWorkingDays(personalProfileId?: number) {
            try {
                if(!personalProfileId){
                    return;
                }
                setLoading(true);
                const data = await getCustomWorkingTimeByPersonalProfileId(personalProfileId);

                // Kiểm tra dữ liệu trả về từ API
                if (!data || !Array.isArray(data)) {
                    console.error("API getAllCustomWorkingTimes không trả về mảng dữ liệu hợp lệ:", data);
                    setWorkDays([]);
                    return;
                }

                const promises = data.map(async (item: WorkSchedule, index: number) => {
                    return {
                        ...item,
                        stt: index + 1,
                        name: `${item.workweekTitle}`,
                        employeeName: item.fullName,
                        isWorkingDay: item.morningStart != null || item.afternoonStart != null // Has any shift
                    };
                });

                // Đợi tất cả các promise hoàn tất
                const extendedData = await Promise.all(promises);
                setWorkDays(extendedData);
            } catch (error) {
                console.error("Error in fetchCustomWorkingDays:", error);
                setWorkDays([]); // Gán mảng rỗng khi có lỗi
            } finally {
                setLoading(false);
            }
        }

        fetchCustomWorkingDays(personalProfileId);
    };

    useEffect(() => {
        // handleRefresh();
    }, []);

    const handleEdit = (id: number) => {
        console.log('Edit day with ID:', id);
        const workSchedule = workDays.find(day => day.id === id);
        if (workSchedule) {
            console.log('PersonalProfileId:', workSchedule.personalProfileId);
            setEditingWorkSchedule(workSchedule);

            // Kiểm tra employees trước khi tìm kiếm
            const employeeMatch = Array.isArray(nameOfUsers) ? 
                nameOfUsers.find(user => user.personalProfileId === workSchedule.personalProfileId) : 
                null;

            // Chuẩn bị dữ liệu cho form chỉnh sửa
            setNewWorkSchedule({
                workweekTitle: workSchedule.workweekTitle,
                employeeName: employeeMatch || null,
                morningStart: workSchedule.morningStart,
                morningEnd: workSchedule.morningEnd,
                afternoonStart: workSchedule.afternoonStart,
                afternoonEnd: workSchedule.afternoonEnd
            });
            setOpenEditDialog(true);
        }
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditingWorkSchedule(null);
        // Reset form
        setNewWorkSchedule({
            workweekTitle: '',
            employeeName: null,
            morningStart: null,
            morningEnd: null,
            afternoonStart: null,
            afternoonEnd: null
        });
        setErrors({});
    };

    const handleDelete = (id: number) => {
        // Tìm workSchedule cần xóa
        const workScheduleToDelete = workDays.find(day => day.id === id);

        if (!workScheduleToDelete) {
            console.error(`Không tìm thấy lịch làm việc với ID: ${id}`);
            return;
        }

        Swal.fire({
            title: t('deleteWorkScheduleConfirmation'),
            showDenyButton: true,
            confirmButtonText: t('deleteConfirmation'),
            denyButtonText: t('deleteReject')
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await softDeleteCustomWorkingTime(id, (workScheduleToDelete));

                    handleRefresh(selectedEmployee?.personalProfileId);

                    Swal.fire(t('deleteSuccess'), "", "success");
                } catch (error) {
                    console.error('Lỗi khi xóa lịch làm việc:', error);
                    Swal.fire(t('deleteError'), "", "error");
                }
            }
        });
    };

    const handleAddWorkDay = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        // Reset form
        setNewWorkSchedule({
            workweekTitle: '',
            employeeName: null,
            morningStart: null,
            morningEnd: null,
            afternoonStart: null,
            afternoonEnd: null
        });
        setErrors({});
    };

    type FieldValue = string | number | null | UserInfo | (UserInfo | null);

    const handleInputChange = (field: string, value: FieldValue) => {
        setNewWorkSchedule({
            ...newWorkSchedule,
            [field]: value
        });

        // Clear error for this field if it exists
        if (errors[field as keyof typeof errors]) {
            setErrors({
                ...errors,
                [field]: undefined
            });
        }
    };

    const validateForm = () => {
        const newErrors: {
            workweekTitle?: string;
            personalProfileId?: string;
            morningTime?: string;
            afternoonTime?: string;
        } = {};

        if (!newWorkSchedule.workweekTitle.trim()) {
            newErrors.workweekTitle = t('errorRequired');
        }

        if (!newWorkSchedule.employeeName) {
            newErrors.personalProfileId = t('errorRequired');
        }

        // Kiểm tra thời gian buổi sáng
        if (newWorkSchedule.morningStart !== null && newWorkSchedule.morningEnd === null) {
            newErrors.morningTime = t('errorBothTimesRequired');
        } else if (newWorkSchedule.morningEnd !== null && newWorkSchedule.morningStart === null) {
            newErrors.morningTime = t('errorBothTimesRequired');
        } else if (newWorkSchedule.morningStart !== null && newWorkSchedule.morningEnd !== null) {
            if (newWorkSchedule.morningStart >= newWorkSchedule.morningEnd) {
                newErrors.morningTime = t('errorEndTimeMustBeAfterStart');
            }
        }

        // Kiểm tra thời gian buổi chiều
        if (newWorkSchedule.afternoonStart !== null && newWorkSchedule.afternoonEnd === null) {
            newErrors.afternoonTime = t('errorBothTimesRequired');
        } else if (newWorkSchedule.afternoonEnd !== null && newWorkSchedule.afternoonStart === null) {
            newErrors.afternoonTime = t('errorBothTimesRequired');
        } else if (newWorkSchedule.afternoonStart !== null && newWorkSchedule.afternoonEnd !== null) {
            if (newWorkSchedule.afternoonStart >= newWorkSchedule.afternoonEnd) {
                newErrors.afternoonTime = t('errorEndTimeMustBeAfterStart');
            }
        }

        // Kiểm tra liệu có ít nhất một ca làm việc được xác định hay không
        const hasMorningShift = newWorkSchedule.morningStart !== null && newWorkSchedule.morningEnd !== null;
        const hasAfternoonShift = newWorkSchedule.afternoonStart !== null && newWorkSchedule.afternoonEnd !== null;

        if (!hasMorningShift && !hasAfternoonShift) {
            newErrors.morningTime = t('errorAtLeastOneShiftRequired');
            newErrors.afternoonTime = t('errorAtLeastOneShiftRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                // Lấy dữ liệu từ form
                const formData = getFormData();
                console.log('New work schedule to be saved:', formData);
                const currentDate = new Date();

                const apiData: WorkScheduleApiData = {
                    workweekId: formData.workweekId, // ID sẽ được tạo bởi API nếu là bản ghi mới, hoặc truyền ID hiện có nếu cập nhật
                    personalProfileId: formData.personalProfileId || 0,
                    morningStart: formData.morningStart,
                    morningEnd: formData.morningEnd,
                    afternoonStart: formData.afternoonStart,
                    afternoonEnd: formData.afternoonEnd,
                    createdBy: "Chí Huy",
                    createdTime: currentDate,
                    lastModified: currentDate,
                    modifiedBy: "Chí Huy",
                    isDeleted: false
                }
                // Ở đây sẽ thêm xử lý API sau
                await createCustomWorkingTime(apiData);

                // Cập nhật danh sách sau khi lưu thành công
                handleRefresh();

                // Đóng dialog
                handleCloseDialog();
            } catch (error) {
                console.error("Error saving new work schedule:", error);
                // Hiển thị thông báo lỗi nếu cần
            }
        }
    };

    const handleSubmitEdit = async () => {
        if (validateForm() && editingWorkSchedule) {
            try {
                // Lấy dữ liệu từ form
                const formData = getFormData();
                console.log('Updated work schedule to be saved:', formData);
                const currentDate = new Date();

                // Tạo đối tượng dữ liệu cho API cập nhật
                const apiData: WorkScheduleApiData & { id: number } = {
                    id: editingWorkSchedule.id,
                    workweekId: formData.workweekId,
                    personalProfileId: formData.personalProfileId || 0,
                    morningStart: formData.morningStart,
                    morningEnd: formData.morningEnd,
                    afternoonStart: formData.afternoonStart,
                    afternoonEnd: formData.afternoonEnd,
                    createdBy: editingWorkSchedule.createdBy || "Chí Huy",
                    createdTime: editingWorkSchedule.createdTime || currentDate,
                    lastModified: currentDate,
                    modifiedBy: "Chí Huy",
                    isDeleted: false
                }
                console.log('API data for update:', apiData);

                await updateCustomWorkingTime(apiData);

                handleRefresh();
                handleCloseEditDialog();
            } catch (error) {
                console.error("Error updating work schedule:", error);
            }
        }
    };

    // Hàm lấy dữ liệu từ form
    const getFormData = () => {
        return {
            workweekId: getDayOfWeekValue(newWorkSchedule.workweekTitle),
            personalProfileId: newWorkSchedule.employeeName?.personalProfileId || null,
            morningStart: newWorkSchedule.morningStart,
            morningEnd: newWorkSchedule.morningEnd,
            afternoonStart: newWorkSchedule.afternoonStart,
            afternoonEnd: newWorkSchedule.afternoonEnd,
        };
    };

    // Hàm chuyển đổi workweekTitle thành giá trị số ngày trong tuần
    const getDayOfWeekValue = (day: string): number => {
        const dayMap: { [key: string]: number } = {
            'Monday': 3,
            'Tuesday': 4,
            'Wednesday': 5,
            'Thursday': 6,
            'Friday': 7,
            'Saturday': 8,
            'Sunday': 9
        };
        return dayMap[day] || 3; // Mặc định là thứ 2 nếu không xác định được
    };

    // Tạo các mảng giờ với giá trị phút để hiển thị trong dropdown
    const timeOptionsMorning = Array.from({ length: 25 }, (_, i) => {
        const hours = Math.floor(i / 2);
        const minutes = (i % 2) * 30;
        const value = hours + (minutes / 60);
        const label = `${hours}:${minutes === 0 ? '00' : minutes}`;
        return { value, label };
    });
    const timeOptionsAfternoon = Array.from({ length: 24 }, (_, i) => {
        const hours = Math.floor(i / 2) + 12;
        const minutes = (i % 2) * 30;
        const value = hours + (minutes / 60);
        const label = `${hours}:${minutes === 0 ? '00' : minutes}`;
        return { value, label };
    });


    // Hàm chuyển đổi số sang định dạng giờ:phút
    const formatTimeDisplay = (time: number | null): string => {
        if (time === null) return '—';

        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);

        if (minutes === 0) {
            return `${hours}:00`;
        } else {
            return `${hours}:${minutes.toString().padStart(2, '0')}`;
        }
    };

    // Custom toolbar for DataGrid
    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{ gap: 2, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                    <GridToolbarColumnsButton 
                        slotProps={{
                            tooltip: { title: t('dataGrid.columns') }
                        }}
                    />
                    <GridToolbarFilterButton 
                        slotProps={{
                            tooltip: { title: t('dataGrid.filter') }
                        }}
                    />
                    <GridToolbarDensitySelector 
                        slotProps={{
                            tooltip: { title: t('dataGrid.density') }
                        }}
                    />
                    <Button
                        onClick={() => handleRefresh(selectedEmployee?.personalProfileId)}
                        className="mb-6 ml-2 cursor-pointer px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                        disabled={loading}
                    >
                        {t('refresh')}
                    </Button>
                </Box>
            </GridToolbarContainer>
        );
    }



    // Cập nhật useEffect để reset filteredWorkDays khi workDays thay đổi
    useEffect(() => {
        setFilteredWorkDays(workDays);
    }, [workDays]);

    // Define columns for DataGrid - rerender when language changes
    const columns: GridColDef[] = [
        {
            field: 'stt',
            headerName: t('dataGrid.no') || 'STT',
            width: 70,
            headerClassName: 'data-grid-header',
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => {
                return params.value;
            }
        },
        {
            field: 'name',
            headerName: t('day'),
            flex: 1.5,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'employeeName',
            headerName: t('dataGrid.name') || 'Tên nhân viên',
            flex: 2,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'morningStart',
            headerName: t('morningStart'),
            flex: 1,
            headerClassName: 'data-grid-header',
            renderCell: (params: GridRenderCellParams) => {
                try {
                    const row = params.row as ExtendedWorkSchedule;
                    if (!row || !row.isWorkingDay || row.morningStart === null) return '—';

                    return formatTimeDisplay(row.morningStart);
                } catch (error) {
                    console.error("Error rendering morningStart:", error);
                    return '—';
                }
            }
        },
        {
            field: 'morningEnd',
            headerName: t('morningEnd'),
            flex: 1.5,
            headerClassName: 'data-grid-header',
            renderCell: (params: GridRenderCellParams) => {
                try {
                    const row = params.row as ExtendedWorkSchedule;
                    if (!row || !row.isWorkingDay || row.morningEnd === null) return '—';

                    return formatTimeDisplay(row.morningEnd);
                } catch (error) {
                    console.error("Error rendering morningEnd:", error);
                    return '—';
                }
            }
        },
        {
            field: 'afternoonStart',
            headerName: t('afternoonStart'),
            flex: 1.5,
            headerClassName: 'data-grid-header',
            renderCell: (params: GridRenderCellParams) => {
                try {
                    const row = params.row as ExtendedWorkSchedule;
                    if (!row || !row.isWorkingDay || row.afternoonStart === null) return '—';

                    return formatTimeDisplay(row.afternoonStart);
                } catch (error) {
                    console.error("Error rendering afternoonStart:", error);
                    return '—';
                }
            }
        },
        {
            field: 'afternoonEnd',
            headerName: t('afternoonEnd'),
            flex: 1.5,
            headerClassName: 'data-grid-header',
            renderCell: (params: GridRenderCellParams) => {
                try {
                    const row = params.row as ExtendedWorkSchedule;
                    if (!row || !row.isWorkingDay || row.afternoonEnd === null) return '—';

                    return formatTimeDisplay(row.afternoonEnd);
                } catch (error) {
                    console.error("Error rendering afternoonEnd:", error);
                    return '—';
                }
            }
        }
        , {
            field: 'actions',
            headerName: t('actions'),
            flex: 1,
            headerClassName: 'data-grid-header',
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => {
                const row = params.row as ExtendedWorkSchedule;
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

                    {/* Add New Button */}
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            onClick={handleAddWorkDay}
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            sx={{
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #3b82f6 0%, #2563eb 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #2563eb 0%, #1d4ed8 100%)',
                                }
                            }}
                        >
                            {t('add')}
                        </Button>
                    </Box>

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
                                {loading ? (
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
                                        getOptionLabel={(option) => option?.emailAndName || ''}
                                        value={selectedEmployee}
                                        onChange={(_event, value) => setSelectedEmployee(value)}
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
                                                        borderRadius: 2,
                                                        backgroundColor: 'white'
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            </Box>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Button
                                    variant="contained"
                                    onClick={() => handleRefresh(selectedEmployee?.personalProfileId)}
                                    startIcon={<SearchIcon />}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        background: 'linear-gradient(45deg, #00B6E6 30%, #0088B3 90%)',
                                        boxShadow: '0 3px 5px 2px rgba(0, 182, 230, .3)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #0088B3 30%, #006688 90%)',
                                        }
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
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'white'
                        }}
                    >
                        <DataGrid
                            rows={filteredWorkDays}
                            columns={columns}
                            autoHeight
                            disableRowSelectionOnClick
                            localeText={i18n.language === 'vi' ? viVNGrid.components.MuiDataGrid.defaultProps.localeText : undefined}
                            slots={{
                                toolbar: CustomToolbar
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    padding: '12px 16px',
                                },
                                '& .MuiDataGrid-row': {
                                    '&:nth-of-type(odd)': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                    },
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                        transition: 'background-color 0.2s',
                                    },
                                },
                                '& .data-grid-header': {
                                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5',
                                    color: isDarkMode ? 'white' : '#1a1a1a',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    padding: '12px 16px',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    borderBottom: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                },
                                '& .MuiDataGrid-toolbarContainer': {
                                    padding: '8px 16px',
                                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                                    borderRadius: '4px 4px 0 0',
                                },
                                '& .MuiButton-root': {
                                    textTransform: 'none',
                                },
                                '& .MuiIconButton-root': {
                                    padding: '8px',
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                },
                            }}
                        />
                    </Paper>
                </Stack>
            </Container>

            {/* Dialog để thêm lịch làm việc mới */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    elevation: 24,
                    sx: {
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 'bold',
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        py: 2.5,
                        fontSize: '1.3rem',
                        backgroundImage: 'linear-gradient(45deg, #1976d2, #304ffe)'
                    }}
                >
                    {t('addNewWorkSchedule')}
                </DialogTitle>
                <DialogContent sx={{ py: 4, px: 3 }}>
                    <Box sx={{ mt: 1 }}>
                        {/* Thông tin chung */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                                {t('generalInformation')}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel required>{t('workweekTitle')}</InputLabel>
                                <Select
                                    value={newWorkSchedule.workweekTitle}
                                    onChange={(e) => handleInputChange('workweekTitle', e.target.value)}
                                    label={t('workweekTitle')}
                                    error={!!errors.workweekTitle}
                                    sx={{
                                        borderRadius: '8px'
                                    }}
                                >
                                    <MenuItem value="Monday">{t('date.monday')}</MenuItem>
                                    <MenuItem value="Tuesday">{t('date.tuesday')}</MenuItem>
                                    <MenuItem value="Wednesday">{t('date.wednesday')}</MenuItem>
                                    <MenuItem value="Thursday">{t('date.thursday')}</MenuItem>
                                    <MenuItem value="Friday">{t('date.friday')}</MenuItem>
                                    <MenuItem value="Saturday">{t('date.saturday')}</MenuItem>
                                    <MenuItem value="Sunday">{t('date.sunday')}</MenuItem>
                                </Select>
                                {!!errors.workweekTitle && (
                                    <FormHelperText error>{errors.workweekTitle}</FormHelperText>
                                )}
                            </FormControl>

                            <Autocomplete
                                options={nameOfUsers || []}
                                getOptionLabel={(option) => option?.emailAndName || ''}
                                value={newWorkSchedule.employeeName}
                                loading={loading}
                                onChange={(_, newValue) => {
                                    setNewWorkSchedule({
                                        ...newWorkSchedule,
                                        employeeName: newValue
                                    });

                                    // Clear error if exists
                                    if (errors.personalProfileId) {
                                        setErrors({
                                            ...errors,
                                            personalProfileId: undefined
                                        });
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('selectEmployee')}
                                        error={!!errors.personalProfileId}
                                        slotProps={{
                                            input: {
                                                sx: { borderRadius: '8px' },
                                                endAdornment: (
                                                    <>
                                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps?.endAdornment}
                                                    </>
                                                )
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        {/* Giờ làm việc buổi sáng */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                                {t('morningShift')}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('startTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.morningStart !== null ? newWorkSchedule.morningStart : ''}
                                            onChange={(e) => handleInputChange('morningStart', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('startTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsMorning.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsMorning.map((option) => (
                                                <MenuItem key={`morning-start-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('endTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.morningEnd !== null ? newWorkSchedule.morningEnd : ''}
                                            onChange={(e) => handleInputChange('morningEnd', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('endTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsMorning.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsMorning.map((option) => (
                                                <MenuItem key={`morning-end-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                            {errors.morningTime && (
                                <FormHelperText error sx={{ ml: 2, mt: 1, fontSize: '0.85rem' }}>
                                    {errors.morningTime}
                                </FormHelperText>
                            )}
                        </Box>

                        {/* Giờ làm việc buổi chiều */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                                {t('afternoonShift')}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('startTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.afternoonStart !== null ? newWorkSchedule.afternoonStart : ''}
                                            onChange={(e) => handleInputChange('afternoonStart', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('startTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsAfternoon.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsAfternoon.map((option) => (
                                                <MenuItem key={`afternoon-start-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('endTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.afternoonEnd !== null ? newWorkSchedule.afternoonEnd : ''}
                                            onChange={(e) => handleInputChange('afternoonEnd', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('endTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsAfternoon.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsAfternoon.map((option) => (
                                                <MenuItem key={`afternoon-end-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                            {errors.afternoonTime && (
                                <FormHelperText error sx={{ ml: 2, mt: 1, fontSize: '0.85rem' }}>
                                    {errors.afternoonTime}
                                </FormHelperText>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: 8,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            borderRadius: 8,
                            px: 4,
                            py: 1,
                            ml: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2 0%, #304ffe 100%)',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0 0%, #283593 100%)',
                                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                            }
                        }}
                    >
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog để chỉnh sửa lịch làm việc */}
            <Dialog
                open={openEditDialog}
                onClose={handleCloseEditDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    elevation: 24,
                    sx: {
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 'bold',
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        py: 2.5,
                        fontSize: '1.3rem',
                        backgroundImage: 'linear-gradient(45deg, #1976d2, #304ffe)'
                    }}
                >
                    {t('editWorkSchedule')}
                </DialogTitle>
                <DialogContent sx={{ py: 4, px: 3 }}>
                    <Box sx={{ mt: 1 }}>
                        {/* Thông tin chung */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                                {t('generalInformation')}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel required>{t('workweekTitle')}</InputLabel>
                                <Select
                                    value={newWorkSchedule.workweekTitle}
                                    onChange={(e) => handleInputChange('workweekTitle', e.target.value)}
                                    label={t('workweekTitle')}
                                    error={!!errors.workweekTitle}
                                    sx={{
                                        borderRadius: '8px'
                                    }}
                                >
                                    <MenuItem value="Monday">{t('date.monday')}</MenuItem>
                                    <MenuItem value="Tuesday">{t('date.tuesday')}</MenuItem>
                                    <MenuItem value="Wednesday">{t('date.wednesday')}</MenuItem>
                                    <MenuItem value="Thursday">{t('date.thursday')}</MenuItem>
                                    <MenuItem value="Friday">{t('date.friday')}</MenuItem>
                                    <MenuItem value="Saturday">{t('date.saturday')}</MenuItem>
                                    <MenuItem value="Sunday">{t('date.sunday')}</MenuItem>
                                </Select>
                                {!!errors.workweekTitle && (
                                    <FormHelperText error>{errors.workweekTitle}</FormHelperText>
                                )}
                            </FormControl>

                            <TextField
                                fullWidth
                                label={t('employee')}
                                value={newWorkSchedule.employeeName?.emailAndName || ''}
                                InputProps={{
                                    readOnly: true,
                                    sx: {
                                        borderRadius: '8px',
                                        bgcolor: 'action.disabledBackground',
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                        }
                                    }
                                }}
                                variant="outlined"
                                disabled
                                helperText={t('employeeCannotBeChanged')}
                            />
                        </Box>

                        {/* Giờ làm việc buổi sáng */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                                {t('morningShift')}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('startTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.morningStart !== null ? newWorkSchedule.morningStart : ''}
                                            onChange={(e) => handleInputChange('morningStart', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('startTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsMorning.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsMorning.map((option) => (
                                                <MenuItem key={`morning-start-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('endTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.morningEnd !== null ? newWorkSchedule.morningEnd : ''}
                                            onChange={(e) => handleInputChange('morningEnd', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('endTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsMorning.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsMorning.map((option) => (
                                                <MenuItem key={`morning-end-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                            {errors.morningTime && (
                                <FormHelperText error sx={{ ml: 2, mt: 1, fontSize: '0.85rem' }}>
                                    {errors.morningTime}
                                </FormHelperText>
                            )}
                        </Box>

                        {/* Giờ làm việc buổi chiều */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                                {t('afternoonShift')}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('startTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.afternoonStart !== null ? newWorkSchedule.afternoonStart : ''}
                                            onChange={(e) => handleInputChange('afternoonStart', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('startTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsAfternoon.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsAfternoon.map((option) => (
                                                <MenuItem key={`afternoon-start-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('endTime')}</InputLabel>
                                        <Select
                                            value={newWorkSchedule.afternoonEnd !== null ? newWorkSchedule.afternoonEnd : ''}
                                            onChange={(e) => handleInputChange('afternoonEnd', e.target.value === '' ? null : Number(e.target.value))}
                                            label={t('endTime')}
                                            sx={{
                                                borderRadius: '8px'
                                            }}
                                            renderValue={(value: string | number) => {
                                                return !value && value !== 0 ? <em>{t('notSet')}</em> : timeOptionsAfternoon.find(option => option.value === value)?.label || value;
                                            }}
                                        >
                                            <MenuItem value=""><em>{t('none')}</em></MenuItem>
                                            {timeOptionsAfternoon.map((option) => (
                                                <MenuItem key={`afternoon-end-${option.value}`} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                            {errors.afternoonTime && (
                                <FormHelperText error sx={{ ml: 2, mt: 1, fontSize: '0.85rem' }}>
                                    {errors.afternoonTime}
                                </FormHelperText>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Button
                        onClick={handleCloseEditDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: 8,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmitEdit}
                        variant="contained"
                        sx={{
                            borderRadius: 8,
                            px: 4,
                            py: 1,
                            ml: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2 0%, #304ffe 100%)',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0 0%, #283593 100%)',
                                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                            }
                        }}
                    >
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 