import { useState } from 'react';
import { Box, Typography, TextField, Button, RadioGroup, FormControlLabel, Radio, Card, IconButton, Alert, Select, MenuItem } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AddIcon from '@mui/icons-material/Add';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../../contexts/ThemeContext';
import dayjs from 'dayjs';
import { FilePond } from 'react-filepond'
import { FilePondFile, registerPlugin } from 'filepond'
import 'filepond/dist/filepond.min.css'

// Import FilePond styles
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

function AddNewEvent() {
  const { t } = useTranslation();
  const { isDarkMode } = useThemeContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [host, setHost] = useState('');
  const [repeatType, setRepeatType] = useState('default');
  const [calendarType, setCalendarType] = useState('personal');
  const [files, setFiles] = useState<FilePondFile[]>([]);
  
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

    if (!location.trim()) {
      newErrors.location = t('validation.locationRequired');
      isValid = false;
    }

    if (!host.trim()) {
      newErrors.host = t('validation.hostRequired');
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form Data:', {
        title,
        content,
        location,
        host,
        repeatType,
        calendarType,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        files: files.map(file => file.filename)
      });
    }
  };

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
          }}>
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
                  startIcon={<AddIcon />}
                  variant="contained"
                  sx={{ mr: 1 }}
                  onClick={handleSubmit}
                >
                  {t('add')}
                </Button>

                <IconButton color="inherit">
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
                onChange={(e) => setCalendarType(e.target.value)}
                sx={{
                  '& .MuiSelect-select': {
                    color: isDarkMode ? 'white' : 'black',
                  },
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
              <span style={{ color: 'red' }}>*</span>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              sx={{
                marginTop:1
              }}
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>
              {t('addNew.content')} <span style={{ color: 'red' }}>*</span>
            </Typography>
            {errors.content && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.content}
              </Alert>
            )}
            <Box sx={{ 
              border: errors.content ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              '& .ck-editor__editable': {
                minHeight: '300px',
                maxHeight: '500px',
                backgroundColor: isDarkMode ? '#424242' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
              },
              '& .ck-toolbar': {
                backgroundColor: isDarkMode ? '#616161' : '#f5f5f5',
                borderColor: isDarkMode ? '#424242' : '#e0e0e0',
              }
            }}>
              <CKEditor
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setContent(data);
                }}
                config={{
                  licenseKey: '',
                  plugins: [
                    Essentials,
                    Bold,
                    Italic,
                    Link,
                    List,
                    Paragraph,
                    Table,
                    TableToolbar
                  ],
                  toolbar: {
                    items: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'blockQuote',
                      'insertTable',
                      'undo',
                      'redo'
                    ]
                  },
                  table: {
                    contentToolbar: [
                      'tableColumn',
                      'tableRow',
                      'mergeTableCells'
                    ]
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
              <DatePicker
                value={startDate}
                onChange={(newValue) => newValue && setStartDate(newValue)}
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
                onChange={(newValue) => newValue && setEndDate(newValue)}
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
                onChange={(newValue) => newValue && setStartTime(newValue)}
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
                onChange={(newValue) => newValue && setEndTime(newValue)}
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

            <TextField
              label={t('addNew.location')}
              fullWidth
              margin="normal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={!!errors.location}
              helperText={errors.location}
            />

            <TextField
              label={t('addNew.host')}
              fullWidth
              margin="normal"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              error={!!errors.host}
              helperText={errors.host}
            />

            <Box sx={{ my: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.primary' }}>
                {t('addNew.repeatType')}
              </Typography>
              <RadioGroup
                row
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value)}
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
              allowMultiple={true}
              maxFiles={3}
              server={{
                process: (_fieldName, _file, _metadata, load) => {
                  // Simulate immediate success after a short delay
                  setTimeout(() => {
                    load('file-id-mock'); // Pass a dummy ID or empty string
                  }, 500);
                },
                // You might need to implement other methods like revert, load, fetch if you use them
              }}
              name="files" /* sets the file input name, it's filepond by default */
              labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            />
          </Card>
        </Box>
      </motion.div>
    </LocalizationProvider>
  );
}

export default AddNewEvent; 