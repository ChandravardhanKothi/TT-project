import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { loading, loggedIn, login, error, setError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!loading && loggedIn) navigate('/dashboard');
  }, [loading, loggedIn, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.message || 'Login failed';
      setLocalError(msg);
      setError?.(msg);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, marginTop: 100 }}>
      <header>
        <div className="header-content">
          <h1>MarketAI Suite</h1>
          <p className="subtitle">AI-Powered Sales & Marketing Platform</p>
        </div>
      </header>

      <div className="card">
        <h2>Login</h2>
        <p className="description">Sign in to access your dashboard</p>

        {localError && (
          <div className="error" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderColor: '#ef4444' }}>
            {localError}
          </div>
        )}

        <form method="POST" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary">Login</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

