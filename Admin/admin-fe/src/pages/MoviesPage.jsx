import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { movieAPI } from '../services/apiService';
import { formatDate } from '../utils/helpers';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, movie: null });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Filter states
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAgeRating, setSelectedAgeRating] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    director: '',
    actors: '',
    genre: '',
    duration: '',
    language: '',
    country: '',
    releaseDate: '',
    posterUrl: '',
    trailerUrl: '',
    ageRating: '',
    rating: 0
  });

  const genres = [
    'Hành động', 'Phiêu lưu', 'Hài', 'Drama', 'Kinh dị', 'Lãng mạn', 
    'Khoa học viễn tưởng', 'Thriller', 'Hoạt hình', 'Tài liệu', 'Gia đình'
  ];

  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'T13', 'T16', 'T18'];

  const sortOptions = [
    { value: 'title', label: 'Tên phim' },
    { value: 'releaseDate', label: 'Ngày phát hành' },
    { value: 'genre', label: 'Thể loại' },
    { value: 'duration', label: 'Thời lượng' },
    { value: 'rating', label: 'Đánh giá' }
  ];

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await movieAPI.getAll();
      setMovies(response.data);
      applyFilters(response.data);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect để apply filter khi filter thay đổi
  useEffect(() => {
    if (movies.length > 0) {
      applyFilters(movies);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, selectedAgeRating, sortBy, movies]);

  // Hàm apply filters và sort
  const applyFilters = (moviesList) => {
    let filtered = [...moviesList];

    // Filter theo genre
    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre === selectedGenre);
    }

    // Filter theo age rating
    if (selectedAgeRating) {
      filtered = filtered.filter(movie => movie.ageRating === selectedAgeRating);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'releaseDate':
          return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        case 'genre':
          return (a.genre || '').localeCompare(b.genre || '');
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredMovies(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedAgeRating('');
    setSortBy('title');
  };

  const handleOpenDialog = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setMovieForm({
        title: movie.title || '',
        description: movie.description || '',
        director: movie.director || '',
        actors: movie.actors?.join(', ') || '',
        genre: movie.genre || '',
        duration: movie.duration || '',
        language: movie.language || '',
        country: movie.country || '',
        releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
        posterUrl: movie.posterUrl || '',
        trailerUrl: movie.trailerUrl || '',
        ageRating: movie.ageRating || '',
        rating: movie.rating || 0
      });
    } else {
      setEditingMovie(null);
      setMovieForm({
        title: '',
        description: '',
        director: '',
        actors: '',
        genre: '',
        duration: '',
        language: '',
        country: '',
        releaseDate: '',
        posterUrl: '',
        trailerUrl: '',
        ageRating: '',
        rating: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMovie(null);
  };

  const handleSubmit = async () => {
    try {
      const movieData = {
        ...movieForm,
        actors: movieForm.actors.split(',').map(actor => actor.trim()).filter(actor => actor),
        duration: parseInt(movieForm.duration),
        rating: parseFloat(movieForm.rating)
      };

      if (editingMovie) {
        await movieAPI.update(editingMovie.id, movieData);
      } else {
        await movieAPI.create(movieData);
      }

      handleCloseDialog();
      fetchMovies();
    } catch (err) {
      console.error('Error saving movie:', err);
      setError('Không thể lưu thông tin phim');
    }
  };

  const handleDelete = async (movieId) => {
    try {
      await movieAPI.delete(movieId);
      setDeleteDialog({ open: false, movie: null });
      fetchMovies();
    } catch (err) {
      console.error('Error deleting movie:', err);
      setError('Không thể xóa phim');
    }
  };

  const columns = [
    {
      field: 'posterUrl',
      headerName: 'Poster',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <img
              src={params.value}
              alt=""
              style={{
                width: 40,
                height: 60,
                objectFit: 'cover',
                borderRadius: 4
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 60,
                bgcolor: 'grey.200',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption">No Image</Typography>
            </Box>
          )}
        </Box>
      )
    },
    { field: 'title', headerName: 'Tên phim', width: 200 },
    { field: 'director', headerName: 'Đạo diễn', width: 150 },
    { field: 'genre', headerName: 'Thể loại', width: 120 },
    { 
      field: 'duration', 
      headerName: 'Thời lượng', 
      width: 100,
      renderCell: (params) => `${params.value} phút`
    },
    { field: 'language', headerName: 'Ngôn ngữ', width: 100 },
    {
      field: 'releaseDate',
      headerName: 'Ngày phát hành',
      width: 120,
      renderCell: (params) => formatDate(params.value)
    },
    {
      field: 'ageRating',
      headerName: 'Độ tuổi',
      width: 80,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color="primary" />
      )
    },
    {
      field: 'rating',
      headerName: 'Đánh giá',
      width: 80,
      renderCell: (params) => `${params.value}/10`
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => setDeleteDialog({ open: true, movie: params.row })}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Quản lý Phim
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
          >
            Lưới
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
          >
            Bảng
          </Button>
          <IconButton onClick={fetchMovies}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filter Panel */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Lọc và Sắp xếp Phim
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3} width='20%'>
            <FormControl fullWidth size="small">
              <InputLabel>Thể loại</InputLabel>
              <Select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                label="Thể loại"
              >
                <MenuItem value="">Tất cả thể loại</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} width='15%'>
            <FormControl fullWidth size="small">
              <InputLabel>Độ tuổi</InputLabel>
              <Select
                value={selectedAgeRating}
                onChange={(e) => setSelectedAgeRating(e.target.value)}
                label="Độ tuổi"
              >
                <MenuItem value="">Tất cả độ tuổi</MenuItem>
                {ageRatings.map((rating) => (
                  <MenuItem key={rating} value={rating}>
                    {rating}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sắp xếp theo"
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
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
          
          <Grid item xs={12} md={1}>
            <Chip 
              label={`${filteredMovies.length} phim`}
              color="info" 
              size="small"
            />
          </Grid>
        </Grid>
        
        {/* Filter chips */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedGenre && (
            <Chip 
              label={`Thể loại: ${selectedGenre}`}
              color="primary" 
              size="small"
              onDelete={() => setSelectedGenre('')}
            />
          )}
          {selectedAgeRating && (
            <Chip 
              label={`Độ tuổi: ${selectedAgeRating}`}
              color="secondary" 
              size="small"
              onDelete={() => setSelectedAgeRating('')}
            />
          )}
          {sortBy !== 'title' && (
            <Chip 
              label={`Sắp xếp: ${sortOptions.find(opt => opt.value === sortBy)?.label}`}
              color="default" 
              size="small"
            />
          )}
        </Box>
      </Card>

      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredMovies.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
              <Card sx={{ 
                height: '520px',
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <CardMedia
                  component="img"
                  height="280"
                  image={movie.posterUrl || '/placeholder-movie.jpg'}
                  alt={movie.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ 
                  height: '180px',
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '16px'
                }}>
                  <Typography gutterBottom variant="h6" component="div" 
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '48px',
                      lineHeight: '24px',
                      fontSize: '1.1rem',
                      marginBottom: '8px'
                    }}
                  >
                    {movie.title}
                  </Typography>
                  <Box sx={{ height: '84px', overflow: 'hidden' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                      Đạo diễn: {movie.director}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                      Thể loại: {movie.genre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                      Thời lượng: {movie.duration} phút
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    height: '32px',
                    marginTop: 'auto'
                  }}>
                    <Chip size="small" label={movie.ageRating} color="primary" />
                    <Typography variant="body2" fontWeight="bold">
                      {movie.rating}/10
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ 
                  height: '60px',
                  padding: '8px 16px',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <IconButton size="small" onClick={() => handleOpenDialog(movie)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, movie })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <DataGrid
            rows={filteredMovies}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
            sx={{ border: 0 }}
          />
        </Card>
      )}

      {/* Add Movie FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Movie Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên phim"
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Đạo diễn"
                value={movieForm.director}
                onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diễn viên (cách nhau bằng dấu phẩy)"
                value={movieForm.actors}
                onChange={(e) => setMovieForm({ ...movieForm, actors: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Thể loại</InputLabel>
                <Select
                  value={movieForm.genre}
                  onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thời lượng (phút)"
                type="number"
                value={movieForm.duration}
                onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngôn ngữ"
                value={movieForm.language}
                onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quốc gia"
                value={movieForm.country}
                onChange={(e) => setMovieForm({ ...movieForm, country: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày phát hành"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={movieForm.releaseDate}
                onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Độ tuổi</InputLabel>
                <Select
                  value={movieForm.ageRating}
                  onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value })}
                >
                  {ageRatings.map((rating) => (
                    <MenuItem key={rating} value={rating}>
                      {rating}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL Poster"
                value={movieForm.posterUrl}
                onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL Trailer"
                value={movieForm.trailerUrl}
                onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMovie ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, movie: null })}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa phim "{deleteDialog.movie?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, movie: null })}>
            Hủy
          </Button>
          <Button 
            onClick={() => handleDelete(deleteDialog.movie?.id)} 
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MoviesPage;
