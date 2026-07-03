// src/components/EmergencyButton.jsx
export default function EmergencyButton() {
  return (
    <a
      href="tel:108"
      className="btn btn-danger position-fixed d-flex align-items-center justify-content-center"
      style={{
        width: "56px",
        height: "56px",
        bottom: "18px",
        right: "18px",
        borderRadius: "50%",
        zIndex: 1050,
        boxShadow: "0 6px 18px rgba(16,24,40,0.12)"
      }}
      title="Call Emergency"
    >
      <span style={{ fontSize: "1.25rem" }}>🚑</span>
    </a>
  );
}
