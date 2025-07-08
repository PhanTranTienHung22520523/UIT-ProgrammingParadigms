import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  BookOnline as BookingIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as ConfirmedIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { apiService } from '../services/apiService';
import { formatDateTime, formatCurrency } from '../utils/helpers';

const BookingsPage = () => {
  const [userBookings, setUserBookings] = useState([]);
  const [guestBookings, setGuestBookings] = useState([]);
  const [, setMovies] = useState([]);
  const [, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching bookings...');
      
      const [userResponse, guestResponse, moviesResponse, screensResponse] = await Promise.allSettled([
        apiService.getAllUserBookings(),
        apiService.getAllGuestBookings(),
        apiService.getAllMovies(),
        apiService.getAllScreens()
      ]);
      
      console.log('User bookings response:', userResponse);
      console.log('Guest bookings response:', guestResponse);
      
      // Fetch movies and screens for reference
      let moviesData = [];
      let screensData = [];
      
      if (moviesResponse.status === 'fulfilled') {
        moviesData = moviesResponse.value.data || moviesResponse.value || [];
        setMovies(moviesData);
        console.log('Movies data loaded:', moviesData.length, 'movies');
      } else {
        console.error('Failed to load movies:', moviesResponse.reason);
      }
      
      if (screensResponse.status === 'fulfilled') {
        screensData = screensResponse.value.data || screensResponse.value || [];
        setScreens(screensData);
        console.log('Screens data loaded:', screensData.length, 'screens');
      } else {
        console.error('Failed to load screens:', screensResponse.reason);
      }
      
      // Helper functions to get names
      const getMovieName = (movieId) => {
        if (!movieId) return 'N/A';
        const movie = moviesData.find(m => m.id === movieId || m._id === movieId);
        const movieName = movie ? movie.title : movieId;
        console.log(`Movie lookup: ${movieId} -> ${movieName}`, movie);
        return movieName || 'N/A';
      };
      
      const getScreenName = (screenId) => {
        if (!screenId) return 'N/A';
        const screen = screensData.find(s => s.id === screenId || s._id === screenId);
        const screenName = screen ? screen.name : screenId;
        console.log(`Screen lookup: ${screenId} -> ${screenName}`, screen);
        return screenName || 'N/A';
      };
      
      if (userResponse.status === 'fulfilled') {
        console.log('User bookings data:', userResponse.value.data);
        // API trả về array trực tiếp, không phải { data: [] }
        const userData = userResponse.value.data || userResponse.value || [];
        console.log('Processing user bookings:', userData.length, 'items');
        
        const enhancedUserData = userData.map(booking => {
          console.log('Processing user booking:', booking);
          return {
            ...booking,
            movieTitle: getMovieName(booking.movieId),
            screenName: getScreenName(booking.screenId),
            type: 'user'
          };
        });
        
        console.log('Enhanced user bookings:', enhancedUserData);
        setUserBookings(Array.isArray(enhancedUserData) ? enhancedUserData : []);
      } else {
        console.error('User bookings failed:', userResponse.reason);
      }
      
      if (guestResponse.status === 'fulfilled') {
        console.log('Guest bookings data:', guestResponse.value.data);
        // API trả về array trực tiếp, không phải { data: [] }
        const guestData = guestResponse.value.data || guestResponse.value || [];
        console.log('Processing guest bookings:', guestData.length, 'items');
        
        const enhancedGuestData = guestData.map(booking => {
          console.log('Processing guest booking:', booking);
          return {
            ...booking,
            movieTitle: getMovieName(booking.movieId),
            screenName: getScreenName(booking.screenId),
            type: 'guest'
          };
        });
        
        console.log('Enhanced guest bookings:', enhancedGuestData);
        setGuestBookings(Array.isArray(enhancedGuestData) ? enhancedGuestData : []);
      } else {
        console.error('Guest bookings failed:', guestResponse.reason);
      }
      
      // If both failed, show error
      if (userResponse.status === 'rejected' && guestResponse.status === 'rejected') {
        setError('Không thể tải danh sách đặt vé. Vui lòng kiểm tra kết nối backend.');
        
        // Set mock data for testing
        setUserBookings([
          {
            id: 'mock1',
            userId: 'user123',
            movieTitle: 'Avengers: Endgame',
            screenName: 'Screen 1',
            seatNumbers: ['A1', 'A2'],
            totalPrice: 200000,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString()
          }
        ]);
        
        setGuestBookings([
          {
            id: 'mock2',
            bookingCode: 'GB001',
            guestName: 'Nguyễn Văn A',
            guestEmail: 'test@example.com',
            guestPhone: '0123456789',
            movieTitle: 'Spider-Man',
            seatNumbers: ['B1', 'B2'],
            totalPrice: 180000,
            status: 'PENDING',
            createdAt: new Date().toISOString()
          }
        ]);
      }
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Không thể tải danh sách đặt vé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      'CONFIRMED': { color: 'success', icon: <ConfirmedIcon />, label: 'Đã xác nhận' },
      'PENDING': { color: 'warning', icon: <PendingIcon />, label: 'Chờ thanh toán' },
      'CANCELLED': { color: 'error', icon: <CancelledIcon />, label: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: null, label: status };
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const userBookingColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      renderCell: (params) => (
        <span title={params.value}>
          {params.value?.substring(0, 8) + '...'}
        </span>
      )
    },
    {
      field: 'userId',
      headerName: 'User ID',
      width: 120,
      renderCell: (params) => (
        <span title={params.value}>
          {params.value?.substring(0, 8) + '...'}
        </span>
      )
    },
    {
      field: 'movieTitle',
      headerName: 'Phim',
      width: 200,
      renderCell: (params) => (
        <strong style={{ color: '#1976d2' }}>
          {params.value || 'N/A'}
        </strong>
      )
    },
    {
      field: 'screenName',
      headerName: 'Phòng chiếu',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'N/A'} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      field: 'seatNumbers',
      headerName: 'Ghế',
      width: 150,
      valueGetter: (value, row) => row.seatNumbers?.join(', ') || 'N/A'
    },
    {
      field: 'totalPrice',
      headerName: 'Tổng tiền',
      width: 150,
      valueGetter: (value, row) => formatCurrency(row.totalPrice || 0),
      renderCell: (params) => (
        <strong style={{ color: '#2e7d32' }}>
          {formatCurrency(params.row.totalPrice || 0)}
        </strong>
      )
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 150,
      renderCell: (params) => getStatusChip(params.value)
    },
    {
      field: 'createdAt',
      headerName: 'Ngày tạo',
      width: 180,
      valueGetter: (value, row) => formatDateTime(row.createdAt)
    }
  ];

  const guestBookingColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'bookingCode',
      headerName: 'Mã đặt vé',
      width: 150
    },
    {
      field: 'guestName',
      headerName: 'Tên khách',
      width: 150
    },
    {
      field: 'guestEmail',
      headerName: 'Email',
      width: 200
    },
    {
      field: 'guestPhone',
      headerName: 'Số điện thoại',
      width: 150
    },
    {
      field: 'movieTitle',
      headerName: 'Phim',
      width: 200,
      valueGetter: (value, row) => row.movieTitle || 'N/A'
    },
    {
      field: 'seatNumbers',
      headerName: 'Ghế',
      width: 150,
      valueGetter: (value, row) => row.seatNumbers?.join(', ') || 'N/A'
    },
    {
      field: 'totalPrice',
      headerName: 'Tổng tiền',
      width: 150,
      valueGetter: (value, row) => formatCurrency(row.totalPrice || 0)
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 150,
      renderCell: (params) => getStatusChip(params.value)
    },
    {
      field: 'createdAt',
      headerName: 'Ngày tạo',
      width: 180,
      valueGetter: (value, row) => formatDateTime(row.createdAt)
    }
  ];

  const filterBookings = (bookings) => {
    if (!searchTerm) return bookings;
    
    return bookings.filter(booking => 
      booking.movieTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getBookingStats = () => {
    const allBookings = [...userBookings, ...guestBookings];
    const stats = {
      total: allBookings.length,
      confirmed: allBookings.filter(b => b.status === 'CONFIRMED').length,
      pending: allBookings.filter(b => b.status === 'PENDING').length,
      cancelled: allBookings.filter(b => b.status === 'CANCELLED').length,
      totalRevenue: allBookings
        .filter(b => b.status === 'CONFIRMED')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    };
    return stats;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = getBookingStats();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Quản lý Đặt Vé
        </Typography>
        <IconButton onClick={fetchBookings}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Debug Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Debug: User Bookings: {userBookings.length}, Guest Bookings: {guestBookings.length}, Loading: {loading.toString()}
      </Alert>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tổng đặt vé
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.confirmed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Đã xác nhận
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Chờ thanh toán
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {formatCurrency(stats.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Doanh thu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên phim, tên khách hàng, email, mã đặt vé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`Đặt vé của User (${userBookings.length})`} />
          <Tab label={`Đặt vé Guest (${guestBookings.length})`} />
        </Tabs>
      </Box>

      {/* Data Grid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            {activeTab === 0 ? (
              <DataGrid
                rows={filterBookings(userBookings)}
                columns={userBookingColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                getRowId={(row) => row.id || Math.random()}
                sx={{ border: 0 }}
              />
            ) : (
              <DataGrid
                rows={filterBookings(guestBookings)}
                columns={guestBookingColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                getRowId={(row) => row.id || Math.random()}
                sx={{ border: 0 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingsPage;
