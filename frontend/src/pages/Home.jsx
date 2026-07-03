// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  PillIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "../components/ui/icons";

// Specialties shown here intentionally match the departments that
// actually exist in the seed data (Cardiology, Neurology, etc.) so
// the marketing page and the live, DB-driven Departments page never
// contradict each other — clicking through leads somewhere real.
const SPECIALTIES = [
  { name: "Cardiology", icon: "❤️", blurb: "Heart health & diagnostics" },
  { name: "Neurology", icon: "🧠", blurb: "Brain, spine & nerve care" },
  { name: "Orthopedics", icon: "🦴", blurb: "Bones, joints & mobility" },
  { name: "Pediatrics", icon: "👶", blurb: "Child & adolescent care" },
  { name: "Dermatology", icon: "🌿", blurb: "Skin, hair & nail health" },
  { name: "ENT", icon: "👂", blurb: "Ear, nose & throat care" },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Find your doctor",
    body: "Browse specialists by department, experience, and patient ratings.",
  },
  {
    step: "2",
    title: "Book a time that works",
    body: "Pick an available slot and confirm your visit in under a minute.",
  },
  {
    step: "3",
    title: "Get care, track everything",
    body: "Consult, order medicines, and access your reports — all in one place.",
  },
];

const FEATURES = [
  {
    icon: CalendarIcon,
    title: "Effortless booking",
    body: "Real-time availability across every department, with instant confirmation.",
  },
  {
    icon: FileTextIcon,
    title: "Reports, always on hand",
    body: "Every test result and doctor's note stored securely and ready to download.",
  },
  {
    icon: PillIcon,
    title: "Medicines, delivered",
    body: "Order prescribed medicines online and track delivery from your dashboard.",
  },
];

// Fictional, illustrative testimonials — first-name + last-initial
// only, matching the de-identified style real review platforms use,
// since these are placeholder copy rather than real patient
// accounts.
const TESTIMONIALS = [
  {
    name: "Ananya R.",
    role: "Patient, Cardiology",
    quote:
      "Booking an appointment took less than two minutes, and I had my reports ready to view the same evening. It genuinely felt easier than calling a clinic.",
  },
  {
    name: "Rahul D.",
    role: "Patient, Orthopedics",
    quote:
      "I could see my doctor's notes and order my medication without a single phone call. The whole process felt organized for once.",
  },
  {
    name: "Dr. Meera K.",
    role: "Consulting Physician",
    quote:
      "Having appointment history, patient notes, and reports in one dashboard has cut my admin time significantly — I can focus on patients instead of paperwork.",
  },
];

const STATS = [
  { value: "12,000+", label: "Patients served" },
  { value: "150+", label: "Verified doctors" },
  { value: "8", label: "Specialties" },
  { value: "4.8/5", label: "Average patient rating" },
];

