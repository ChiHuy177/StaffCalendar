import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, Button, RadioGroup, FormControlLabel, Radio, Card, IconButton, Alert, Select, MenuItem, SelectChangeEvent, Autocomplete, AutocompleteRenderInputParams, CircularProgress } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../../contexts/ThemeContext';
import dayjs, { Dayjs } from 'dayjs';
import { FilePond } from 'react-filepond'
import { FilePondFile, registerPlugin } from 'filepond'
import 'filepond/dist/filepond.min.css'
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Import FilePond styles
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

import { getAllMeetingRoom } from '../../apis/MeetingRoomApi';
import { MeetingRoom } from '../../types/location/location_type';
import { checkRoomAvailabilityApi, createEventWithAttachments, uploadTempFile } from '../../apis/EventApi';
import { useUser } from '../../contexts/AuthUserContext';
import { UserInfo } from '../../types/auth/auth_type';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

interface TempFile {
  tempFileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
}


function AddNewEvent() {
  const { t } = useTranslation();
  const { nameOfUsers, user } = useUser();
  const { isDarkMode } = useThemeContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [repeatType, setRepeatType] = useState('default');
  const [calendarType, setCalendarType] = useState('personal');
  const [files, setFiles] = useState<FilePondFile[]>([]);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [isCheckingRoom, setIsCheckingRoom] = useState(false);

  // Thêm state cho ngày và giờ
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs());

  // State cho validation
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    location: '',
    host: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  });

  const quillRef = useRef<Quill | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      quillRef.current.on('text-change', () => {
        setContent(quillRef.current?.root.innerHTML || '');
      });

      async function fetchMeetingRooms() {
        try {
          const data = await getAllMeetingRoom();
          // const data = await response.json();
          setMeetingRooms(data);
        } catch (error) {
          console.error('Error fetching meeting rooms:', error);
        }
      }

      fetchMeetingRooms();
    }
  }, []);

  const validateForm = () => {
    const newErrors = {
      title: '',
      content: '',
      location: '',
      host: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    };

    let isValid = true;

    if (!title.trim()) {
      newErrors.title = t('validation.titleRequired');
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = t('validation.contentRequired');
      isValid = false;
    }

    if (!startDate) {
      newErrors.startDate = t('validation.startDateRequired');
      isValid = false;
    }

    if (!endDate) {
      newErrors.endDate = t('validation.endDateRequired');
      isValid = false;
    }

    if (!startTime) {
      newErrors.startTime = t('validation.startTimeRequired');
      isValid = false;
    }

    if (!endTime) {
      newErrors.endTime = t('validation.endTimeRequired');
      isValid = false;
    }

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if (startDate && endDate) {
      if (endDate.isBefore(startDate)) {
        newErrors.endDate = t('validation.endDateAfterStart');
        isValid = false;
      } else if (endDate.isSame(startDate, 'day')) {
        // Nếu cùng ngày thì kiểm tra giờ
        if (endTime && startTime && endTime.isBefore(startTime)) {
          newErrors.endTime = t('validation.endTimeAfterStartSameDay');
          isValid = false;
        }
      }
    }

    // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
    if (startTime && endTime && endTime.isBefore(startTime)) {
      newErrors.endTime = t('validation.endTimeAfterStart');
      isValid = false;
    }

    if(location && location.trim() !== '' && !isRoomAvailable) {
      newErrors.location = t('validation.roomNotAvailable');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileUpload = async (file: any) => {
    try {
      const originalName = file.name;
      const extension = originalName.split('.').pop();
      const shortName = originalName.length > 50
        ? `${originalName.substring(0, 50)}.${extension}`
        : originalName;

      const shortFile = new File([file], shortName, { type: file.type });

      const result = await uploadTempFile(shortFile);
      console.log('Upload result:', result); // Thêm dòng này để xem response

      // Đảm bảo tempFileName không bị undefined
      if (!result.tempFileName) {
        throw new Error('No tempFileName in response');
      }

      setTempFiles(prev => [...prev, {
        tempFileName: result.tempFileName,
        originalFileName: originalName,
        fileType: file.type,
        fileSize: file.size
      }]);
      return result.tempFileName;
    } catch (error) {
      console.error('Error uploading file: ', error);
      throw error;
    }
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const eventData = {
          event: {
            title,
            description: content,
            eventType: calendarType,
            startTime: `${startDate.format('YYYY-MM-DD')}T${startTime.format('HH:mm')}:00`,
            endTime: `${endDate.format('YYYY-MM-DD')}T${endTime.format('HH:mm')}:00`,
            createdBy: user?.email,
            recurrentType: repeatType === 'default' ? 'Default' : repeatType === 'weekly' ? 'Weekly' : 'Monthly',
            isDeleted: false,
            ...(location && location.trim() !== '' && { meetingRoomId: Number(location) })
          },
          attendeeIds: selectedAttendees.map(user => user.personalProfileId),
          tempFiles: tempFiles
        };

        await createEventWithAttachments(eventData);

        // Hiển thị thông báo thành công
        await Swal.fire({
          title: t('success'),
          text: t('eventCreatedSuccessfully'),
          icon: 'success',
          confirmButtonText: t('ok'),
          confirmButtonColor: '#083B75'
        });

        // Chuyển hướng về trang calendar
        navigate('/calendar/meeting');
      } catch (error) {
        console.error('Error creating event: ', error);

        // Hiển thị thông báo lỗi
        await Swal.fire({
          title: t('error'),
          text: t('errorCreatingEvent'),
          icon: 'error',
          confirmButtonText: t('ok'),
          confirmButtonColor: '#083B75'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const checkRoomAvailability = useCallback(async () => {
    if (!location || location.trim() === '' || !startDate || !endDate || !startTime || !endTime) return;

    try {
      setIsCheckingRoom(true);
      const eventData = {
        meetingRoomId: Number(location),
        startTime: new Date(`${startDate.format('YYYY-MM-DD')}T${startTime.format("HH:mm")}:00`),
        endTime: new Date(`${endDate.format('YYYY-MM-DD')}T${endTime.format('HH:mm')}:00`)
      };

      const response = await checkRoomAvailabilityApi(eventData);
      setIsRoomAvailable(response.isAvailable);

      if (!response.isAvailable) {
        await Swal.fire({
          title: t('error'),
          text: t('validation.roomNotAvailable'),
          icon: 'error',
          confirmButtonText: t('ok'),
          confirmButtonColor: '#083B75'
        });
        setErrors(prev => ({
          ...prev,
          location: t('validation.roomNotAvailable')
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          location: ''
        }));
      }

    } catch (error) {
      console.error('Error checking room availability: ', error);
      await Swal.fire({
        title: t('error'),
        text: t('errorCheckingRoom'),
        icon: 'error',
        confirmButtonText: t('ok'),
        confirmButtonColor: '#083B75'
      });
    } finally {
      setIsCheckingRoom(false);
    }
  }, [location, startDate, endDate, startTime, endTime, t]);


  useEffect(() => {
    if (location && location.trim() !== '' && startDate && endDate && startTime && endTime) {
      const timeoutId = setTimeout(() => {
        checkRoomAvailability();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [location, startDate, endDate, startTime, endTime, checkRoomAvailability]);


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-6 min-h-screen bg-[#083B75] text-white"
      >
        <Box sx={{ maxWidth: 800, margin: 'auto' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 4,
              color: 'white',
              pb: 1,
            }}
          >
            {t('addNewEvent')}
          </Typography>

          <Card sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            backgroundColor: isDarkMode ? 'background.paper' : 'white',
            position: 'relative'
          }}>
            {isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '16px',
                  zIndex: 1000
                }}
              >
                <CircularProgress sx={{ color: '#fff' }} />
              </Box>
            )}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h5" sx={{ color: 'text.primary' }}>
                {t('personalCalendar')}
              </Typography>
              <Box>
                <Button
                  startIcon={isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <AddIcon />}
                  variant="contained"
                  sx={{ mr: 1 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? t('creating') : t('add')}
                </Button>

                <IconButton color="inherit" disabled={isLoading}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.primary' }}>
                {t('calendarType')}
              </Typography>
              <Select
                fullWidth
                value={calendarType}
                onChange={(e: SelectChangeEvent) => setCalendarType(e.target.value)}
                sx={{
                  '& .MuiSelect-select': {
                    color: isDarkMode ? 'white' : 'black',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#2563EB',
                  },
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? 'white' : 'black',
                  }
                }}
              >
                <MenuItem value="personal">{t('calendarTypes.personal')}</MenuItem>
                <MenuItem value="company">{t('calendarTypes.company')}</MenuItem>
                <MenuItem value="meeting">{t('calendarTypes.meeting')}</MenuItem>
                <MenuItem value="vehicle">{t('calendarTypes.vehicle')}</MenuItem>
              </Select>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                {t('addNew.title')}
              </Typography>
              <Typography component="span" sx={{ color: 'red' }}>*</Typography>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              sx={{
                marginTop: 1
              }}
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>
              {t('addNew.content')} <Typography component="span" sx={{ color: 'red' }}>*</Typography>
            </Typography>
            {errors.content && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.content}
              </Alert>
            )}
            <Box sx={{
              border: errors.content ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              '& .ql-container': {
                minHeight: '200px',
                backgroundColor: isDarkMode ? '#1E293B' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
              },
              '& .ql-toolbar': {
                backgroundColor: isDarkMode ? '#1E293B' : '#f5f5f5',
                borderColor: isDarkMode ? '#424242' : '#e0e0e0',
                '& .ql-picker': {
                  color: isDarkMode ? '#fff' : '#000',
                },
                '& .ql-stroke': {
                  stroke: isDarkMode ? '#fff' : '#000',
                },
                '& .ql-fill': {
                  fill: isDarkMode ? '#fff' : '#000',
                },
                '& .ql-picker-options': {
                  backgroundColor: isDarkMode ? '#1E293B' : '#fff',
                  borderColor: isDarkMode ? '#424242' : '#e0e0e0',
                },
                '& button:hover .ql-stroke': {
                  stroke: isDarkMode ? '#60A5FA' : '#2563EB',
                },
                '& button:hover .ql-fill': {
                  fill: isDarkMode ? '#60A5FA' : '#2563EB',
                },
                '& button.ql-active .ql-stroke': {
                  stroke: isDarkMode ? '#60A5FA' : '#2563EB',
                },
                '& button.ql-active .ql-fill': {
                  fill: isDarkMode ? '#60A5FA' : '#2563EB',
                },
              }
            }}>
              <Box ref={editorRef} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
              <DatePicker
                value={startDate}
                onChange={(newValue: Dayjs | null) => newValue && setStartDate(newValue)}
                format='DD/MM/YYYY'
                label={t('dayRange.start')}
                sx={{ flexGrow: 1 }}
                slotProps={{
                  textField: {
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                    sx: {
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: '#1E3A8A',
                        },
                      },
                      width: "50%"
                    }
                  }
                }}
              />
              <DatePicker
                value={endDate}
                onChange={(newValue: Dayjs | null) => newValue && setEndDate(newValue)}
                format='DD/MM/YYYY'
                label={t('dayRange.end')}
                sx={{ flexGrow: 1 }}
                slotProps={{
                  textField: {
                    error: !!errors.endDate,
                    helperText: errors.endDate,
                    sx: {
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: '#1E3A8A',
                        },
                      },
                      width: "50%"
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TimePicker
                value={startTime}
                onChange={(newValue: Dayjs | null) => newValue && setStartTime(newValue)}
                label={t('startTime')}
                sx={{ flexGrow: 1 }}
                slotProps={{
                  textField: {
                    error: !!errors.startTime,
                    helperText: errors.startTime,
                    sx: {
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: '#1E3A8A',
                        },
                      },
                      width: "50%"
                    }
                  }
                }}
              />
              <TimePicker
                value={endTime}
                onChange={(newValue: Dayjs | null) => newValue && setEndTime(newValue)}
                label={t('endTime')}
                sx={{ flexGrow: 1 }}
                slotProps={{
                  textField: {
                    error: !!errors.endTime,
                    helperText: errors.endTime,
                    sx: {
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: '#1E3A8A',
                        },
                      },
                      width: "50%"
                    }
                  }
                }}
              />
            </Box>

            <Autocomplete
              options={meetingRooms}
              getOptionLabel={(option: MeetingRoom) => option.roomName || ''}
              value={meetingRooms.find(room => room.id?.toString() === location) || null}
              onChange={(_: React.SyntheticEvent, newValue: MeetingRoom | null) => {
                setLocation(newValue?.id?.toString() || '');
              }}
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                  {...params}
                  label={t('addNew.location')}
                  error={!!errors.location}
                  helperText={errors.location}
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isCheckingRoom && <CircularProgress size={20}/>}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />

            <Autocomplete
              multiple
              options={nameOfUsers}
              getOptionLabel={(option) => option.emailAndName}
              value={selectedAttendees}
              onChange={(_, newValue) => setSelectedAttendees(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('addNew.host')}
                  margin="normal"
                />
              )}
            />

            <Box sx={{ my: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.primary' }}>
                {t('addNew.repeatType')}
              </Typography>
              <RadioGroup
                row
                value={repeatType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepeatType(e.target.value)}
              >
                <FormControlLabel
                  value="default"
                  control={<Radio />}
                  label={t('addNew.default')}
                />
                <FormControlLabel
                  value="weekly"
                  control={<Radio />}
                  label={t('addNew.weekly')}
                />
                <FormControlLabel
                  value="monthly"
                  control={<Radio />}
                  label={t('addNew.monthly')}
                />
              </RadioGroup>
            </Box>

            <FilePond
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              files={files as any}
              onupdatefiles={setFiles}
              onremovefile={async (error, file) => {
                if (error) {
                  console.error('Error removing file:', error);
                  return;
                }
                try {
                  // console.log("onremovefile", file.serverId);
                  // await handleFileRemove(file.serverId);
                  setTempFiles(prev => prev.filter(f => f.tempFileName !== file.serverId));
                  setFiles(prev => prev.filter(f => f.serverId !== file.serverId));
                } catch (error) {
                  console.error('Error in onremovefile:', error);
                }
              }}
              allowMultiple={true}
              maxFiles={3}
              server={{
                process: async (_fieldName, file, _metadata, load) => {
                  try {
                    const tempFileName = await handleFileUpload(file);
                    load(tempFileName);
                  } catch (error) {
                    console.error('Error processing file:', error);
                    load('error');
                  }
                }
              }}
              name="files"
              labelIdle={t('filePondDes')}
              allowImagePreview={true}
              imagePreviewMaxHeight={200}
              imagePreviewMinHeight={100}
              imagePreviewMaxFileSize="10MB"
            />
          </Card>
        </Box>
      </motion.div>
    </LocalizationProvider>
  );
}

export default AddNewEvent; 