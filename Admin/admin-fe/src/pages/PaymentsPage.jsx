import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { apiService } from '../services/apiService';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching payments...');
      
      // Thử lấy từ API payments trước
      try {
        const paymentsResponse = await apiService.getAllPayments();
        console.log('Payments API response:', paymentsResponse);
        
        if (paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
          // Map dữ liệu từ PaymentDetailDTO từ backend
          const paymentsData = paymentsResponse.data.map(payment => ({
            id: payment.id,
            bookingId: payment.bookingId,
            userId: payment.userId || 'N/A',
            userEmail: payment.userEmail || payment.userName || 'N/A',
            amount: payment.amount || 0,
            paymentMethod: payment.paymentMethod || 'VNPAY',
            status: payment.status?.toLowerCase() || 'pending',
            transactionId: payment.transactionId || payment.vnpayTransactionId || payment.id || 'N/A',
            createdAt: payment.createdAt || payment.paymentTime,
            movieTitle: payment.movieTitle || 'N/A',
            showtime: payment.showtime || 'N/A',
            cinemaName: payment.cinemaName || 'N/A',
            screenName: payment.screenName || 'N/A',
            bankCode: payment.bankCode,
            cardType: payment.cardType,
            bookingType: payment.bookingType
          }));
          
          console.log('Processed payments from API:', paymentsData);
          setPayments(paymentsData);
          return;
        }
      } catch (paymentsError) {
        console.warn('Payments API failed, falling back to bookings:', paymentsError);
      }
      
      // Fallback: Lấy danh sách booking để có thông tin thanh toán
      const bookingsResponse = await apiService.getAllBookings();
      console.log('Bookings response for payments:', bookingsResponse);
      
      // Filter ra chỉ những booking có thông tin thanh toán
      const bookingsData = bookingsResponse.data || bookingsResponse || [];
      const paymentsData = bookingsData
        .filter(booking => booking.paymentInfo || booking.paymentStatus || booking.status === 'CONFIRMED')
        .map(booking => ({
          id: booking._id || booking.id,
          bookingId: booking._id || booking.id,
          userId: booking.userId,
          userEmail: booking.userEmail || booking.guestEmail || 'N/A',
          amount: booking.totalPrice || 0,
          paymentMethod: booking.paymentInfo?.method || booking.paymentMethod || 'VNPay',
          status: booking.paymentStatus || (booking.status === 'CONFIRMED' ? 'completed' : 'pending'),
          transactionId: booking.paymentInfo?.transactionId || booking.id || 'N/A',
          createdAt: booking.createdAt,
          movieTitle: booking.movieTitle,
          showtime: booking.showtime
        }));
      
      console.log('Processed payments data:', paymentsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Không thể tải danh sách thanh toán. Vui lòng thử lại.');
      
      // Set mock data for testing
      setPayments([
        {
          id: 'mock_payment_1',
          bookingId: 'booking_1',
          userId: 'user_1',
          userEmail: 'test@example.com',
          amount: 200000,
          paymentMethod: 'VNPay',
          status: 'completed',
          transactionId: 'TXN123456',
          createdAt: new Date().toISOString(),
          movieTitle: 'Avengers: Endgame'
        },
        {
          id: 'mock_payment_2',
          bookingId: 'booking_2',
          userId: 'user_2',
          userEmail: 'test2@example.com',
          amount: 180000,
          paymentMethod: 'VNPay',
          status: 'pending',
          transactionId: 'TXN123457',
          createdAt: new Date().toISOString(),
          movieTitle: 'Spider-Man'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'paid':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'paid':
        return <CheckCircleIcon fontSize="small" />;
      case 'failed':
      case 'error':
        return <ErrorIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      default:
        return <PaymentIcon fontSize="small" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.movieTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    const matchesMethod = !paymentMethodFilter || payment.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Thống kê
  const totalPayments = payments.length;
  const successfulPayments = payments.filter(p => ['completed', 'success', 'paid'].includes(p.status?.toLowerCase())).length;
  const pendingPayments = payments.filter(p => p.status?.toLowerCase() === 'pending').length;
  const totalRevenue = payments
    .filter(p => ['completed', 'success', 'paid'].includes(p.status?.toLowerCase()))
    .reduce((sum, p) => sum + p.amount, 0);

  const uniqueMethods = [...new Set(payments.map(p => p.paymentMethod).filter(Boolean))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Quản lý Thanh toán
        </Typography>
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchPayments} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Thống kê */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng giao dịch
              </Typography>
              <Typography variant="h4" component="div">
                {totalPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Thành công
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {successfulPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đang xử lý
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {pendingPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng doanh thu
              </Typography>
              <Typography variant="h5" component="div" color="primary.main">
                {formatCurrency(totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bộ lọc */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                placeholder="Email, mã giao dịch, phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3} width="20%">
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="completed">Hoàn thành</MenuItem>
                  <MenuItem value="success">Thành công</MenuItem>
                  <MenuItem value="paid">Đã thanh toán</MenuItem>
                  <MenuItem value="pending">Đang xử lý</MenuItem>
                  <MenuItem value="failed">Thất bại</MenuItem>
                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} width="20%">
              <FormControl fullWidth>
                <InputLabel>Phương thức</InputLabel>
                <Select
                  value={paymentMethodFilter}
                  label="Phương thức"
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {uniqueMethods.map(method => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPaymentMethodFilter('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bảng thanh toán */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách giao dịch ({filteredPayments.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Mã giao dịch</TableCell>
                  <TableCell>Email người dùng</TableCell>
                  <TableCell>Phim</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Phương thức</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thời gian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        Không có giao dịch nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {payment.transactionId}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.userEmail}</TableCell>
                      <TableCell>
                        {payment.movieTitle && (
                          <Typography variant="body2">
                            {payment.movieTitle}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.paymentMethod} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(payment.status)}
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(payment.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentsPage;
