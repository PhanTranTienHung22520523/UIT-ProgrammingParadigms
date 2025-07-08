import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  CssBaseline,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  LocationCity as CinemaIcon,
  Tv as ScreenIcon,
  EventSeat as SeatIcon,
  Schedule as ScheduleIcon,
  BookOnline as BookingIcon,
  Payment as PaymentIcon,
  People as UsersIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  CleaningServices as CleanupIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Quản lý Phim', icon: <MovieIcon />, path: '/movies' },
  { text: 'Quản lý Rạp', icon: <CinemaIcon />, path: '/cinemas' },
  { text: 'Phòng Chiếu', icon: <ScreenIcon />, path: '/screens' },
  { text: 'Quản lý Ghế', icon: <SeatIcon />, path: '/seats' },
  { text: 'Lịch Chiếu', icon: <ScheduleIcon />, path: '/showtimes' },
  { text: 'Đặt Vé', icon: <BookingIcon />, path: '/bookings' },
  { text: 'Thanh Toán', icon: <PaymentIcon />, path: '/payments' },
  { text: 'Người Dùng', icon: <UsersIcon />, path: '/users' },
  { text: 'Dọn Dẹp', icon: <CleanupIcon />, path: '/cleanup' },
];

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          🎬 Cinema Admin
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Hệ thống quản trị
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mb: 0.5,
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? 'inherit' : 'text.primary',
                minWidth: 40 
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
            {user?.fullName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Admin Panel'}
          </Typography>
          
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <AccountIcon />
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
