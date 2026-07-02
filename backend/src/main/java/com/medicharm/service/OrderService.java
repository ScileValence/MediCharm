package com.medicharm.service;

import com.medicharm.model.Order;
import com.medicharm.model.OrderItem;
import com.medicharm.model.Medicine;
import com.medicharm.model.User;
import com.medicharm.repository.OrderRepository;
import com.medicharm.repository.MedicineRepository;
import com.medicharm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private MedicineRepository medRepo;

    @Autowired
    private UserRepository userRepo;

    public Order placeOrder(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }

        System.out.println("🧾 [OrderService] Received order for processing...");

        if (order.getUser() == null || order.getUser().getId() == null) {
            throw new IllegalArgumentException("User must be specified for placing an order.");
        }

        Long userId = order.getUser().getId();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID: " + userId));
        order.setUser(user);

        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PLACED");

        Order savedOrder = orderRepo.save(order);

        List<OrderItem> items = order.getItems();
        if (items != null && !items.isEmpty()) {
            for (OrderItem item : items) {
                if (item.getMedicine() != null && item.getMedicine().getId() != null) {
                    Optional<Medicine> optMed = medRepo.findById(item.getMedicine().getId());
                    if (optMed.isPresent()) {
                        Medicine med = optMed.get();
                        med.setStock(Math.max(0, med.getStock() - item.getQty()));
                        medRepo.save(med);
                        item.setMedicine(med);
                    }
                }
                item.setOrder(savedOrder);
            }
            savedOrder.setItems(items);
            orderRepo.save(savedOrder);
        }

        System.out.println("✅ [OrderService] Order placed successfully for user ID: " + userId);
        return savedOrder;
    }

    public List<Order> ordersForUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }

    // ✅ Cancel order and update DB + stock
    public Order cancelOrder(Long orderId) {
        Optional<Order> optOrder = orderRepo.findById(orderId);
        if (optOrder.isEmpty()) {
            throw new IllegalArgumentException("Order not found: " + orderId);
        }

        Order order = optOrder.get();
        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            return order;
        }

        order.setStatus("CANCELLED");

        // ✅ Restore medicine stock
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Medicine med = item.getMedicine();
                if (med != null) {
                    med.setStock(med.getStock() + item.getQty());
                    medRepo.save(med);
                }
            }
        }

        Order saved = orderRepo.save(order);
        System.out.println("❌ [OrderService] Order #" + orderId + " cancelled successfully.");
        return saved;
    }
}
