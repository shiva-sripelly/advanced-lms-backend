import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, extractError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [otpRequest, setOtpRequest] = useState({
    email: "",
    full_name: ""
  });

  const [otpVerify, setOtpVerify] = useState({
    email: "",
    otp: ""
  });

  const [social, setSocial] = useState({
    googleToken: "",
    facebookToken: "",
    githubToken: ""
  });

  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [socialModal, setSocialModal] = useState({
    open: false,
    provider: "",
    token: ""
  });

  const clearState = () => {
    setMessage("");
    setError("");
  };

  const handleOtpRequest = async (e) => {
    e.preventDefault();
    clearState();
    setLoading("otp-request");

    try {
      const res = await authAPI.post("/auth/otp/request", {
        email: otpRequest.email,
        full_name: otpRequest.full_name
      });

      setMessage("OTP sent successfully. Please enter it below to continue.");
      setOtpVerify((prev) => ({ ...prev, email: otpRequest.email }));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    clearState();
    setLoading("otp-verify");

    try {
      const res = await authAPI.post("/auth/otp/verify", otpVerify);
      login(res.data);
      setMessage("OTP login successful");
      navigate("/");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  const handleSocialLogin = async (provider, tokenValue = "") => {
    clearState();
    setLoading(provider);

    try {
      let payload = {};
      let url = "";

      if (provider === "google") {
        url = "/auth/google/login";
        payload = { id_token: tokenValue || social.googleToken };
      } else if (provider === "facebook") {
        url = "/auth/facebook/login";
        payload = { access_token: tokenValue || social.facebookToken };
      } else {
        url = "/auth/github/login";
        payload = { access_token: tokenValue || social.githubToken };
      }

      const res = await authAPI.post(url, payload);
      login(res.data);
      setMessage(`${provider} login successful`);
      closeSocialModal();
      navigate("/");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading("");
    }
  };

  const openSocialModal = (provider) => {
    clearState();
    setSocialModal({
      open: true,
      provider,
      token: ""
    });
  };

  const closeSocialModal = () => {
    setSocialModal({
      open: false,
      provider: "",
      token: ""
    });
  };

  const submitSocialModal = async (e) => {
    e.preventDefault();

    const token = socialModal.token.trim();
    if (!token) {
      setError("Please enter the token.");
      return;
    }

    if (socialModal.provider === "google") {
      setSocial((prev) => ({ ...prev, googleToken: token }));
    } else if (socialModal.provider === "facebook") {
      setSocial((prev) => ({ ...prev, facebookToken: token }));
    } else {
      setSocial((prev) => ({ ...prev, githubToken: token }));
    }

    await handleSocialLogin(socialModal.provider, token);
  };

  const getModalTitle = () => {
    if (socialModal.provider === "google") return "Enter Google ID Token";
    if (socialModal.provider === "facebook") return "Enter Facebook Access Token";
    if (socialModal.provider === "github") return "Enter GitHub Access Token";
    return "Enter Token";
  };

  const getModalPlaceholder = () => {
    if (socialModal.provider === "google") return "Paste Google ID Token";
    if (socialModal.provider === "facebook") return "Paste Facebook Access Token";
    if (socialModal.provider === "github") return "Paste GitHub Access Token";
    return "Paste token";
  };

  return (
    <>
      <div className="login-shell">
        <div className="login-left">
          <div className="hero-card">
            <span className="hero-pill">Premium LMS UI</span>
            <h1>Welcome to your LMS Portal</h1>
            <p>
              Access your dashboard using OTP verification or social login tokens.
              This interface is connected to your FastAPI authentication backend
              and ready for live demo screenshots.
            </p>

            <div className="hero-grid">
              <div className="hero-mini-card">
                <h3>Secure Access</h3>
                <p>Login using OTP verification or connected social providers.</p>
              </div>

              <div className="hero-mini-card">
                <h3>Attendance</h3>
                <p>Track class participation and review detailed reports.</p>
              </div>

              <div className="hero-mini-card">
                <h3>Assignments</h3>
                <p>Create, submit and evaluate academic work with ease.</p>
              </div>

              <div className="hero-mini-card">
                <h3>Notifications</h3>
                <p>Stay updated with user alerts and read-status actions.</p>
              </div>
            </div>

            <div className="card" style={{ marginTop: "22px", padding: "18px" }}>
              <h2 className="section-title">Connected Services</h2>
              <div className="feature-grid">
                <div className="feature-card">Auth API → 8001</div>
                <div className="feature-card">Main API → 8002</div>
                <div className="feature-card">Frontend → 3000</div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="glass-card">
            <h2>OTP Request</h2>
            <form onSubmit={handleOtpRequest} className="form-grid">
              <input
                type="text"
                placeholder="Full name"
                value={otpRequest.full_name}
                onChange={(e) =>
                  setOtpRequest({ ...otpRequest, full_name: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email address"
                value={otpRequest.email}
                onChange={(e) =>
                  setOtpRequest({ ...otpRequest, email: e.target.value })
                }
                required
              />

              <button className="primary-btn" disabled={loading !== ""}>
                {loading === "otp-request" ? "Requesting OTP..." : "Request OTP"}
              </button>
            </form>

            <div className="divider">Verify OTP</div>

            <form onSubmit={handleOtpVerify} className="form-grid">
              <input
                type="email"
                placeholder="Email address"
                value={otpVerify.email}
                onChange={(e) =>
                  setOtpVerify({ ...otpVerify, email: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Enter OTP"
                value={otpVerify.otp}
                onChange={(e) =>
                  setOtpVerify({ ...otpVerify, otp: e.target.value })
                }
                required
              />

              <p className="muted" style={{ marginTop: "6px" }}>
                Enter the OTP sent to your email
              </p>

              <button className="success-btn" disabled={loading !== ""}>
                {loading === "otp-verify" ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="divider">Continue with</div>

            <div className="social-block">
              <button
                type="button"
                className="social-btn google"
                onClick={() => openSocialModal("google")}
                disabled={loading !== ""}
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="google"
                />
                Continue with Google
              </button>

              <button
                type="button"
                className="social-btn facebook"
                onClick={() => openSocialModal("facebook")}
                disabled={loading !== ""}
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                  alt="facebook"
                />
                Continue with Facebook
              </button>

              <button
                type="button"
                className="social-btn github"
                onClick={() => openSocialModal("github")}
                disabled={loading !== ""}
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                  alt="github"
                />
                Continue with GitHub
              </button>
            </div>

            {message && <div className="alert success-alert">{message}</div>}
            {error && <div className="alert error-alert">{error}</div>}
          </div>
        </div>
      </div>

      {socialModal.open && (
        <div className="modal-overlay" onClick={closeSocialModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{getModalTitle()}</h2>
            <p className="muted">
              Paste the token for {socialModal.provider} login to continue.
            </p>

            <form onSubmit={submitSocialModal} className="form-grid" style={{ marginTop: "16px" }}>
              <textarea
                placeholder={getModalPlaceholder()}
                value={socialModal.token}
                onChange={(e) =>
                  setSocialModal((prev) => ({ ...prev, token: e.target.value }))
                }
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeSocialModal}
                  disabled={loading !== ""}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading !== ""}
                >
                  {loading === socialModal.provider ? "Submitting..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}