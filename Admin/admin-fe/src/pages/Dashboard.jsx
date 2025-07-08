import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Movie as MovieIcon,
  LocationCity as CinemaIcon,
  EventSeat as SeatIcon,
  People as UsersIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  TrendingUp
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../services/apiService';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getSystemStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Không thể tải thống kê hệ thống. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: `${color}.light`,
              color: `${color}.dark`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <IconButton color="inherit" size="small" onClick={fetchStats}>
            <RefreshIcon />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  const bookingData = stats ? [
    { name: 'Chờ thanh toán', value: stats.pendingBookings, color: '#ff9800' },
    { name: 'Đã xác nhận', value: stats.confirmedBookings, color: '#4caf50' }
  ] : [];

  const systemData = stats ? [
    { name: 'Phim', value: stats.totalMovies },
    { name: 'Rạp', value: stats.totalCinemas },
    { name: 'Phòng chiếu', value: stats.totalScreens },
    { name: 'Ghế', value: stats.totalSeats }
  ] : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label="Dữ liệu thời gian thực" 
            size="small" 
            color="success" 
            variant="outlined"
          />
          <IconButton onClick={fetchStats} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Tổng số phim"
            value={stats?.totalMovies || 0}
            icon={<MovieIcon sx={{ fontSize: 30 }} />}
            color="primary"
            subtitle="Phim đang chiếu"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Rạp chiếu phim"
            value={stats?.totalCinemas || 0}
            icon={<CinemaIcon sx={{ fontSize: 30 }} />}
            color="secondary"
            subtitle={`${stats?.totalScreens || 0} phòng chiếu`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Tổng số ghế"
            value={stats?.totalSeats || 0}
            icon={<SeatIcon sx={{ fontSize: 30 }} />}
            color="info"
            subtitle="Tất cả phòng chiếu"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Người dùng"
            value={stats?.totalUsers || 0}
            icon={<UsersIcon sx={{ fontSize: 30 }} />}
            color="warning"
            subtitle="Đã đăng ký"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Đặt vé chờ"
            value={stats?.pendingBookings || 0}
            icon={<BookingIcon sx={{ fontSize: 30 }} />}
            color="error"
            subtitle="Cần xử lý"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Doanh thu"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<MoneyIcon sx={{ fontSize: 30 }} />}
            color="success"
            subtitle="Tổng cộng"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê hệ thống
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={systemData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tình trạng đặt vé
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin hệ thống
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="primary.main" fontWeight="bold">
                      {stats?.totalShowTimes || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Suất chiếu
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="success.main" fontWeight="bold">
                      {stats?.confirmedBookings || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Vé đã bán
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="warning.main" fontWeight="bold">
                      {((stats?.confirmedBookings || 0) / (stats?.totalSeats || 1) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tỷ lệ lấp đầy
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="info.main" fontWeight="bold">
                      {formatCurrency((stats?.totalRevenue || 0) / (stats?.confirmedBookings || 1))}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Giá vé TB
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
