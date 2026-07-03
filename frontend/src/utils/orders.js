import api from "../api/api";

// ✅ place a new order
export const saveOrder = async (order) => {
  const res = await api.post("/orders", order);
  return res.data;
};

// ✅ get all orders of a user
export const getOrders = async (userId) => {
  const res = await api.get(`/orders/user/${userId}`);
  return res.data;
};

// ✅ cancel order by ID
export const deleteOrder = async (orderId) => {
  try {
    const res = await api.put(`/orders/${orderId}/cancel`);
    console.log("Order cancelled:", res.data);
    return res.data;
  } catch (err) {
    console.error("Failed to cancel order:", err);
    throw err;
  }
};