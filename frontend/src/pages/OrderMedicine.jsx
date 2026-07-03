// src/pages/OrderMedicine.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../utils/medicines";
import { saveOrder } from "../utils/orders";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { PillIcon } from "../components/ui/icons";

const CART_KEY = "cart";

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export default function OrderMedicine() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(loadCart());
  const [query, setQuery] = useState("");
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState(localStorage.getItem("deliveryAddress") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("❌ Error fetching medicines:", err);
        setError("Failed to load medicines. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.productId === product.id);
      if (existing) {
        return prev.map((p) =>
          p.productId === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            pack: product.pack,
          },
        ];
      }
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) removeFromCart(productId);
    else
      setCart((prev) =>
        prev.map((p) => (p.productId === productId ? { ...p, qty } : p))
      );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal > 0 ? 30 : 0;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }
    if (!address.trim()) {
      showToast("Please enter delivery address.", "error");
      return;
    }

    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;

    // ✅ Build proper payload for backend (numeric ID auto-generated)
    const orderPayload = {
      user: user ? { id: user.id } : null,
      items: cart.map(it => ({
        medicine: { id: it.productId },
        qty: it.qty,
        price: it.price
      })),
      subtotal,
      shipping,
      total,
      address,
      createdAt: new Date().toISOString(),
      status: "Placed"
    };

    try {
      setPlacing(true);
      const res = await saveOrder(orderPayload);
      console.log("✅ Order saved:", res);

      clearCart();
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          items: cart,
          subtotal,
          shipping,
          total,
          address,
          createdAt: orderPayload.createdAt,
          status: "Placed",
        })
      );
      localStorage.setItem("deliveryAddress", address);
      showToast("Order placed successfully!");
    } catch (err) {
      console.error("❌ Order failed:", err);
      showToast("Failed to place order. Please try again.", "error");
    } finally {
      setPlacing(false);
    }
  };

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  if (loading)
    return (
      <div className="container py-4">
        <h2 className="fw-bold mb-4">Order Medicines Online</h2>
        <div className="row g-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container py-4">
        <ErrorState body={error} onRetry={() => window.location.reload()} />
      </div>
    );

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Order Medicines Online</h2>
          <p className="text-muted mb-0">
            Browse, add to cart, and have medicines delivered to your door.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/order-history")}
          >
            Order History
          </button>
          <button
            className="btn btn-teal text-white"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#cartOffcanvas"
          >
            Cart ({cart.reduce((s, it) => s + it.qty, 0)})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-12 col-md-8">
          <div className="input-group">
            <span className="input-group-text" style={{ background: "var(--gray-0)", borderColor: "var(--gray-300)" }}>
              🔍
            </span>
            <input
              className="form-control"
              placeholder="Search medicines..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuery("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
          <small className="text-muted">
            Tip: Click a product to add to cart
          </small>
        </div>
      </div>

      {/* Product Grid */}
      <div className="row g-3">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div
              className="col-12 col-sm-6 col-md-4 col-lg-3"
              key={p.id}
            >
              <div className="card h-100 hover-shadow text-center p-3">
                <h6 className="card-title fw-semibold mb-1">{p.name}</h6>
                <p className="text-muted small mb-2">{p.description}</p>
                <div className="fw-bold mb-1" style={{ fontFamily: "Lexend, sans-serif" }}>
                  ₹{p.price.toFixed(0)}
                </div>
                <span className="tag-chip d-inline-block mb-3">{p.pack}</span>
                <button
                  className="btn btn-outline-teal btn-sm mt-auto"
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="card p-0">
              <EmptyState
                icon={PillIcon}
                title="No medicines found"
                body={`Nothing matches "${query}". Try a different search term.`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Offcanvas Cart */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="cartOffcanvas">
        <div className="offcanvas-header">
          <h5>Your Cart</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>
        <div className="offcanvas-body d-flex flex-column">
          {cart.length === 0 ? (
            <EmptyState
              icon={PillIcon}
              title="Your cart is empty"
              body="Add a medicine to get started."
            />
          ) : (
            <>
              <div className="d-flex flex-column gap-2 mb-3">
                {cart.map((it) => (
                  <div
                    key={it.productId}
                    className="card p-2 d-flex flex-row justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold small">{it.name}</div>
                      <div className="small text-muted">{it.pack}</div>
                      <div className="small text-muted">
                        ₹{it.price} × {it.qty} = ₹
                        {(it.price * it.qty).toFixed(0)}
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        style={{ width: 64 }}
                        className="form-control form-control-sm me-2"
                        onChange={(e) =>
                          updateQty(
                            it.productId,
                            Math.max(1, Number(e.target.value || 0))
                          )
                        }
                      />
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => removeFromCart(it.productId)}
                        aria-label={`Remove ${it.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Delivery Address
                </label>
                <textarea
                  className="form-control mb-2"
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter delivery address"
                />
                <small className="text-muted">Flat shipping ₹30</small>
              </div>

              <div className="mt-auto">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Subtotal</span>
                  <span className="fw-semibold">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Shipping</span>
                  <span className="fw-semibold">₹{shipping.toFixed(0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="small text-muted">Total</span>
                  <span className="fw-bold" style={{ color: "var(--brand-600)" }}>
                    ₹{total.toFixed(0)}
                  </span>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-teal text-white"
                    onClick={placeOrder}
                    disabled={placing}
                  >
                    {placing ? "Placing..." : "Place Order"}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
