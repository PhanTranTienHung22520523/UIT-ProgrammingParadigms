import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { showtimeAPI, movieAPI, screenAPI, cinemaAPI } from '../services/apiService';
import { formatDateTime } from '../utils/helpers';

const ShowtimesPage = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, showtime: null });

  // Filter và Sort state
  const [filters, setFilters] = useState({
    movieId: '',
    cinemaId: '',
    status: 'all', // 'all', 'upcoming', 'completed'
    sortBy: 'startTime', // 'startTime', 'movieTitle', 'cinemaName'
    sortOrder: 'asc' // 'asc', 'desc'
  });

  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    screenId: '',
    startTime: dayjs(),
    price: ''
  });

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await showtimeAPI.getAll();
      setShowtimes(response.data);
      applyFiltersAndSort(response.data);
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      setError('Không thể tải danh sách lịch chiếu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await movieAPI.getAll();
      setMovies(response.data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const fetchScreens = async () => {
    try {
      const [screensResponse, cinemasResponse] = await Promise.all([
        screenAPI.getAll(),
        cinemaAPI.getAll()
      ]);
      setScreens(screensResponse.data);
      setCinemas(cinemasResponse.data);
    } catch (err) {
      console.error('Error fetching screens/cinemas:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await Promise.all([
        fetchShowtimes(),
        fetchMovies(),
        fetchScreens()
      ]);
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect để apply filter khi filters thay đổi
  useEffect(() => {
    if (showtimes.length > 0 || movies.length > 0 || screens.length > 0 || cinemas.length > 0) {
      applyFiltersAndSort(showtimes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, showtimes, movies, screens, cinemas]);

  // Hàm apply filters và sort
  const applyFiltersAndSort = (showtimesList) => {
    let filtered = [...showtimesList];

    // Filter theo phim
    if (filters.movieId) {
      filtered = filtered.filter(showtime => showtime.movieId === filters.movieId);
    }

    // Filter theo rạp
    if (filters.cinemaId) {
      filtered = filtered.filter(showtime => {
        const screen = screens.find(s => s.id === showtime.screenId);
        return screen && screen.cinemaId === filters.cinemaId;
      });
    }

    // Filter theo trạng thái đã chiếu/chưa chiếu
    if (filters.status !== 'all') {
      const now = dayjs();
      filtered = filtered.filter(showtime => {
        const showTime = dayjs(showtime.startTime);
        if (filters.status === 'upcoming') {
          return showTime.isAfter(now);
        } else if (filters.status === 'completed') {
          return showTime.isBefore(now);
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'startTime': {
          comparison = dayjs(a.startTime).diff(dayjs(b.startTime));
          break;
        }
        case 'movieTitle': {
          const movieA = getMovieTitle(a.movieId);
          const movieB = getMovieTitle(b.movieId);
          comparison = movieA.localeCompare(movieB, 'vi');
          break;
        }
        case 'cinemaName': {
          const cinemaA = getCinemaName(a.screenId);
          const cinemaB = getCinemaName(b.screenId);
          comparison = cinemaA.localeCompare(cinemaB, 'vi');
          break;
        }
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredShowtimes(filtered);
  };

  // Helper function để lấy tên rạp từ screenId
  const getCinemaName = (screenId) => {
    const screen = screens.find(s => s.id === screenId);
    if (!screen) return 'Không xác định';
    const cinema = cinemas.find(c => c.id === screen.cinemaId);
    return cinema ? cinema.name : 'Không xác định';
  };

  // Hàm handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Hàm reset filters
  const resetFilters = () => {
    setFilters({
      movieId: '',
      cinemaId: '',
      status: 'all',
      sortBy: 'startTime',
      sortOrder: 'asc'
    });
  };

  const handleOpenDialog = (showtime = null) => {
    if (showtime) {
      setEditingShowtime(showtime);
      setShowtimeForm({
        movieId: showtime.movieId || '',
        screenId: showtime.screenId || '',
        startTime: dayjs(showtime.startTime),
        price: (showtime.basePrice || showtime.price)?.toString() || '' // Support cả basePrice và price
      });
    } else {
      setEditingShowtime(null);
      setShowtimeForm({
        movieId: '',
        screenId: '',
        startTime: dayjs(),
        price: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingShowtime(null);
    setError(''); // Clear error khi đóng dialog
    setShowtimeForm({
      movieId: '',
      screenId: '',
      startTime: dayjs(),
      price: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - kiểm tra các trường bắt buộc
    if (!showtimeForm.movieId) {
      setError('Vui lòng chọn phim');
      return;
    }
    
    if (!showtimeForm.screenId) {
      setError('Vui lòng chọn phòng chiếu');
      return;
    }
    
    if (!showtimeForm.startTime) {
      setError('Vui lòng chọn thời gian bắt đầu');
      return;
    }
    
    if (!showtimeForm.price || parseFloat(showtimeForm.price) <= 0) {
      setError('Vui lòng nhập giá vé hợp lệ (lớn hơn 0)');
      return;
    }
    
    // Kiểm tra thời gian không được trong quá khứ
    if (showtimeForm.startTime.isBefore(dayjs())) {
      setError('Thời gian chiếu không được trong quá khứ');
      return;
    }
    
    try {
      setError(''); // Clear error trước khi submit
      
      // Tìm cinemaId từ screenId
      const selectedScreen = screens.find(screen => screen.id === showtimeForm.screenId);
      if (!selectedScreen) {
        setError('Không tìm thấy thông tin phòng chiếu');
        return;
      }
      
      console.log('Selected screen:', selectedScreen);
      console.log('Available screens:', screens);
      
      const formData = {
        movieId: showtimeForm.movieId,
        screenId: showtimeForm.screenId,
        cinemaId: selectedScreen.cinemaId, // Thêm cinemaId từ screen
        startTime: showtimeForm.startTime.toISOString(),
        basePrice: parseFloat(showtimeForm.price) // Backend dùng basePrice thay vì price
      };
      
      console.log('Submitting showtime data:', formData);
      
      if (editingShowtime) {
        await showtimeAPI.update(editingShowtime.id, formData);
      } else {
        await showtimeAPI.create(formData);
      }
      handleCloseDialog();
      fetchShowtimes(); // Này sẽ trigger applyFiltersAndSort thông qua useEffect
    } catch (err) {
      console.error('Error saving showtime:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data);
      } else {
        setError(editingShowtime ? 'Không thể cập nhật lịch chiếu' : 'Không thể tạo lịch chiếu mới');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await showtimeAPI.delete(deleteDialog.showtime.id);
      setDeleteDialog({ open: false, showtime: null });
      fetchShowtimes(); // Refresh data và apply filters
    } catch (err) {
      console.error('Error deleting showtime:', err);
      setError('Không thể xóa lịch chiếu');
    }
  };

  const handleFormChange = (e) => {
    setShowtimeForm({
      ...showtimeForm,
      [e.target.name]: e.target.value
    });
  };

  const getMovieTitle = (movieId) => {
    const movie = movies.find(m => m.id === movieId);
    return movie ? movie.title : 'Không xác định';
  };

  const getScreenName = (screenId) => {
    const screen = screens.find(s => s.id === screenId);
    if (!screen) return 'Không xác định';
    
    const cinema = cinemas.find(c => c.id === screen.cinemaId);
    const cinemaName = cinema ? cinema.name : 'Unknown Cinema';
    
    return `${screen.name} - ${cinemaName}`;
  };

  const formatPrice = (price) => {
    const actualPrice = price || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(actualPrice);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý Lịch Chiếu
          </Typography>
          <Box>
            <IconButton onClick={fetchShowtimes} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Thêm Lịch Chiếu
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Bộ lọc và Sắp xếp
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3} width='25%'>
              <FormControl fullWidth size="small">
                <InputLabel>Phim</InputLabel>
                <Select
                  value={filters.movieId}
                  onChange={(e) => handleFilterChange('movieId', e.target.value)}
                  label="Phim"
                >
                  <MenuItem value="">Tất cả phim</MenuItem>
                  {movies.map((movie) => (
                    <MenuItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3} width='15%'>
              <FormControl fullWidth size="small">
                <InputLabel>Rạp chiếu</InputLabel>
                <Select
                  value={filters.cinemaId}
                  onChange={(e) => handleFilterChange('cinemaId', e.target.value)}
                  label="Rạp chiếu"
                >
                  <MenuItem value="">Tất cả rạp</MenuItem>
                  {cinemas.map((cinema) => (
                    <MenuItem key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="upcoming">Sắp chiếu</MenuItem>
                  <MenuItem value="completed">Đã chiếu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sắp xếp theo"
                >
                  <MenuItem value="startTime">Thời gian</MenuItem>
                  <MenuItem value="movieTitle">Tên phim</MenuItem>
                  <MenuItem value="cinemaName">Tên rạp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  label="Thứ tự"
                >
                  <MenuItem value="asc">Tăng dần</MenuItem>
                  <MenuItem value="desc">Giảm dần</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={1}>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                size="small"
                fullWidth
              >
                Reset
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${filteredShowtimes.length} suất chiếu`}
              color="info" 
              size="small"
            />
          </Box>
        </Card>

        <Grid container spacing={3}>
          {filteredShowtimes.map((showtime) => (
            <Grid item xs={12} md={6} lg={4} key={showtime.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {getMovieTitle(showtime.movieId)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        🎭 {getScreenName(showtime.screenId)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        🕐 {formatDateTime(showtime.startTime)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={formatPrice(showtime.basePrice || showtime.price)}
                          color="primary"
                          size="small"
                        />
                        <Chip 
                          label={dayjs(showtime.startTime).isAfter(dayjs()) ? 'Sắp chiếu' : 'Đã chiếu'}
                          color={dayjs(showtime.startTime).isAfter(dayjs()) ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(showtime)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, showtime })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingShowtime ? 'Chỉnh sửa Lịch Chiếu' : 'Thêm Lịch Chiếu Mới'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Phim</InputLabel>
                <Select
                  name="movieId"
                  value={showtimeForm.movieId}
                  onChange={handleFormChange}
                  required
                >
                  {movies.map((movie) => (
                    <MenuItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Phòng chiếu</InputLabel>
                <Select
                  name="screenId"
                  value={showtimeForm.screenId}
                  onChange={handleFormChange}
                  required
                >
                  {screens.map((screen) => {
                    const cinema = cinemas.find(c => c.id === screen.cinemaId);
                    const displayName = cinema ? `${screen.name} - ${cinema.name}` : screen.name;
                    return (
                      <MenuItem key={screen.id} value={screen.id}>
                        {displayName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <DateTimePicker
                label="Thời gian bắt đầu"
                value={showtimeForm.startTime}
                onChange={(newValue) => {
                  setShowtimeForm({
                    ...showtimeForm,
                    startTime: newValue
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />

              <TextField
                fullWidth
                label="Giá vé"
                name="price"
                type="number"
                value={showtimeForm.price}
                onChange={handleFormChange}
                required
                InputProps={{
                  endAdornment: 'VND'
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingShowtime ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, showtime: null })}
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa lịch chiếu "{getMovieTitle(deleteDialog.showtime?.movieId)}"?
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, showtime: null })}>
              Hủy
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ShowtimesPage;
