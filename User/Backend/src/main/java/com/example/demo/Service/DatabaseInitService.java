package com.example.demo.Service;

import com.example.demo.Model.*;
import com.example.demo.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

@Service
public class DatabaseInitService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowTimeRepository showTimeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Cấu hình từ application.properties
    @Value("${app.database.force-init:false}")
    private boolean forceInit;

    @Value("${app.database.init-mode:auto}")
    private String initMode;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Database Initialization Check ===");
        System.out.println("Force init: " + forceInit);
        System.out.println("Init mode: " + initMode);

        long userCount = userRepository.count();
        long movieCount = movieRepository.count();
        long cinemaCount = cinemaRepository.count();

        System.out.println("Current data count:");
        System.out.println("- Users: " + userCount);
        System.out.println("- Movies: " + movieCount);
        System.out.println("- Cinemas: " + cinemaCount);

        if (shouldInitializeDatabase(userCount, movieCount, cinemaCount)) {
            initializeDatabase();
        } else {
            System.out.println("Database already has data. Skipping initialization.");
            System.out.println("To force initialization, set app.database.force-init=true in application.properties");
        }
    }

    private boolean shouldInitializeDatabase(long userCount, long movieCount, long cinemaCount) {
        switch (initMode.toLowerCase()) {
            case "always":
                return true;
            case "never":
                return false;
            case "force":
                return forceInit;
            case "auto":
            default:
                // Chỉ khởi tạo nếu database trống HOẶC được force
                return (userCount == 0 && movieCount == 0 && cinemaCount == 0) || forceInit;
        }
    }

    private void initializeDatabase() {
        System.out.println("=== Starting Database Initialization ===");

        if (forceInit) {
            System.out.println("Force mode: Clearing existing data...");
            clearExistingData();
        }

        // 1. Create Users
        System.out.println("Creating users...");
        createUsers();

        // 2. Create Cinemas
        System.out.println("Creating cinemas...");
        List<Cinema> cinemas = createCinemas();

        // 3. Create Movies
        System.out.println("Creating movies...");
        List<Movie> movies = createMovies();

        // 4. Create Screens for each Cinema
        System.out.println("Creating screens...");
        List<Screen> screens = createScreens(cinemas);

        // 5. Create Seats for each Screen
        System.out.println("Creating seats...");
        createSeats(screens);

        // 6. Create ShowTimes
        System.out.println("Creating showtimes...");
        createShowTimes(movies, screens);

        System.out.println("=== Database initialized successfully! ===");
        printDataSummary();
    }

    private void clearExistingData() {
        System.out.println("Clearing existing data...");
        showTimeRepository.deleteAll();
        seatRepository.deleteAll();
        screenRepository.deleteAll();
        movieRepository.deleteAll();
        cinemaRepository.deleteAll();
        userRepository.deleteAll();
        System.out.println("Existing data cleared.");
    }

    private void printDataSummary() {
        System.out.println("\n=== DATA SUMMARY ===");
        System.out.println("Users created: " + userRepository.count());
        System.out.println("Cinemas created: " + cinemaRepository.count());
        System.out.println("Movies created: " + movieRepository.count());
        System.out.println("Screens created: " + screenRepository.count());
        System.out.println("Seats created: " + seatRepository.count());
        System.out.println("ShowTimes created: " + showTimeRepository.count());
        System.out.println("===================\n");
    }

    private void createUsers() {
        // Admin user
        User admin = new User();
        admin.setEmail("admin@cinema.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Administrator");
        admin.setPhoneNumber("0123456789");
        admin.setRole(User.Role.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        userRepository.save(admin);

        // Manager user
        User manager = new User();
        manager.setEmail("manager@cinema.com");
        manager.setPassword(passwordEncoder.encode("manager123"));
        manager.setFullName("Cinema Manager");
        manager.setPhoneNumber("0987654321");
        manager.setRole(User.Role.MANAGER);
        manager.setCreatedAt(LocalDateTime.now());
        manager.setUpdatedAt(LocalDateTime.now());
        userRepository.save(manager);

        // Customer users
        for (int i = 1; i <= 5; i++) {
            User customer = new User();
            customer.setEmail("customer" + i + "@gmail.com");
            customer.setPassword(passwordEncoder.encode("password123"));
            customer.setFullName("Customer " + i);
            customer.setPhoneNumber("090000000" + i);
            customer.setRole(User.Role.CUSTOMER);
            customer.setDateOfBirth(LocalDate.of(1990 + i, i, 15));
            customer.setCreatedAt(LocalDateTime.now());
            customer.setUpdatedAt(LocalDateTime.now());
            userRepository.save(customer);
        }
    }

    private List<Cinema> createCinemas() {
        List<Cinema> cinemas = new ArrayList<>();

        Cinema cinema1 = new Cinema();
        cinema1.setName("CGV Vincom");
        cinema1.setAddress("191 Ba Trieu Street");
        cinema1.setCity("Ha Noi");
        cinema1.setDistrict("Hai Ba Trung");
        cinema1.setPhoneNumber("024-3974-3333");
        cinema1.setDescription("Modern cinema with latest technology");
        cinema1.setAmenities(Arrays.asList("3D", "IMAX", "Dolby Atmos", "VIP Seats"));
        cinema1.setCreatedAt(LocalDateTime.now());
        cinema1.setUpdatedAt(LocalDateTime.now());
        cinemas.add(cinemaRepository.save(cinema1));

        Cinema cinema2 = new Cinema();
        cinema2.setName("Galaxy Cinema");
        cinema2.setAddress("116 Nguyen Du Street");
        cinema2.setCity("Ho Chi Minh");
        cinema2.setDistrict("District 1");
        cinema2.setPhoneNumber("028-3822-5555");
        cinema2.setDescription("Premium cinema experience");
        cinema2.setAmenities(Arrays.asList("4DX", "Premium Seats", "Dolby Vision"));
        cinema2.setCreatedAt(LocalDateTime.now());
        cinema2.setUpdatedAt(LocalDateTime.now());
        cinemas.add(cinemaRepository.save(cinema2));

        Cinema cinema3 = new Cinema();
        cinema3.setName("Lotte Cinema");
        cinema3.setAddress("54 Lieu Giai Street");
        cinema3.setCity("Ha Noi");
        cinema3.setDistrict("Ba Dinh");
        cinema3.setPhoneNumber("024-3771-7777");
        cinema3.setDescription("Luxury cinema complex");
        cinema3.setAmenities(Arrays.asList("IMAX", "VIP", "Gold Class"));
        cinema3.setCreatedAt(LocalDateTime.now());
        cinema3.setUpdatedAt(LocalDateTime.now());
        cinemas.add(cinemaRepository.save(cinema3));

        return cinemas;
    }

    private List<Movie> createMovies() {
        List<Movie> movies = new ArrayList<>();

        Movie movie1 = new Movie();
        movie1.setTitle("Avatar: The Way of Water");
        movie1.setDescription("Jake Sully lives with his newfound family formed on the planet of Pandora.");
        movie1.setDirector("James Cameron");
        movie1.setActors(Arrays.asList("Sam Worthington", "Zoe Saldana", "Sigourney Weaver"));
        movie1.setGenre("Science Fiction");
        movie1.setDuration(192);
        movie1.setLanguage("English");
        movie1.setCountry("USA");
        movie1.setReleaseDate(LocalDate.of(2022, 12, 16));
        movie1.setAgeRating("T13");
        movie1.setRating(4.5);
        movie1.setPosterUrl("https://example.com/avatar2-poster.jpg");
        movie1.setTrailerUrl("https://example.com/avatar2-trailer.mp4");
        movie1.setCreatedAt(LocalDateTime.now());
        movie1.setUpdatedAt(LocalDateTime.now());
        movies.add(movieRepository.save(movie1));

        Movie movie2 = new Movie();
        movie2.setTitle("Top Gun: Maverick");
        movie2.setDescription("After thirty years, Maverick is still pushing the envelope as a top naval aviator.");
        movie2.setDirector("Joseph Kosinski");
        movie2.setActors(Arrays.asList("Tom Cruise", "Miles Teller", "Jennifer Connelly"));
        movie2.setGenre("Action");
        movie2.setDuration(131);
        movie2.setLanguage("English");
        movie2.setCountry("USA");
        movie2.setReleaseDate(LocalDate.of(2022, 5, 27));
        movie2.setAgeRating("T13");
        movie2.setRating(4.7);
        movie2.setPosterUrl("https://example.com/topgun-poster.jpg");
        movie2.setTrailerUrl("https://example.com/topgun-trailer.mp4");
        movie2.setCreatedAt(LocalDateTime.now());
        movie2.setUpdatedAt(LocalDateTime.now());
        movies.add(movieRepository.save(movie2));

        Movie movie3 = new Movie();
        movie3.setTitle("Black Panther: Wakanda Forever");
        movie3.setDescription("The people of Wakanda fight to protect their home from intervening world powers.");
        movie3.setDirector("Ryan Coogler");
        movie3.setActors(Arrays.asList("Letitia Wright", "Lupita Nyong'o", "Danai Gurira"));
        movie3.setGenre("Action");
        movie3.setDuration(161);
        movie3.setLanguage("English");
        movie3.setCountry("USA");
        movie3.setReleaseDate(LocalDate.of(2022, 11, 11));
        movie3.setAgeRating("T13");
        movie3.setRating(4.2);
        movie3.setPosterUrl("https://example.com/blackpanther-poster.jpg");
        movie3.setTrailerUrl("https://example.com/blackpanther-trailer.mp4");
        movie3.setCreatedAt(LocalDateTime.now());
        movie3.setUpdatedAt(LocalDateTime.now());
        movies.add(movieRepository.save(movie3));

        return movies;
    }

    private List<Screen> createScreens(List<Cinema> cinemas) {
        List<Screen> screens = new ArrayList<>();

        for (Cinema cinema : cinemas) {
            // Screen 1 - 2D
            Screen screen1 = new Screen();
            screen1.setName("Screen 1");
            screen1.setCinemaId(cinema.getId());
            screen1.setTotalSeats(100);
            screen1.setScreenType("2D");
            screen1.setCreatedAt(LocalDateTime.now());
            screen1.setUpdatedAt(LocalDateTime.now());
            screens.add(screenRepository.save(screen1));

            // Screen 2 - 3D
            Screen screen2 = new Screen();
            screen2.setName("Screen 2");
            screen2.setCinemaId(cinema.getId());
            screen2.setTotalSeats(80);
            screen2.setScreenType("3D");
            screen2.setCreatedAt(LocalDateTime.now());
            screen2.setUpdatedAt(LocalDateTime.now());
            screens.add(screenRepository.save(screen2));

            // Screen 3 - IMAX
            Screen screen3 = new Screen();
            screen3.setName("Screen 3");
            screen3.setCinemaId(cinema.getId());
            screen3.setTotalSeats(120);
            screen3.setScreenType("IMAX");
            screen3.setCreatedAt(LocalDateTime.now());
            screen3.setUpdatedAt(LocalDateTime.now());
            screens.add(screenRepository.save(screen3));
        }

        return screens;
    }

    private void createSeats(List<Screen> screens) {
        for (Screen screen : screens) {
            List<Seat> seats = new ArrayList<>();

            // Generate seats based on screen type
            int rows = getRowsForScreenType(screen.getScreenType());
            int seatsPerRow = screen.getTotalSeats() / rows;

            for (int row = 0; row < rows; row++) {
                char rowLetter = (char) ('A' + row);
                for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                    Seat seat = new Seat();
                    seat.setScreenId(screen.getId());
                    seat.setSeatNumber(rowLetter + String.valueOf(seatNum));
                    seat.setRow(row + 1);
                    seat.setColumn(seatNum);

                    // Set seat type and price based on position
                    if (row < 2) {
                        seat.setSeatType("STANDARD");
                        seat.setPrice(80000); // 80k VND
                    } else if (row >= rows - 2) {
                        seat.setSeatType("VIP");
                        seat.setPrice(150000); // 150k VND
                    } else {
                        seat.setSeatType("STANDARD");
                        seat.setPrice(100000); // 100k VND
                    }

                    seats.add(seat);
                }
            }

            seatRepository.saveAll(seats);

            // Update screen with seats
            screen.setSeats(seats);
            screenRepository.save(screen);
        }
    }

    private int getRowsForScreenType(String screenType) {
        switch (screenType) {
            case "2D": return 10;
            case "3D": return 8;
            case "IMAX": return 12;
            default: return 10;
        }
    }

    private void createShowTimes(List<Movie> movies, List<Screen> screens) {
        LocalDateTime baseTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);

        for (Movie movie : movies) {
            for (Screen screen : screens) {
                // Create 4 showtimes per day for next 7 days
                for (int day = 0; day < 7; day++) {
                    LocalDateTime[] showTimes = {
                        baseTime.plusDays(day).withHour(10).withMinute(0),
                        baseTime.plusDays(day).withHour(14).withMinute(30),
                        baseTime.plusDays(day).withHour(18).withMinute(0),
                        baseTime.plusDays(day).withHour(21).withMinute(30)
                    };

                    for (LocalDateTime startTime : showTimes) {
                        ShowTime showTime = new ShowTime();
                        showTime.setMovieId(movie.getId());
                        showTime.setScreenId(screen.getId());
                        showTime.setCinemaId(screen.getCinemaId());
                        showTime.setStartTime(startTime);
                        showTime.setEndTime(startTime.plusMinutes(movie.getDuration() + 30)); // +30 mins for ads/cleanup
                        showTime.setBasePrice(getBasePriceForScreenType(screen.getScreenType()));
                        showTime.setBookedSeats(new ArrayList<>());
                        showTime.setCreatedAt(LocalDateTime.now());
                        showTime.setUpdatedAt(LocalDateTime.now());

                        showTimeRepository.save(showTime);
                    }
                }
            }
        }
    }

    private double getBasePriceForScreenType(String screenType) {
        switch (screenType) {
            case "2D": return 80000;
            case "3D": return 120000;
            case "IMAX": return 180000;
            default: return 100000;
        }
    }
}
