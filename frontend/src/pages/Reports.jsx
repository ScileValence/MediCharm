import { useEffect, useState } from "react";
import api, { BASE_URL } from "../api/api";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { SkeletonCardList } from "../components/ui/Skeleton";
import { FileTextIcon } from "../components/ui/icons";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const rawUser = localStorage.getItem("user");

      if (!rawUser) {
        setError("User not found. Please login first.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(rawUser);

      const res = await api.get(`/reports/user/${user.id}`);

      setReports(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch reports:", err);
      setError("Unable to load your reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Medical Reports</h2>
        <p className="text-muted mb-0">
          Notes, observations, and attachments from your doctors.
        </p>
      </div>

      {loading ? (
        <SkeletonCardList count={3} />
      ) : error ? (
        <ErrorState body={error} onRetry={fetchReports} />
      ) : reports.length === 0 ? (
        <div className="card p-0">
          <EmptyState
            icon={FileTextIcon}
            title="No reports yet"
            body="Reports your doctor creates after a visit will appear here."
          />
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {reports.map((r, index) => {
            const isOpen = expandedId === r.id;

            return (
              <div key={r.id} className="card overflow-hidden">
                <button
                  type="button"
                  className="btn d-flex justify-content-between align-items-center w-100 text-start px-3 py-3 border-0"
                  style={{
                    background: isOpen ? "var(--brand-50)" : "var(--gray-0)",
                    borderRadius: 0,
                  }}
                  onClick={() => toggleExpand(r.id)}
                  aria-expanded={isOpen}
                >
                  <span className="fw-semibold" style={{ color: "var(--gray-900)" }}>
                    Report #{reports.length - index}
                    <span className="text-muted fw-normal ms-2">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </span>
                  <span style={{ color: "var(--brand-500)" }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-3 border-top" style={{ borderColor: "var(--gray-200)" }}>
                    <div className="mb-3">
                      <h6 className="fw-semibold mb-2">Doctor Information</h6>
                      <p className="mb-1">
                        <span className="text-muted">Name: </span>
                        {r.doctorName || "Unknown Doctor"}
                      </p>
                      <p className="mb-0">
                        <span className="text-muted">Department: </span>
                        {r.department || "—"}
                      </p>
                    </div>

                    <hr style={{ borderColor: "var(--gray-200)" }} />

                    <div className="mb-3">
                      <h6 className="fw-semibold mb-2">Doctor's Observation</h6>
                      <p className="mb-0">
                        {r.reportText || "No details provided."}
                      </p>
                    </div>

                    {r.comments && (
                      <>
                        <hr style={{ borderColor: "var(--gray-200)" }} />
                        <div className="mb-3">
                          <h6 className="fw-semibold mb-2">Doctor's Suggestions</h6>
                          <p className="text-muted fst-italic mb-0">{r.comments}</p>
                        </div>
                      </>
                    )}

                    {r.reportFile && (
                      <>
                        <hr style={{ borderColor: "var(--gray-200)" }} />
                        <div>
                          <h6 className="fw-semibold mb-2">Attached Document</h6>
                          <a
                            href={`${BASE_URL}/reports/file/${r.reportFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-teal btn-sm"
                          >
                            View / Download File
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
