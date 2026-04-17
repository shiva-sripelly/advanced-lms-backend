import { useState } from "react";
import { extractError, mainAPI } from "../api/client";

export default function AssignmentsPage() {
  const [createForm, setCreateForm] = useState({
    course_id: "",
    title: "",
    description: "",
    deadline: "",
    created_by: "",
    file: null
  });

  const [submitForm, setSubmitForm] = useState({
    assignment_id: "",
    student_id: "",
    file: null
  });

  const [gradeForm, setGradeForm] = useState({
    submission_id: "",
    grade: "",
    remarks: ""
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

  const renderCreateResult = () => {
    if (!result) return null;

    return (
      <div className="card">
        <h2>Assignment Created</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Assignment ID</h3>
            <p>{result.id || result.assignment_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Course</h3>
            <p>{result.course_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Title</h3>
            <p>{result.title || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Status</h3>
            <p>Created</p>
          </div>
        </div>

        <details style={{ marginTop: "16px" }}>
          <summary className="muted" style={{ cursor: "pointer" }}>
            View raw response
          </summary>
          <pre className="json-box">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  };

  const renderSubmitResult = () => {
    if (!result) return null;

    return (
      <div className="card">
        <h2>Assignment Submitted</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Submission ID</h3>
            <p>{result.id || result.submission_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Assignment</h3>
            <p>{result.assignment_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Student</h3>
            <p>{result.student_id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Status</h3>
            <p>Submitted</p>
          </div>
        </div>

        <details style={{ marginTop: "16px" }}>
          <summary className="muted" style={{ cursor: "pointer" }}>
            View raw response
          </summary>
          <pre className="json-box">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  };

  const renderGradeResult = () => {
    if (!result) return null;

    return (
      <div className="card">
        <h2>Submission Graded</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Submission</h3>
            <p>{result.submission_id || result.id || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Grade</h3>
            <p>{result.grade || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Remarks</h3>
            <p>{result.remarks || "-"}</p>
          </div>
          <div className="stat-card">
            <h3>Status</h3>
            <p>Evaluated</p>
          </div>
        </div>

        <details style={{ marginTop: "16px" }}>
          <summary className="muted" style={{ cursor: "pointer" }}>
            View raw response
          </summary>
          <pre className="json-box">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  };

  // CREATE
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    resetState();
    setLoading("create");

    try {
      const formData = new FormData();
      Object.entries(createForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const res = await mainAPI.post("/assignments/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(res.data);
      setResultType("create");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  // SUBMIT
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    resetState();
    setLoading("submit");

    try {
      const formData = new FormData();
      Object.entries(submitForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await mainAPI.post("/assignments/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(res.data);
      setResultType("submit");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  // GRADE
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    resetState();
    setLoading("grade");

    try {
      const payload = {
        submission_id: Number(gradeForm.submission_id),
        grade: gradeForm.grade,
        remarks: gradeForm.remarks
      };

      const res = await mainAPI.put("/assignments/grade", payload);
      setResult(res.data);
      setResultType("grade");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Assignments</h1>
        <p>Manage academic tasks — create, submit and evaluate assignments.</p>
      </div>

      <div className="three-col">
        <div className="card">
          <h2>Create Assignment</h2>
          <form onSubmit={handleCreateAssignment} className="form-grid">
            <input
              type="number"
              placeholder="Course ID"
              value={createForm.course_id}
              onChange={(e) =>
                setCreateForm({ ...createForm, course_id: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Assignment Title"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm({ ...createForm, title: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Description"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({ ...createForm, description: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Deadline (YYYY-MM-DDTHH:MM:SS)"
              value={createForm.deadline}
              onChange={(e) =>
                setCreateForm({ ...createForm, deadline: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Faculty ID"
              value={createForm.created_by}
              onChange={(e) =>
                setCreateForm({ ...createForm, created_by: e.target.value })
              }
              required
            />

            <input
              type="file"
              onChange={(e) =>
                setCreateForm({ ...createForm, file: e.target.files[0] })
              }
            />

            <button className="primary-btn">
              {loading === "create" ? "Creating..." : "Create Assignment"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Submit Assignment</h2>
          <form onSubmit={handleSubmitAssignment} className="form-grid">
            <input
              type="number"
              placeholder="Assignment ID"
              value={submitForm.assignment_id}
              onChange={(e) =>
                setSubmitForm({ ...submitForm, assignment_id: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Student ID"
              value={submitForm.student_id}
              onChange={(e) =>
                setSubmitForm({ ...submitForm, student_id: e.target.value })
              }
              required
            />

            <input
              type="file"
              onChange={(e) =>
                setSubmitForm({ ...submitForm, file: e.target.files[0] })
              }
              required
            />

            <button className="success-btn">
              {loading === "submit" ? "Submitting..." : "Submit Assignment"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Grade Submission</h2>
          <form onSubmit={handleGradeSubmission} className="form-grid">
            <input
              type="number"
              placeholder="Submission ID"
              value={gradeForm.submission_id}
              onChange={(e) =>
                setGradeForm({ ...gradeForm, submission_id: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Grade (A / B / 90 etc)"
              value={gradeForm.grade}
              onChange={(e) =>
                setGradeForm({ ...gradeForm, grade: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Remarks"
              value={gradeForm.remarks}
              onChange={(e) =>
                setGradeForm({ ...gradeForm, remarks: e.target.value })
              }
            />

            <button className="dark-btn">
              {loading === "grade" ? "Grading..." : "Grade Submission"}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert error-alert">{error}</div>}

      {resultType === "create" && renderCreateResult()}
      {resultType === "submit" && renderSubmitResult()}
      {resultType === "grade" && renderGradeResult()}
    </div>
  );
}