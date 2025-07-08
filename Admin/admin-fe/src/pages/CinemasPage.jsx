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
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { cinemaAPI } from '../services/apiService';

const CinemasPage = () => {
  const [cinemas, setCinemas] = useState([]);
  const [filteredCinemas, setFilteredCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, cinema: null });

  // Sort và Filter state
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'city', // 'city', 'name', 'district'
    sortOrder: 'asc' // 'asc', 'desc'
  });
  const [cityFilter, setCityFilter] = useState('');

  // Danh sách các tỉnh thành Việt Nam
  const vietnamProvinces = [
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh',
    'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
    'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
    'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang',
    'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
    'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi',
    'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình',
    'Thái Nguyên', 'Thanh Hóa', 'Tiền Giang', 'Trà Vinh',
    'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
    // Thành phố trực thuộc trung ương
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Thừa Thiên Huế'
  ].sort();

  const majorCities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Thừa Thiên Huế'];
  const otherProvinces = vietnamProvinces.filter(city => !majorCities.includes(city));

  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    address: '',
    city: '',
    district: '',
    phone: '',
    email: ''
  });

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cinemaAPI.getAll();
      setCinemas(response.data);
      applySortAndFilter(response.data);
    } catch (err) {
      console.error('Error fetching cinemas:', err);
      setError('Không thể tải danh sách rạp chiếu phim');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await fetchCinemas();
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect để apply sort/filter khi config thay đổi
  useEffect(() => {
    if (cinemas.length > 0) {
      applySortAndFilter(cinemas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortConfig, cityFilter, cinemas]);

  // Hàm apply sort và filter
  const applySortAndFilter = (cinemasList) => {
    let filtered = [...cinemasList];

    // Filter theo thành phố
    if (cityFilter) {
      filtered = filtered.filter(cinema => 
        cinema.city?.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    // Sort theo config
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortConfig.sortBy) {
        case 'city': {
          const cityA = (a.city || '').toLowerCase();
          const cityB = (b.city || '').toLowerCase();
          comparison = cityA.localeCompare(cityB, 'vi');
          break;
        }
        case 'name': {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          comparison = nameA.localeCompare(nameB, 'vi');
          break;
        }
        case 'district': {
          const districtA = (a.district || a.address || '').toLowerCase();
          const districtB = (b.district || b.address || '').toLowerCase();
          comparison = districtA.localeCompare(districtB, 'vi');
          break;
        }
        default:
          comparison = 0;
      }

      return sortConfig.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredCinemas(filtered);
  };

  // Hàm lấy danh sách các thành phố unique
  const getUniqueCities = () => {
    const cities = cinemas
      .map(cinema => cinema.city)
      .filter(city => city && city.trim() !== '')
      .filter((city, index, arr) => arr.indexOf(city) === index)
      .sort((a, b) => a.localeCompare(b, 'vi'));
    return cities;
  };

  // Handle sort change
  const handleSortChange = (field, order) => {
    setSortConfig({
      sortBy: field,
      sortOrder: order
    });
  };

  // Handle city filter change
  const handleCityFilterChange = (city) => {
    setCityFilter(city);
  };

  // Reset filters
  const resetFilters = () => {
    setCityFilter('');
    setSortConfig({
      sortBy: 'city',
      sortOrder: 'asc'
    });
  };

  const handleOpenDialog = (cinema = null) => {
    if (cinema) {
      setEditingCinema(cinema);
      setCinemaForm({
        name: cinema.name || '',
        address: cinema.address || '',
        city: cinema.city || '',
        district: cinema.district || '',
        phone: cinema.phone || '',
        email: cinema.email || ''
      });
    } else {
      setEditingCinema(null);
      setCinemaForm({
        name: '',
        address: '',
        city: '',
        district: '',
        phone: '',
        email: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCinema(null);
    setCinemaForm({
      name: '',
      address: '',
      city: '',
      district: '',
      phone: '',
      email: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCinema) {
        await cinemaAPI.update(editingCinema.id, cinemaForm);
      } else {
        await cinemaAPI.create(cinemaForm);
      }
      handleCloseDialog();
      fetchCinemas();
    } catch (err) {
      console.error('Error saving cinema:', err);
      setError(editingCinema ? 'Không thể cập nhật rạp chiếu phim' : 'Không thể tạo rạp chiếu phim mới');
    }
  };

  const handleDelete = async () => {
    try {
      await cinemaAPI.delete(deleteDialog.cinema.id);
      setDeleteDialog({ open: false, cinema: null });
      fetchCinemas();
    } catch (err) {
      console.error('Error deleting cinema:', err);
      setError('Không thể xóa rạp chiếu phim');
    }
  };

  const handleFormChange = (e) => {
    setCinemaForm({
      ...cinemaForm,
      [e.target.name]: e.target.value
    });
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
          Quản lý Rạp Chiếu Phim
        </Typography>
        <Box>
          <IconButton onClick={fetchCinemas} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm Rạp Mới
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sort và Filter Panel */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SortIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Sắp xếp và Lọc theo Tỉnh/Thành phố
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3} width='20%'>
            <FormControl fullWidth size="small">
              <InputLabel>Lọc theo Thành phố</InputLabel>
              <Select
                value={cityFilter}
                onChange={(e) => handleCityFilterChange(e.target.value)}
                label="Lọc theo Thành phố"
              >
                <MenuItem value="">Tất cả thành phố</MenuItem>
                {getUniqueCities().map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortConfig.sortBy}
                onChange={(e) => handleSortChange(e.target.value, sortConfig.sortOrder)}
                label="Sắp xếp theo"
              >
                <MenuItem value="city">Thành phố</MenuItem>
                <MenuItem value="name">Tên rạp</MenuItem>
                <MenuItem value="district">Quận/Huyện</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Thứ tự</InputLabel>
              <Select
                value={sortConfig.sortOrder}
                onChange={(e) => handleSortChange(sortConfig.sortBy, e.target.value)}
                label="Thứ tự"
              >
                <MenuItem value="asc">A → Z</MenuItem>
                <MenuItem value="desc">Z → A</MenuItem>
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
          
          <Grid item xs={12} md={2}>
            <Chip 
              label={`${filteredCinemas.length} rạp`}
              color="info" 
              size="small"
            />
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={3}>
        {filteredCinemas.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                Không tìm thấy rạp chiếu phim nào
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {cityFilter ? `Thử thay đổi bộ lọc hoặc thêm rạp mới cho "${cityFilter}"` : 'Hãy thêm rạp chiếu phim đầu tiên'}
              </Typography>
            </Card>
          </Grid>
        ) : (
          filteredCinemas.map((cinema) => (
          <Grid item xs={12} md={6} lg={4} key={cinema.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {cinema.name}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label={cinema.city}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {cinema.district && (
                        <Chip 
                          label={cinema.district}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {cinema.address}
                    </Typography>
                    {cinema.phone && (
                      <Typography variant="body2" color="textSecondary">
                        📞 {cinema.phone}
                      </Typography>
                    )}
                    {cinema.email && (
                      <Typography variant="body2" color="textSecondary">
                        ✉️ {cinema.email}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(cinema)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, cinema })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCinema ? 'Chỉnh sửa Rạp Chiếu Phim' : 'Thêm Rạp Chiếu Phim Mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên rạp"
              name="name"
              value={cinemaForm.name}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              name="address"
              value={cinemaForm.address}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Thành phố</InputLabel>
              <Select
                name="city"
                value={cinemaForm.city}
                onChange={handleFormChange}
                required
                label="Thành phố"
              >
                <MenuItem disabled>
                  <em style={{ fontWeight: 'bold' }}>Thành phố lớn</em>
                </MenuItem>
                {majorCities.map((city) => (
                  <MenuItem key={city} value={city} sx={{ pl: 3 }}>
                    {city}
                  </MenuItem>
                ))}
                <MenuItem disabled>
                  <em style={{ fontWeight: 'bold' }}>Tỉnh thành khác</em>
                </MenuItem>
                {otherProvinces.map((province) => (
                  <MenuItem key={province} value={province} sx={{ pl: 3 }}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Quận/Huyện"
              name="district"
              value={cinemaForm.district}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              value={cinemaForm.phone}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={cinemaForm.email}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCinema ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, cinema: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa rạp "{deleteDialog.cinema?.name}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, cinema: null })}>
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

export default CinemasPage;
