import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RegisterPage() {
  const { loading, loggedIn, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!loading && loggedIn) navigate('/dashboard');
  }, [loading, loggedIn, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await register(name, email, password, confirm);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err?.message || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, marginTop: 80 }}>
      <header>
        <div className="header-content">
          <h1>MarketAI Suite</h1>
          <p className="subtitle">AI-Powered Sales & Marketing Platform</p>
        </div>
      </header>

      <div className="card">
        <h2>Create Account</h2>
        <p className="description">Sign up to get started</p>

        {localError && (
          <div className="error" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderColor: '#ef4444' }}>
            {localError}
          </div>
        )}

        <form method="POST" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Create Account</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

