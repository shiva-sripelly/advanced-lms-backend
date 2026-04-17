import { useState } from "react";
import { extractError, mainAPI } from "../api/client";

export default function AttendancePage() {
  const [markData, setMarkData] = useState({
    course_id: "",
    date: "",
    records: [{ student_id: "", status: "Present" }]
  });

  const [studentQuery, setStudentQuery] = useState({
    student_id: "",
    course_id: ""
  });

  const [courseQuery, setCourseQuery] = useState({
    course_id: "",
    from: "",
    to: ""
  });

  const [result, setResult] = useState(null);
  const [resultType, setResultType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const resetState = () => {
    setError("");
    setResult(null);
    setResultType("");
  };

  const updateRecord = (index, field, value) => {
    const updated = [...markData.records];
    updated[index][field] = value;
    setMarkData({ ...markData, records: updated });
  };

  const addRecord = () => {
    setMarkData({
      ...markData,
      records: [...markData.records, { student_id: "", status: "Present" }]
    });
  };

  const removeRecord = (index) => {
    if (markData.records.length === 1) return;
    const updated = markData.records.filter((_, i) => i !== index);
    setMarkData({ ...markData, records: updated });
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    resetState();
    setLoading("mark");

    try {
      const payload = {
        course_id: Number(markData.course_id),
        date: markData.date,
        records: markData.records.map((r) => ({
          student_id: Number(r.student_id),
          status: r.status
        }))
      };

      const res = await mainAPI.post("/attendance/mark", payload);
      setResult(res.data);
      setResultType("mark");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  const handleStudentAttendance = async (e) => {
    e.preventDefault();
    resetState();
    setLoading("student");

    try {
      const res = await mainAPI.get(
        `/attendance/student/${studentQuery.student_id}`,
        {
          params: { course_id: studentQuery.course_id }
        }
      );
      setResult(res.data);
      setResultType("student");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  const handleCourseAttendance = async (e) => {
    e.preventDefault();
    resetState();
    setLoading("course");

    try {
      const res = await mainAPI.get(
        `/attendance/course/${courseQuery.course_id}`,
        {
          params: {
            from: courseQuery.from,
            to: courseQuery.to
          }
        }
      );
      setResult(res.data);
      setResultType("course");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  const renderMarkResult = () => {
    if (!result) return null;

    return (
      <div className="card">
        <h2>Attendance Marked Successfully</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Course ID</h3>
            <p>{result.course_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Date</h3>
            <p>{result.date || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Total Records</h3>
            <p>{result.total_records || result.records?.length || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Status</h3>
            <p>Saved</p>
          </div>
        </div>

        {result.records?.length > 0 && (
          <div className="table-shell">
            <table className="pretty-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.records.map((item, index) => (
                  <tr key={index}>
                    <td>{item.student_id}</td>
                    <td>
                      <span
                        className={
                          item.status === "Present"
                            ? "tag read"
                            : item.status === "Absent"
                            ? "tag unread"
                            : "tag"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <details style={{ marginTop: "16px" }}>
          <summary className="muted" style={{ cursor: "pointer" }}>
            View raw response
          </summary>
          <pre className="json-box">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  };

  const renderStudentResult = () => {
    if (!result) return null;

    const rows = result.records || result.attendance || result.data || [];

    return (
      <div className="card">
        <h2>Student Attendance Report</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Student ID</h3>
            <p>{result.student_id || studentQuery.student_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Course ID</h3>
            <p>{result.course_id || studentQuery.course_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Total Entries</h3>
            <p>{rows.length}</p>
          </div>
          <div className="stat-card">
            <h3>View</h3>
            <p>Student</p>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="table-shell">
            <table className="pretty-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date || "-"}</td>
                    <td>
                      <span
                        className={
                          item.status === "Present"
                            ? "tag read"
                            : item.status === "Absent"
                            ? "tag unread"
                            : "tag"
                        }
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                    <td>{item.course_id || result.course_id || studentQuery.course_id || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No attendance records found.</div>
        )}

        <details style={{ marginTop: "16px" }}>
          <summary className="muted" style={{ cursor: "pointer" }}>
            View raw response
          </summary>
          <pre className="json-box">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  };

  const renderCourseResult = () => {
    if (!result) return null;

    const rows = result.records || result.attendance || result.data || [];

    return (
      <div className="card">
        <h2>Course Attendance Report</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Course ID</h3>
            <p>{result.course_id || courseQuery.course_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>From</h3>
            <p>{result.from || courseQuery.from || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>To</h3>
            <p>{result.to || courseQuery.to || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Total Entries</h3>
            <p>{rows.length}</p>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="table-shell">
            <table className="pretty-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => (
                  <tr key={index}>
                    <td>{item.student_id || "-"}</td>
                    <td>{item.date || "-"}</td>
                    <td>
                      <span
                        className={
                          item.status === "Present"
                            ? "tag read"
                            : item.status === "Absent"
                            ? "tag unread"
                            : "tag"
                        }
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No course attendance records found.</div>
        )}

        <details style={{ marginTop: "16px" }}>
          <summary className="muted" style={{ cursor: "pointer" }}>
            View raw response
          </summary>
          <pre className="json-box">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    if (resultType === "mark") return renderMarkResult();
    if (resultType === "student") return renderStudentResult();
    if (resultType === "course") return renderCourseResult();

    return (
      <div className="card">
        <h2>Response</h2>
        <pre className="json-box">{JSON.stringify(result, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Track class participation, student history, and course-level reports.</p>
      </div>

      <div className="three-col">
        <div className="card">
          <h2>Mark Attendance</h2>
          <form onSubmit={handleMarkAttendance} className="form-grid">
            <input
              type="number"
              placeholder="Course ID"
              value={markData.course_id}
              onChange={(e) =>
                setMarkData({ ...markData, course_id: e.target.value })
              }
              required
            />

            <input
              type="date"
              value={markData.date}
              onChange={(e) =>
                setMarkData({ ...markData, date: e.target.value })
              }
              required
            />

            {markData.records.map((record, index) => (
              <div key={index} className="card" style={{ padding: "14px", borderRadius: "18px" }}>
                <div className="form-grid">
                  <input
                    type="number"
                    placeholder="Student ID"
                    value={record.student_id}
                    onChange={(e) =>
                      updateRecord(index, "student_id", e.target.value)
                    }
                    required
                  />

                  <select
                    value={record.status}
                    onChange={(e) =>
                      updateRecord(index, "status", e.target.value)
                    }
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>

                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => removeRecord(index)}
                  >
                    Remove Record
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="secondary-btn" onClick={addRecord}>
              + Add Student Record
            </button>

            <button className="primary-btn">
              {loading === "mark" ? "Submitting..." : "Submit Attendance"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Student Attendance</h2>
          <form onSubmit={handleStudentAttendance} className="form-grid">
            <input
              type="number"
              placeholder="Student ID"
              value={studentQuery.student_id}
              onChange={(e) =>
                setStudentQuery({ ...studentQuery, student_id: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Course ID"
              value={studentQuery.course_id}
              onChange={(e) =>
                setStudentQuery({ ...studentQuery, course_id: e.target.value })
              }
              required
            />

            <button className="success-btn">
              {loading === "student" ? "Fetching..." : "Get Student Attendance"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Course Attendance</h2>
          <form onSubmit={handleCourseAttendance} className="form-grid">
            <input
              type="number"
              placeholder="Course ID"
              value={courseQuery.course_id}
              onChange={(e) =>
                setCourseQuery({ ...courseQuery, course_id: e.target.value })
              }
              required
            />

            <input
              type="date"
              value={courseQuery.from}
              onChange={(e) =>
                setCourseQuery({ ...courseQuery, from: e.target.value })
              }
              required
            />

            <input
              type="date"
              value={courseQuery.to}
              onChange={(e) =>
                setCourseQuery({ ...courseQuery, to: e.target.value })
              }
              required
            />

            <button className="dark-btn">
              {loading === "course" ? "Fetching..." : "Get Course Attendance"}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert error-alert">{error}</div>}

      {renderResult()}
    </div>
  );
}