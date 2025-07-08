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
  EventSeat as SeatIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { seatAPI, screenAPI, cinemaAPI } from '../services/apiService';

const SeatsPage = () => {
  const [seats, setSeats] = useState([]);
  const [filteredSeats, setFilteredSeats] = useState([]);
  const [screens, setScreens] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, seat: null });
  
  // Filter states
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');

  const [seatForm, setSeatForm] = useState({
    seatNumber: '',
    row: '',
    screenId: '',
    seatType: 'Standard'
  });

  const seatTypes = ['Standard', 'VIP', 'Couple', 'Wheelchair'];

  const fetchSeats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await seatAPI.getAll();
      setSeats(response.data);
      applyFilters(response.data);
    } catch (err) {
      console.error('Error fetching seats:', err);
      setError('Không thể tải danh sách ghế');
    } finally {
      setLoading(false);
    }
  };

  const fetchScreens = async () => {
    try {
      const response = await screenAPI.getAll();
      setScreens(response.data);
    } catch (err) {
      console.error('Error fetching screens:', err);
    }
  };

  const fetchCinemas = async () => {
    try {
      const response = await cinemaAPI.getAll();
      setCinemas(response.data);
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await Promise.all([
        fetchSeats(),
        fetchScreens(),
        fetchCinemas()
      ]);
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect để apply filter khi filter thay đổi
  useEffect(() => {
    if (seats.length > 0) {
      applyFilters(seats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCinema, selectedScreen, seats, screens]);

  // Hàm apply filters
  const applyFilters = (seatsList) => {
    let filtered = [...seatsList];

    // Filter theo cinema trước
    if (selectedCinema) {
      const cinemaScreens = screens
        .filter(screen => screen.cinemaId === selectedCinema)
        .map(screen => screen.id);
      filtered = filtered.filter(seat => cinemaScreens.includes(seat.screenId));
    }

    // Filter theo screen
    if (selectedScreen) {
      filtered = filtered.filter(seat => seat.screenId === selectedScreen);
    }

    setFilteredSeats(filtered);
  };

  // Get available screens based on selected cinema
  const getAvailableScreens = () => {
    if (selectedCinema) {
      return screens.filter(screen => screen.cinemaId === selectedCinema);
    }
    return screens;
  };

  // Handle cinema filter change
  const handleCinemaChange = (cinemaId) => {
    setSelectedCinema(cinemaId);
    setSelectedScreen(''); // Reset screen selection khi đổi cinema
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCinema('');
    setSelectedScreen('');
  };

  const handleOpenDialog = (seat = null) => {
    if (seat) {
      setEditingSeat(seat);
      setSeatForm({
        seatNumber: seat.seatNumber || '',
        row: seat.row || '',
        screenId: seat.screenId || '',
        seatType: seat.seatType || 'Standard'
      });
    } else {
      setEditingSeat(null);
      setSeatForm({
        seatNumber: '',
        row: '',
        screenId: '',
        seatType: 'Standard'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSeat(null);
    setSeatForm({
      seatNumber: '',
      row: '',
      screenId: '',
      seatType: 'Standard'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSeat) {
        await seatAPI.update(editingSeat.id, seatForm);
      } else {
        await seatAPI.create(seatForm);
      }
      handleCloseDialog();
      fetchSeats();
    } catch (err) {
      console.error('Error saving seat:', err);
      setError(editingSeat ? 'Không thể cập nhật ghế' : 'Không thể tạo ghế mới');
    }
  };

  const handleDelete = async () => {
    try {
      await seatAPI.delete(deleteDialog.seat.id);
      setDeleteDialog({ open: false, seat: null });
      fetchSeats();
    } catch (err) {
      console.error('Error deleting seat:', err);
      setError('Không thể xóa ghế');
    }
  };

  const handleFormChange = (e) => {
    setSeatForm({
      ...seatForm,
      [e.target.name]: e.target.value
    });
  };

  const getScreenName = (screenId) => {
    const screen = screens.find(s => s.id === screenId);
    return screen ? screen.name : 'Không xác định';
  };


  const getSeatTypeColor = (type) => {
    switch (type) {
      case 'VIP': return 'primary';
      case 'Couple': return 'secondary';
      case 'Wheelchair': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Quản lý Ghế
        </Typography>
        <Box>
          <IconButton onClick={fetchSeats} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm Ghế Mới
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Panel */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Lọc theo Rạp và Phòng Chiếu
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3} width='20%'>
            <FormControl fullWidth size="small">
              <InputLabel>Rạp chiếu</InputLabel>
              <Select
                value={selectedCinema}
                onChange={(e) => handleCinemaChange(e.target.value)}
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
          
          <Grid item xs={12} sm={6} md={3} width='20%'>
            <FormControl fullWidth size="small">
              <InputLabel>Phòng chiếu</InputLabel>
              <Select
                value={selectedScreen}
                onChange={(e) => setSelectedScreen(e.target.value)}
                label="Phòng chiếu"
                disabled={!selectedCinema && cinemas.length > 0}
              >
                <MenuItem value="">Tất cả phòng</MenuItem>
                {getAvailableScreens().map((screen) => (
                  <MenuItem key={screen.id} value={screen.id}>
                    {screen.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              variant="outlined" 
              onClick={resetFilters}
              size="small"
              fullWidth
            >
              Reset
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Chip 
              label={`${filteredSeats.length} ghế`}
              color="info" 
              size="small"
              sx={{ mr: 1 }}
            />
            {selectedCinema && (
              <Chip 
                label={`Rạp: ${cinemas.find(c => c.id === selectedCinema)?.name}`}
                color="primary" 
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {selectedScreen && (
              <Chip 
                label={`Phòng: ${getScreenName(selectedScreen)}`}
                color="secondary" 
                size="small"
              />
            )}
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={3}>
        {filteredSeats.map((seat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={seat.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Ghế {seat.seatNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      🎭 {getScreenName(seat.screenId)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      📍 Hàng {seat.row}
                    </Typography>
                    <Chip 
                      label={seat.seatType} 
                      color={getSeatTypeColor(seat.seatType)}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(seat)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, seat })}
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
          {editingSeat ? 'Chỉnh sửa Ghế' : 'Thêm Ghế Mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Số ghế"
              name="seatNumber"
              value={seatForm.seatNumber}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Hàng ghế"
              name="row"
              value={seatForm.row}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Phòng chiếu</InputLabel>
              <Select
                name="screenId"
                value={seatForm.screenId}
                onChange={handleFormChange}
                required
              >
                {screens.map((screen) => (
                  <MenuItem key={screen.id} value={screen.id}>
                    {screen.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Loại ghế</InputLabel>
              <Select
                name="seatType"
                value={seatForm.seatType}
                onChange={handleFormChange}
              >
                {seatTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSeat ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, seat: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa ghế "{deleteDialog.seat?.seatNumber}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, seat: null })}>
            Hủy
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatsPage;
