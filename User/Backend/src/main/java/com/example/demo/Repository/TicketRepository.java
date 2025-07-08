package com.example.demo.Repository;

import com.example.demo.Model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByBookingId(String bookingId);
    List<Ticket> findByUserId(String userId);
    Ticket findByQrCode(String qrCode);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
}
