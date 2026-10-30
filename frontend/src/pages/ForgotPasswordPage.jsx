import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await forgotPassword(email.trim());
      setSuccess('A 6-digit OTP code has been sent to your email.');
      if (res.debugOtp) {
        setDevOtpHint(res.debugOtp);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword) {
      setError('Please provide the OTP code and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
      setSuccess('Password reset successfully! Redirecting to login…');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card panel">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p className="sub">
            {step === 1
              ? "Enter your account email to receive a verification OTP via SMTP"
              : "Enter the 6-digit OTP sent to your email and create a new password"}
          </p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {success && <div className="auth-alert success">{success}</div>}

        {devOtpHint && (
          <div className="auth-alert info" style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>
            ℹ️ <strong>SMTP Dev Hint:</strong> OTP code is <code>{devOtpHint}</code>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="fld">
              <label htmlFor="email">
                <b>Registered Email Address</b>
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="fld">
              <label htmlFor="otp">
                <b>6-Digit OTP Code</b>
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                style={{ letterSpacing: '6px', fontSize: '18px', textAlign: 'center', fontFamily: 'var(--mono)' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className="fld">
              <label htmlFor="newPassword">
                <b>New Password (min. 6 characters)</b>
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="fld">
              <label htmlFor="confirmPassword">
                <b>Confirm New Password</b>
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Resetting Password…' : 'Reset Password'}
            </button>

            <button
              type="button"
              className="btn-subtle"
              style={{ width: '100%', marginTop: '4px' }}
              onClick={() => { setStep(1); setDevOtpHint(''); }}
            >
              ← Resend OTP / Change Email
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--focus)' }}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