export default function Home() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(null);

  // The homepage is intentionally identical for every role — patient,
  // doctor, or admin, logged in or not. The only personalization is
  // this one greeting line, which checks all three possible session
  // keys so a logged-in doctor or admin isn't silently dropped back
  // into the logged-out hero (the previous bug: this page only ever
  // checked localStorage.user, so doctors/admins always saw the
  // anonymous version despite being logged in).
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const doctor = JSON.parse(localStorage.getItem("doctor") || "null");
      const admin = JSON.parse(localStorage.getItem("admin") || "null");

      const name = user?.name || doctor?.name || admin?.name || null;
      setDisplayName(name);
    } catch {
      setDisplayName(null);
    }
  }, []);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="border-bottom" style={{ background: "var(--brand-50)" }}>
        <div className="container py-5">
          <div className="row align-items-center g-4 py-4">
            <div className="col-12 col-lg-7">
              <span className="tag-chip mb-3 d-inline-block">
                Trusted healthcare, online
              </span>
              <h1 className="fw-bold mb-3" style={{ fontSize: "2.75rem", lineHeight: 1.15 }}>
                {displayName ? `Welcome back, ${displayName}.` : "Healthcare that fits"}
                <br />
                {!displayName && "around your life."}
              </h1>
              <p className="text-muted mb-4" style={{ fontSize: "1.05rem", maxWidth: "32rem" }}>
                Book appointments with verified specialists, order medicines,
                and access your medical reports — all from one calm,
                connected dashboard.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <button
                  className="btn btn-teal text-white px-4 py-2"
                  onClick={() => navigate("/departments")}
                >
                  Find a Doctor
                </button>
                <button
                  className="btn btn-outline-teal px-4 py-2"
                  onClick={() => navigate(displayName ? "/dashboard" : "/signup")}
                >
                  {displayName ? "Go to Dashboard" : "Create Free Account"}
                </button>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="status-pill status-pill--confirmed">
                    <CheckCircleIcon aria-hidden="true" />
                    Confirmed
                  </span>
                  <span className="text-muted small">Today, 4:30 PM</span>
                </div>
                <div className="fw-semibold mb-1">Dr. Arjun Mehta</div>
                <span className="tag-chip mb-3 d-inline-block">Cardiology</span>
                <p className="text-muted small mb-0">
                  Routine follow-up consultation · MediCharm Central
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="border-bottom" style={{ background: "var(--gray-0)" }}>
        <div className="container py-4">
          <div className="row g-3 text-center">
            {STATS.map((stat) => (
              <div className="col-6 col-md-3" key={stat.label}>
                <div className="fw-bold" style={{ fontSize: "1.6rem", fontFamily: "Lexend, sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-muted small">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="container py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">How MediCharm works</h2>
          <p className="text-muted">Three steps from search to seen.</p>
        </div>
        <div className="row g-4">
          {HOW_IT_WORKS.map((item) => (
            <div className="col-12 col-md-4" key={item.step}>
              <div className="card p-4 h-100">
                <div
                  className="d-flex align-items-center justify-content-center mb-3 fw-bold"
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    background: "var(--brand-50)",
                    color: "var(--brand-600)",
                  }}
                >
                  {item.step}
                </div>
                <h5 className="fw-semibold mb-2">{item.title}</h5>
                <p className="text-muted mb-0">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Specialties ---------- */}
      <section className="py-5" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h2 className="fw-bold mb-1">Care across every specialty</h2>
              <p className="text-muted mb-0">
                Verified doctors, organized by department.
              </p>
            </div>
            <button
              className="btn btn-outline-teal"
              onClick={() => navigate("/departments")}
            >
              View All Departments
            </button>
          </div>

          <div className="row g-3">
            {SPECIALTIES.map((dept) => (
              <div className="col-12 col-sm-6 col-lg-4" key={dept.name}>
                <div
                  className="card hover-shadow p-4 h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/departments")}
                >
                  <div className="fs-1 mb-2" aria-hidden="true">
                    {dept.icon}
                  </div>
                  <h6 className="fw-semibold mb-1">{dept.name}</h6>
                  <p className="text-muted small mb-0">{dept.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="container py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Why patients choose MediCharm</h2>
          <p className="text-muted">
            Built around the things that actually slow healthcare down.
          </p>
        </div>
        <div className="row g-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="col-12 col-md-4" key={feature.title}>
                <div className="card p-4 h-100">
                  <Icon
                    style={{ width: "1.75rem", height: "1.75rem", color: "var(--brand-500)" }}
                    className="mb-3"
                    aria-hidden="true"
                  />
                  <h5 className="fw-semibold mb-2">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="py-5" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2">What our community says</h2>
            <p className="text-muted">
              Real workflows, told by the people who use them.
            </p>
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t) => (
              <div className="col-12 col-md-4" key={t.name}>
                <div className="card p-4 h-100">
                  <p className="mb-3" style={{ color: "var(--gray-900)" }}>
                    "{t.quote}"
                  </p>
                  <div className="fw-semibold small">{t.name}</div>
                  <div className="text-muted small">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- About Us ---------- */}
      <section className="container py-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-6">
            <span className="tag-chip mb-3 d-inline-block">About Us</span>
            <h2 className="fw-bold mb-3">
              Built to make healthcare feel less like paperwork
            </h2>
            <p className="text-muted mb-3">
              MediCharm started with a simple frustration: booking a doctor's
              appointment, finding a past report, or reordering a prescription
              shouldn't take three phone calls and a folder of paper. We built
              a single, connected platform where patients and doctors can do
              all of it in one place.
            </p>
            <p className="text-muted mb-0">
              Today, MediCharm supports patients and verified doctors across
              multiple specialties — handling scheduling, secure medical
              records, and pharmacy orders, with every record exactly where
              you left it.
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
                  <div className="fw-bold fs-4">24/7</div>
                  <div className="text-muted small">Platform access</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card p-3 text-center">
                  <div className="fw-bold fs-4">100%</div>
                  <div className="text-muted small">Verified doctors</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card p-3 text-center">
                  <div className="fw-bold fs-4">256-bit</div>
                  <div className="text-muted small">Data encryption</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      {!displayName && (
        <section style={{ background: "var(--brand-600)" }}>
          <div className="container py-5 text-center">
            <h2 className="fw-bold text-white mb-2">
              Ready to take healthcare off your to-do list?
            </h2>
            <p className="mb-4" style={{ color: "var(--brand-50)" }}>
              Create a free account and book your first appointment in minutes.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button
                className="btn btn-light px-4 py-2 fw-semibold"
                onClick={() => navigate("/signup")}
              >
                Create Free Account
              </button>
              <button
                className="btn btn-outline-light px-4 py-2"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Contact ---------- */}
      <section className="border-top">
        <div className="container py-5 text-center">
          <h4 className="fw-bold mb-3">Contact Us</h4>
          <p className="text-muted mb-1">
            📍 123 MediCharm Avenue, Green City, India
          </p>
          <p className="text-muted mb-1">📞 +91 98765 43210</p>
          <p className="text-muted mb-0">✉️ contact@medicharm.com</p>
        </div>
      </section>
    </div>
  );
}
