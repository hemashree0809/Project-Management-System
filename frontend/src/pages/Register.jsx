import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff, Check } from 'lucide-react';

/**
 * Helper to render individual password rules
 */
const renderRule = (isValid, label) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: isValid ? '#059669' : '#94a3b8',
        fontSize: '0.85rem',
        marginTop: '6px',
        transition: 'color 0.25s ease',
      }}
    >
      {isValid ? (
        <Check size={14} strokeWidth={3} />
      ) : (
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#94a3b8',
            margin: '4px',
          }}
        />
      )}
      <span>{label}</span>
    </div>
  );
};

/**
 * Registration Page screen.
 */
const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Email validation regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  // Password rules validation states
  const pwdMinLength = password.length >= 8;
  const pwdUppercase = /[A-Z]/.test(password);
  const pwdLowercase = /[a-z]/.test(password);
  const pwdNumber = /[0-9]/.test(password);
  const pwdSpecial = /[!@#$%^&*(),.?":{}|<>]/;
  const hasSpecial = pwdSpecial.test(password);

  const isFormValid =
    fullName.trim() !== '' &&
    isEmailValid &&
    pwdMinLength &&
    pwdUppercase &&
    pwdLowercase &&
    pwdNumber &&
    hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isFormValid) {
      setError('Please satisfy all registration requirements before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await register(fullName, email, password);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="stat-icon primary" style={{ margin: '0 auto 16px auto' }}>
            <UserPlus size={28} />
          </div>
          <h1>Create Account</h1>
          <p>Get started by creating your account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
            {email !== '' && !isEmailValid && (
              <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '6px' }}>
                Please enter a valid email address.
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={submitting}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div style={{ marginTop: '12px' }}>
              {renderRule(pwdMinLength, 'Minimum 8 characters')}
              {renderRule(pwdUppercase, '1 uppercase letter')}
              {renderRule(pwdLowercase, '1 lowercase letter')}
              {renderRule(pwdNumber, '1 number')}
              {renderRule(hasSpecial, '1 special character')}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            disabled={submitting || !isFormValid}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.2)', borderTopColor: '#fff', margin: 0 }}></span>
                <span>Registering...</span>
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
