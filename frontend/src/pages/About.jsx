// src/pages/About.jsx
import { useNavigate } from "react-router-dom";

const VALUES = [
  {
    title: "Patient-first design",
    body: "Every workflow is built around the person waiting on care, not around internal process. If a step doesn't help the patient, it doesn't belong.",
  },
  {
    title: "Transparency",
    body: "Reports, appointment status, and order history are always visible to the patient — no calling in to ask what happened.",
  },
  {
    title: "Verified care",
    body: "Every doctor on MediCharm is reviewed and approved before they can accept a single appointment.",
  },
];

const TEAM = [
  { name: "Dr. Sara Iyer", role: "Chief Medical Officer" },
  { name: "Vikram Shah", role: "Head of Product" },
  { name: "Priya Nair", role: "Head of Patient Experience" },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="border-bottom" style={{ background: "var(--brand-50)" }}>
        <div className="container py-5 text-center">
          <span className="tag-chip mb-3 d-inline-block">About Us</span>
          <h1 className="fw-bold mb-3">
            We're building healthcare that respects your time
          </h1>
          <p className="text-muted mx-auto" style={{ maxWidth: "38rem" }}>
            MediCharm connects patients and doctors on one platform — from
            booking a visit to picking up a prescription — so care feels
            organized instead of scattered across phone calls and paper files.
          </p>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-6">
            <h2 className="fw-bold mb-3">Our story</h2>
            <p className="text-muted mb-3">
              MediCharm started in 2021 with a simple frustration: booking a
              doctor's appointment, finding a past report, or reordering a
              prescription took three phone calls and a folder of paper. We
              thought healthcare administration could be a lot calmer than
              that.
            </p>
            <p className="text-muted mb-0">
              Today, MediCharm supports patients and verified doctors across
              multiple specialties — handling scheduling, secure medical
              records, and pharmacy orders in one connected dashboard.
            </p>
          </div>
          <div className="col-12 col-lg-6">
            <div className="row g-3">
              <div className="col-6">
                <div className="card p-3 text-center">
                  <div className="fw-bold fs-4">2021</div>
                  <div className="text-muted small">Founded</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card p-3 text-center">
                  <div className="fw-bold fs-4">12,000+</div>
                  <div className="text-muted small">Patients served</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card p-3 text-center">
                  <div className="fw-bold fs-4">150+</div>
                  <div className="text-muted small">Verified doctors</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card p-3 text-center">
                  <div className="fw-bold fs-4">8</div>
                  <div className="text-muted small">Specialties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2">What we stand for</h2>
            <p className="text-muted">The principles behind every feature.</p>
          </div>
          <div className="row g-4">
            {VALUES.map((v) => (
              <div className="col-12 col-md-4" key={v.title}>
                <div className="card p-4 h-100">
                  <h5 className="fw-semibold mb-2">{v.title}</h5>
                  <p className="text-muted mb-0">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Leadership</h2>
          <p className="text-muted">The team steering MediCharm's care standards.</p>
        </div>
        <div className="row g-4">
          {TEAM.map((member) => (
            <div className="col-12 col-md-4" key={member.name}>
              <div className="card p-4 text-center h-100">
                <div
                  className="d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "50%",
                    background: "var(--brand-50)",
                    color: "var(--brand-600)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                  aria-hidden="true"
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h6 className="fw-semibold mb-1">{member.name}</h6>
                <span className="tag-chip d-inline-block">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--brand-600)" }}>
        <div className="container py-5 text-center">
          <h2 className="fw-bold text-white mb-2">
            Want to experience it yourself?
          </h2>
          <p className="mb-4" style={{ color: "var(--brand-50)" }}>
            Create a free account and book your first appointment in minutes.
          </p>
          <button
            className="btn btn-light px-4 py-2 fw-semibold"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}
