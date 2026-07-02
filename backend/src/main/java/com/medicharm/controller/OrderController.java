package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.Order;
import com.medicharm.model.User;
import com.medicharm.repository.OrderRepository;
import com.medicharm.repository.UserRepository;
import com.medicharm.service.NotificationHelper;
import com.medicharm.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService svc;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private NotificationHelper notificationHelper;

    // Returns true if the currently authenticated principal is an
    // admin, OR is the patient identified by userId. Mirrors the
    // same check added to AppointmentController, for the same
    // reason: prevent one logged-in patient from reading another
    // patient's order data by guessing/incrementing a userId.
    private boolean canViewUserData(
            Authentication authentication,
            Long userId
    ) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));

        if (isAdmin) {
            return true;
        }

        User user = userRepo.findByEmail(
                authentication.getName()
        ).orElse(null);

        return user != null && user.getId().equals(userId);
    }

    // Returns true if the currently authenticated principal is an
    // admin, OR is the patient who placed this order. Guards the
    // patient-facing cancel endpoint below so one patient can't
    // cancel another patient's order by guessing an order ID.
    private boolean canManage(
            Authentication authentication,
            Order order
    ) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));

        if (isAdmin) {
            return true;
        }

        if (order.getUser() == null) {
            return false;
        }

        User user = userRepo.findByEmail(
                authentication.getName()
        ).orElse(null);

        return user != null
                && user.getId().equals(order.getUser().getId());
    }

    // ✅ Place new order
    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> placeOrder(@RequestBody @NonNull Order order) {
        try {
            Order saved = svc.placeOrder(order);
            notificationHelper.orderPlaced(saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ErrorResponse.of("Failed to place order", e));
        }
    }

    // ✅ Get all orders for a user (used in dashboard)
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        try {
            if (!canViewUserData(authentication, userId)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "You are not authorized to view these orders"
                ));
            }

            return ResponseEntity.ok(svc.ordersForUser(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ErrorResponse.of("Failed to fetch orders", e));
        }
    }

    // ✅ Cancel order
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        try {
            Order order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            if (!canManage(authentication, order)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "You are not authorized to cancel this order"
                ));
            }

            if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Order already cancelled"));
            }

            order.setStatus("CANCELLED");
            orderRepo.save(order);

            notificationHelper.orderCancelled(order);

            return ResponseEntity.ok(order); // return updated order object

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ErrorResponse.of("Failed to cancel order", e));
        }
    }
}
