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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { apiService } from '../services/apiService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy danh sách người dùng từ API
      const response = await apiService.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      
      // Nếu API users chưa có, tạo mock data cơ bản
      const mockUsers = [
        {
          _id: 'admin_default',
          fullName: 'Admin System',
          email: 'admin@cinema.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          _id: 'user_demo',
          fullName: 'Demo User',
          email: 'user@demo.com',
          role: 'CUSTOMER',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ];
      
      setUsers(mockUsers);
      setError('Không thể kết nối đến API users. Hiển thị dữ liệu demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    if (user) {
      setUserForm({
        fullName: user.fullName,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setUserForm({
        fullName: '',
        email: '',
        password: '',
        role: 'CUSTOMER'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setUserForm({
      fullName: '',
      email: '',
      password: '',
      role: 'CUSTOMER'
    });
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Cập nhật người dùng
        await apiService.updateUser(selectedUser._id, userForm);
      } else {
        // Tạo mới người dùng
        await apiService.createUser(userForm);
      }
      
      await fetchUsers();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(selectedUser ? 'Không thể cập nhật người dùng.' : 'Không thể tạo người dùng mới.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await apiService.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Không thể xóa người dùng.');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'error';
      case 'MANAGER':
        return 'warning';
      case 'CUSTOMER':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
      case 'MANAGER':
        return <AdminIcon fontSize="small" />;
      case 'CUSTOMER':
        return <UserIcon fontSize="small" />;
      default:
        return <UserIcon fontSize="small" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'MANAGER':
        return 'Quản lý';
      case 'CUSTOMER':
        return 'Khách hàng';
      default:
        return 'Không xác định';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role?.toUpperCase() === roleFilter.toUpperCase();
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Thống kê
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role?.toUpperCase() === 'ADMIN').length;
  const regularUsers = users.filter(u => u.role?.toUpperCase() === 'CUSTOMER').length;
  const managerUsers = users.filter(u => u.role?.toUpperCase() === 'MANAGER').length;

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
          Quản lý Người dùng
        </Typography>
        <Box>
          <Tooltip title="Làm mới">
            <IconButton onClick={fetchUsers} color="primary" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm người dùng
          </Button>
        </Box>
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
                Tổng người dùng
              </Typography>
              <Typography variant="h4" component="div">
                {totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Quản trị viên
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                {adminUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Quản lý
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {managerUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Khách hàng
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {regularUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
      </Grid>

      {/* Bộ lọc */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                placeholder="Tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4} width="20%">
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={roleFilter}
                  label="Vai trò"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                  <MenuItem value="MANAGER">Quản lý</MenuItem>
                  <MenuItem value="CUSTOMER">Khách hàng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bảng người dùng */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách người dùng ({filteredUsers.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Đăng nhập cuối</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        Không có người dùng nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {user.fullName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {user.fullName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1, color: 'action.active', fontSize: 'small' }} />
                          {user.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(user)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user.role?.toUpperCase() !== 'ADMIN' && (
                          <Tooltip title="Xóa">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteUser(user._id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog thêm/sửa người dùng */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={userForm.fullName}
                onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={selectedUser ? "Mật khẩu mới (để trống nếu không thay đổi)" : "Mật khẩu"}
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required={!selectedUser}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={userForm.role}
                  label="Vai trò"
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <MenuItem value="CUSTOMER">Khách hàng</MenuItem>
                  <MenuItem value="MANAGER">Quản lý</MenuItem>
                  <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={!userForm.fullName || !userForm.email || (!selectedUser && !userForm.password)}
          >
            {selectedUser ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
