import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Slide
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: { xs: 2, sm: 3 },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }
      }}
    >
      <Fade in={true} timeout={800}>
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '480px',
            position: 'relative',
            zIndex: 1,
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}
        >
          <Slide direction="down" in={true} timeout={600}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mb: 3,
                  boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(102, 126, 234, 0.7)',
                    },
                    '70%': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 0 10px rgba(102, 126, 234, 0)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                    }
                  }
                }}
              >
                <AdminPanelSettings 
                  sx={{ 
                    fontSize: 40, 
                    color: 'white'
                  }} 
                />
              </Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1
                }}
              >
                Cinema Admin
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Hệ thống quản trị rạp chiếu phim
              </Typography>
            </Box>
          </Slide>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              disabled={loading}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
                  }
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              disabled={loading}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: 'rgba(102, 126, 234, 0.5)',
                  color: 'white'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Đang đăng nhập...
                </Box>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Chỉ dành cho Admin và Manager
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ mb: 2, fontWeight: 500 }}>
              Liên hệ IT để được cấp tài khoản
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main' 
                }} 
              />
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.light' 
                }} 
              />
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main' 
                }} 
              />
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default LoginPage;
