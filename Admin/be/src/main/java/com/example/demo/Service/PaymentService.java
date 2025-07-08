package com.example.demo.Service;

import com.example.demo.Model.Payment;
import com.example.demo.Model.Booking;
import com.example.demo.Model.GuestBooking;
import com.example.demo.Model.User;
import com.example.demo.Model.Movie;
import com.example.demo.Model.Screen;
import com.example.demo.Model.Cinema;
import com.example.demo.Model.ShowTime;
import com.example.demo.Repository.PaymentRepository;
import com.example.demo.Repository.BookingRepository;
import com.example.demo.Repository.GuestBookingRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.Repository.MovieRepository;
import com.example.demo.Repository.ScreenRepository;
import com.example.demo.Repository.CinemaRepository;
import com.example.demo.Repository.ShowTimeRepository;
import com.example.demo.DTO.PaymentDetailDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestBookingRepository guestBookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private ShowTimeRepository showTimeRepository;

    public Payment findById(String id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment findByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    public Payment createPayment(String bookingId, String userId, double amount, Payment.PaymentMethod method) {
        Payment payment = new Payment(bookingId, userId, amount, method);
        return paymentRepository.save(payment);
    }

    public Payment processVNPayCallback(Map<String, String> params) {
        String bookingId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionId = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");
        String cardType = params.get("vnp_CardType");

        Payment payment = findByBookingId(bookingId);
        if (payment == null) {
            // Tạo payment mới nếu chưa có
            var booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking != null) {
                payment = new Payment(bookingId, booking.getUserId(), booking.getTotalAmount(), Payment.PaymentMethod.VNPAY);
            }
        }

        if (payment != null) {
            payment.setVnpayTransactionId(transactionId);
            payment.setBankCode(bankCode);
            payment.setCardType(cardType);
            payment.setPaymentTime(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());

            if ("00".equals(responseCode)) {
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("VNPay error code: " + responseCode);
            }

            return paymentRepository.save(payment);
        }

        throw new RuntimeException("Không tìm thấy thông tin đặt vé");
    }

    public Payment processRefund(String paymentId, String reason) {
        Payment payment = findById(paymentId);
        if (payment == null) {
            throw new RuntimeException("Không tìm thấy thông tin thanh toán");
        }

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Chỉ có thể hoàn tiền cho giao dịch thành công");
        }

        // Tạo payment hoàn tiền
        Payment refundPayment = new Payment();
        refundPayment.setBookingId(payment.getBookingId());
        refundPayment.setUserId(payment.getUserId());
        refundPayment.setAmount(-payment.getAmount()); // Số âm cho hoàn tiền
        refundPayment.setPaymentMethod(payment.getPaymentMethod());
        refundPayment.setStatus(Payment.PaymentStatus.REFUNDED);
        refundPayment.setTransactionId("REFUND_" + payment.getTransactionId());
        refundPayment.setFailureReason(reason);
        refundPayment.setPaymentTime(LocalDateTime.now());
        refundPayment.setCreatedAt(LocalDateTime.now());
        refundPayment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(refundPayment);
    }

    public java.util.List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public List<PaymentDetailDTO> findAllWithDetails() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream().map(this::mapToPaymentDetailDTO).collect(Collectors.toList());
    }

    private PaymentDetailDTO mapToPaymentDetailDTO(Payment payment) {
        PaymentDetailDTO dto = new PaymentDetailDTO(payment);
        
        try {
            // Tìm booking để lấy thông tin chi tiết
            if (payment.getBookingId() != null) {
                // Thử tìm trong UserBooking trước
                var userBooking = bookingRepository.findById(payment.getBookingId()).orElse(null);
                if (userBooking != null) {
                    dto.setBookingType("USER");
                    
                    // Lấy thông tin user
                    if (userBooking.getUserId() != null) {
                        var user = userRepository.findById(userBooking.getUserId()).orElse(null);
                        if (user != null) {
                            dto.setUserEmail(user.getEmail());
                            dto.setUserName(user.getFullName());
                        }
                    }
                    
                    // Lấy thông tin movie từ showtime
                    if (userBooking.getShowTimeId() != null) {
                        var showtime = showTimeRepository.findById(userBooking.getShowTimeId()).orElse(null);
                        if (showtime != null) {
                            dto.setShowtime(showtime.getStartTime());
                            
                            // Lấy thông tin movie
                            if (showtime.getMovieId() != null) {
                                var movie = movieRepository.findById(showtime.getMovieId()).orElse(null);
                                if (movie != null) {
                                    dto.setMovieTitle(movie.getTitle());
                                }
                            }
                            
                            // Lấy thông tin screen và cinema
                            if (showtime.getScreenId() != null) {
                                var screen = screenRepository.findById(showtime.getScreenId()).orElse(null);
                                if (screen != null) {
                                    dto.setScreenName(screen.getName());
                                    
                                    if (screen.getCinemaId() != null) {
                                        var cinema = cinemaRepository.findById(screen.getCinemaId()).orElse(null);
                                        if (cinema != null) {
                                            dto.setCinemaName(cinema.getName());
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // Thử tìm trong GuestBooking
                    var guestBooking = guestBookingRepository.findById(payment.getBookingId()).orElse(null);
                    if (guestBooking != null) {
                        dto.setBookingType("GUEST");
                        dto.setUserEmail(guestBooking.getGuestEmail());
                        dto.setUserName(guestBooking.getGuestName());
                        
                        // Lấy thông tin movie từ showtime
                        if (guestBooking.getShowTimeId() != null) {
                            var showtime = showTimeRepository.findById(guestBooking.getShowTimeId()).orElse(null);
                            if (showtime != null) {
                                dto.setShowtime(showtime.getStartTime());
                                
                                // Lấy thông tin movie
                                if (showtime.getMovieId() != null) {
                                    var movie = movieRepository.findById(showtime.getMovieId()).orElse(null);
                                    if (movie != null) {
                                        dto.setMovieTitle(movie.getTitle());
                                    }
                                }
                                
                                // Lấy thông tin screen và cinema
                                if (showtime.getScreenId() != null) {
                                    var screen = screenRepository.findById(showtime.getScreenId()).orElse(null);
                                    if (screen != null) {
                                        dto.setScreenName(screen.getName());
                                        
                                        if (screen.getCinemaId() != null) {
                                            var cinema = cinemaRepository.findById(screen.getCinemaId()).orElse(null);
                                            if (cinema != null) {
                                                dto.setCinemaName(cinema.getName());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error mapping payment details: " + e.getMessage());
        }
        
        return dto;
    }
}
