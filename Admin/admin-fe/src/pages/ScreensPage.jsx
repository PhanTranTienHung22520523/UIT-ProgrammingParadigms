import React, { useState, useEffect, useCallback } from 'react';
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
  Tv as ScreenIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { screenAPI, cinemaAPI } from '../services/apiService';

const ScreensPage = () => {
  const [screens, setScreens] = useState([]);
  const [filteredScreens, setFilteredScreens] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, screen: null });

  // Filter state
  const [cinemaFilter, setCinemaFilter] = useState('');

  const [screenForm, setScreenForm] = useState({
    name: '',
    cinemaId: '',
    totalSeats: '',
    screenType: 'Standard'
  });

  const screenTypes = ['Standard', 'IMAX', '4DX', 'VIP', 'Gold Class'];

  const applyFilter = useCallback((screensData) => {
    let filtered = [...screensData];
    
    // Filter by cinema
    if (cinemaFilter) {
      filtered = filtered.filter(screen => screen.cinemaId === cinemaFilter);
    }
    
    setFilteredScreens(filtered);
  }, [cinemaFilter]);

  const fetchScreens = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await screenAPI.getAll();
      setScreens(response.data);
      applyFilter(response.data);
    } catch (err) {
      console.error('Error fetching screens:', err);
      setError('Không thể tải danh sách phòng chiếu');
    } finally {
      setLoading(false);
    }
  }, [applyFilter]);

  const fetchCinemas = useCallback(async () => {
    try {
      const response = await cinemaAPI.getAll();
      setCinemas(response.data);
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    }
  }, []);

  useEffect(() => {
    fetchScreens();
    fetchCinemas();
  }, [fetchScreens, fetchCinemas]);

  // Apply filter when filter state changes
  useEffect(() => {
    applyFilter(screens);
  }, [applyFilter, screens]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'cinema') {
      setCinemaFilter(value);
    }
  };

  const resetFilters = () => {
    setCinemaFilter('');
  };

  const handleOpenDialog = (screen = null) => {
    if (screen) {
      setEditingScreen(screen);
      setScreenForm({
        name: screen.name || '',
        cinemaId: screen.cinemaId || '',
        totalSeats: screen.totalSeats?.toString() || '',
        screenType: screen.screenType || 'Standard'
      });
    } else {
      setEditingScreen(null);
      setScreenForm({
        name: '',
        cinemaId: '',
        totalSeats: '',
        screenType: 'Standard'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScreen(null);
    setScreenForm({
      name: '',
      cinemaId: '',
      totalSeats: '',
      screenType: 'Standard'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...screenForm,
        totalSeats: parseInt(screenForm.totalSeats)
      };
      
      if (editingScreen) {
        await screenAPI.update(editingScreen.id, formData);
      } else {
        await screenAPI.create(formData);
      }
      handleCloseDialog();
      fetchScreens();
    } catch (err) {
      console.error('Error saving screen:', err);
      setError(editingScreen ? 'Không thể cập nhật phòng chiếu' : 'Không thể tạo phòng chiếu mới');
    }
  };

  const handleDelete = async () => {
    try {
      await screenAPI.delete(deleteDialog.screen.id);
      setDeleteDialog({ open: false, screen: null });
      fetchScreens();
    } catch (err) {
      console.error('Error deleting screen:', err);
      setError('Không thể xóa phòng chiếu');
    }
  };

  const handleFormChange = (e) => {
    setScreenForm({
      ...screenForm,
      [e.target.name]: e.target.value
    });
  };

  const getCinemaName = (cinemaId) => {
    const cinema = cinemas.find(c => c.id === cinemaId);
    return cinema ? cinema.name : 'Không xác định';
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
          Quản lý Phòng Chiếu
        </Typography>
        <Box>
          <IconButton onClick={fetchScreens} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm Phòng Mới
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FilterListIcon />
            <Typography variant="h6">Bộ lọc</Typography>
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4} width='50%'>
              <FormControl fullWidth size="small">
                <InputLabel>Lọc theo rạp phim</InputLabel>
                <Select
                  value={cinemaFilter}
                  onChange={(e) => handleFilterChange('cinema', e.target.value)}
                  label="Lọc theo rạp phim"
                >
                  <MenuItem value="">Tất cả rạp</MenuItem>
                  {cinemas.map((cinema) => (
                    <MenuItem key={cinema.id} value={cinema.id}>
                      {cinema.name} - {cinema.city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {cinemaFilter && (
              <Chip
                label={`Rạp: ${getCinemaName(cinemaFilter)}`}
                onDelete={() => handleFilterChange('cinema', '')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            
            {(cinemaFilter) && (
              <Button
                size="small"
                onClick={resetFilters}
                sx={{ ml: 1 }}
              >
                Xóa tất cả bộ lọc
              </Button>
            )}
            
            <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
              Hiển thị {filteredScreens.length} / {screens.length} phòng chiếu
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredScreens.map((screen) => (
          <Grid item xs={12} md={6} lg={4} key={screen.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {screen.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      🏢 {getCinemaName(screen.cinemaId)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      💺 {screen.totalSeats} ghế
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      📽️ {screen.screenType}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(screen)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, screen })}
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
          {editingScreen ? 'Chỉnh sửa Phòng Chiếu' : 'Thêm Phòng Chiếu Mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên phòng chiếu"
              name="name"
              value={screenForm.name}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rạp chiếu phim</InputLabel>
              <Select
                name="cinemaId"
                value={screenForm.cinemaId}
                onChange={handleFormChange}
                required
              >
                {cinemas.map((cinema) => (
                  <MenuItem key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Số ghế"
              name="totalSeats"
              type="number"
              value={screenForm.totalSeats}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Loại phòng chiếu</InputLabel>
              <Select
                name="screenType"
                value={screenForm.screenType}
                onChange={handleFormChange}
              >
                {screenTypes.map((type) => (
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
            {editingScreen ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, screen: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa phòng chiếu "{deleteDialog.screen?.name}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, screen: null })}>
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

export default ScreensPage;
