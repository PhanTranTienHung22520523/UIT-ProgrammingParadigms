import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  CleaningServices as CleanIcon,
  BookOnline as BookingIcon,
  People as PeopleIcon,
  EventSeat as SeatIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { adminAPI } from '../services/apiService';

const CleanupPage = () => {
  const [loading, setLoading] = useState({
    userBookings: false,
    guestBookings: false,
    seats: false
  });
  const [results, setResults] = useState({
    userBookings: null,
    guestBookings: null,
    seats: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '',
    title: '',
    message: ''
  });

  const cleanupActions = [
    {
      id: 'userBookings',
      title: 'Dọn dẹp User Bookings hết hạn',
      description: 'Xóa các booking của người dùng đã đăng ký mà đã hết hạn thanh toán',
      icon: <BookingIcon />,
      color: 'primary',
      action: adminAPI.cleanupExpiredBookings
    },
    {
      id: 'guestBookings',
      title: 'Dọn dẹp Guest Bookings hết hạn',
      description: 'Xóa các booking của khách hàng vãng lai đã hết hạn thanh toán',
      icon: <PeopleIcon />,
      color: 'secondary',
      action: adminAPI.cleanupExpiredGuestBookings
    },
    {
      id: 'seats',
      title: 'Dọn dẹp Seat Reservations hết hạn',
      description: 'Giải phóng các ghế đã được đặt trước nhưng chưa thanh toán',
      icon: <SeatIcon />,
      color: 'warning',
      action: adminAPI.cleanupExpiredSeats
    }
  ];

  const handleCleanup = async (type) => {
    const action = cleanupActions.find(a => a.id === type);
    
    setConfirmDialog({
      open: true,
      type,
      title: `Xác nhận ${action.title}`,
      message: `Bạn có chắc chắn muốn thực hiện: ${action.description}?`
    });
  };

  const executeCleanup = async (type) => {
    const action = cleanupActions.find(a => a.id === type);
    
    try {
      setLoading({ ...loading, [type]: true });
      const response = await action.action();
      
      setResults({
        ...results,
        [type]: {
          success: true,
          message: response.data || 'Dọn dẹp thành công',
          timestamp: new Date().toLocaleString('vi-VN')
        }
      });
    } catch (err) {
      console.error(`Error cleaning up ${type}:`, err);
      setResults({
        ...results,
        [type]: {
          success: false,
          message: err.response?.data || 'Có lỗi xảy ra khi dọn dẹp',
          timestamp: new Date().toLocaleString('vi-VN')
        }
      });
    } finally {
      setLoading({ ...loading, [type]: false });
      setConfirmDialog({ open: false, type: '', title: '', message: '' });
    }
  };

  const handleCleanupAll = () => {
    setConfirmDialog({
      open: true,
      type: 'all',
      title: 'Dọn dẹp toàn bộ hệ thống',
      message: 'Bạn có chắc chắn muốn dọn dẹp tất cả dữ liệu hết hạn trong hệ thống? Thao tác này sẽ thực hiện tuần tự từng loại dữ liệu.'
    });
  };

  const executeCleanupAll = async () => {
    setConfirmDialog({ open: false, type: '', title: '', message: '' });
    
    for (const action of cleanupActions) {
      await executeCleanup(action.id);
      // Add small delay between actions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Dọn dẹp hệ thống
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<CleanIcon />}
          onClick={handleCleanupAll}
          size="large"
        >
          Dọn dẹp tất cả
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          Thông tin quan trọng:
        </Typography>
        <Typography variant="body2">
          • Dọn dẹp sẽ xóa vĩnh viễn các dữ liệu hết hạn khỏi hệ thống
        </Typography>
        <Typography variant="body2">
          • Thao tác này không thể hoàn tác
        </Typography>
        <Typography variant="body2">
          • Nên thực hiện định kỳ để tối ưu hiệu suất hệ thống
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {cleanupActions.map((action) => (
          <Grid item xs={12} md={4} key={action.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: `${action.color}.light`,
                      color: `${action.color}.dark`,
                      mr: 2
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {action.title}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {action.description}
                </Typography>

                {results[action.id] && (
                  <Alert 
                    severity={results[action.id].success ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2">
                      {results[action.id].message}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {results[action.id].timestamp}
                    </Typography>
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  color={action.color}
                  onClick={() => handleCleanup(action.id)}
                  disabled={loading[action.id]}
                  startIcon={loading[action.id] ? <CircularProgress size={20} /> : <CleanIcon />}
                >
                  {loading[action.id] ? 'Đang dọn dẹp...' : 'Thực hiện'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* System Status */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Trạng thái hệ thống
        </Typography>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Lịch sử dọn dẹp gần đây
                </Typography>
                <List>
                  {Object.entries(results).map(([key, result]) => {
                    if (!result) return null;
                    
                    const action = cleanupActions.find(a => a.id === key);
                    return (
                      <ListItem key={key}>
                        <ListItemIcon>
                          {result.success ? (
                            <SuccessIcon color="success" />
                          ) : (
                            <WarningIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={action.title}
                          secondary={`${result.message} - ${result.timestamp}`}
                        />
                      </ListItem>
                    );
                  })}
                  {Object.values(results).every(r => !r) && (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      Chưa có lịch sử dọn dẹp nào trong phiên này
                    </Typography>
                  )}
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Khuyến nghị
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    label="Dọn dẹp hàng ngày vào lúc ít người dùng"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Theo dõi logs để phát hiện lỗi"
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    label="Backup dữ liệu trước khi dọn dẹp"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', title: '', message: '' })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, type: '', title: '', message: '' })}
          >
            Hủy
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.type === 'all') {
                executeCleanupAll();
              } else {
                executeCleanup(confirmDialog.type);
              }
            }}
            color="error"
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CleanupPage;
