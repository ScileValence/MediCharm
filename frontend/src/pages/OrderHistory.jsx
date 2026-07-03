// src/pages/OrderHistory.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, deleteOrder } from "../utils/orders";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import StatusPill from "../components/ui/StatusPill";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { SkeletonCardList } from "../components/ui/Skeleton";
import { PillIcon } from "../components/ui/icons";

export default function OrderHistory() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);
    fetchOrders(parsed.id);
  }, [navigate]);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOrders(userId);

      // Most recent orders first.
      const sorted = [...(data || [])].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });

      setOrders(sorted);
    } catch (err) {
      console.error("❌ Failed to fetch order history:", err);
      setError("Failed to load your order history.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      setCancellingId(orderId);

      const updated = await deleteOrder(orderId);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );

      showToast("Order cancelled");
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to cancel order",
        "error"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const visibleOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    const status = (o.status || "").toUpperCase();
    if (filter === "ACTIVE") return status !== "CANCELLED";
    if (filter === "CANCELLED") return status === "CANCELLED";
    return true;
  });

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Order History</h2>
          <p className="text-muted mb-0">Track every medicine order you've placed.</p>
        </div>

        <button
          className="btn btn-teal text-white"
          onClick={() => navigate("/order-medicine")}
        >
          + Place New Order
        </button>
      </div>

      {!loading && !error && orders.length > 0 && (
        <div className="btn-group mb-4" role="group">
          {["ALL", "ACTIVE", "CANCELLED"].map((key) => (
            <button
              key={key}
              type="button"
              className={`btn btn-sm ${
                filter === key ? "btn-teal text-white" : "btn-outline-teal"
              }`}
              onClick={() => setFilter(key)}
            >
              {key === "ALL" ? "All Orders" : key === "ACTIVE" ? "Active" : "Cancelled"}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonCardList count={3} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => fetchOrders(user?.id)} />
      ) : orders.length === 0 ? (
        <div className="card p-0">
          <EmptyState
            icon={PillIcon}
            title="No orders yet"
            body="Medicines you order will show up here for easy tracking."
            action={
              <button
                className="btn btn-teal text-white"
                onClick={() => navigate("/order-medicine")}
              >
                Order Medicine
              </button>
            }
          />
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="card p-0">
          <EmptyState
            icon={PillIcon}
            title="Nothing in this filter"
            body="Try a different filter to see your other orders."
          />
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {visibleOrders.map((order) => {
            const status = (order.status || "").toUpperCase();
            const canCancel = status !== "CANCELLED";
            const busy = cancellingId === order.id;

            return (
              <div key={order.id} className="card p-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-semibold">Order #{order.id}</span>
                      <StatusPill status={order.status} />
                    </div>

                    <div className="text-muted small">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "—"}
                    </div>

                    {order.address && (
                      <div className="text-muted small">📍 {order.address}</div>
                    )}
                  </div>

                  <div className="text-md-end">
                    <div className="fw-bold fs-5" style={{ color: "var(--brand-600)" }}>
                      ₹{order.total?.toFixed ? order.total.toFixed(0) : order.total}
                    </div>
                    {canCancel && (
                      <button
                        className="btn btn-sm btn-outline-secondary mt-2"
                        disabled={busy}
                        onClick={() => handleCancel(order.id)}
                      >
                        {busy ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>

                <hr className="my-2" style={{ borderColor: "var(--gray-200)" }} />

                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr className="text-muted small">
                        <th>Medicine</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th className="text-end">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, idx) => (
                        <tr key={item.id ?? idx}>
                          <td>{item.medicine?.name || "Medicine"}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price}</td>
                          <td className="text-end">
                            ₹{(item.price * item.qty).toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end gap-4 small text-muted mt-2">
                  <span>Subtotal: ₹{order.subtotal?.toFixed ? order.subtotal.toFixed(0) : order.subtotal}</span>
                  <span>Shipping: ₹{order.shipping?.toFixed ? order.shipping.toFixed(0) : order.shipping}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
