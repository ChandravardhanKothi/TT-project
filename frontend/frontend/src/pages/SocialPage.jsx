import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/api';

function formatNumber(num) {
  if (num == null) return '';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'error' ? '#ef4444' : '#10b981'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add toast animation once (in case Generator page wasn't loaded yet).
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(style);
}

export default function SocialPage() {
  const location = useLocation();
  const activeLink = (path) => (location.pathname === path ? 'active' : '');

  const [instagramUsername, setInstagramUsername] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [linkedinUsername, setLinkedinUsername] = useState('');

  const [socialData, setSocialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const connected = useMemo(() => {
    const accounts = socialData?.accounts;
    if (!accounts) return false;
    return Boolean(accounts.instagram_username || accounts.twitter_username || accounts.linkedin_username);
  }, [socialData]);

  const loadSocialAnalytics = async () => {
    try {
      const data = await apiFetch('/get_social');
      setSocialData(data);
    } catch {
      setSocialData(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const dash = await apiFetch('/api/dashboard');
        if (!mounted) return;
        setInstagramUsername(dash?.socialAccounts?.instagramUsername || '');
        setTwitterUsername(dash?.socialAccounts?.twitterUsername || '');
        setLinkedinUsername(dash?.socialAccounts?.linkedinUsername || '');
        await loadSocialAnalytics();
      } catch {
        if (!mounted) return;
        setSocialData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onConnect = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/connect_social', {
        method: 'POST',
        body: {
          instagram_username: instagramUsername.trim(),
          twitter_username: twitterUsername.trim(),
          linkedin_username: linkedinUsername.trim(),
        },
      });
      if (!res?.success) throw new Error(res?.error || 'Failed');
      showToast('Social accounts connected successfully!', 'success');
      await loadSocialAnalytics();
    } catch (err) {
      showToast(err?.message || 'Failed to connect accounts', 'error');
    } finally {
      setSaving(false);
    }
  };

  const accounts = socialData?.accounts || null;
  const analytics = socialData?.analytics || {};

  return (
    <div>
      <div className="sidebar">
        <div className="sidebar-logo">MarketAI</div>
        <ul className="sidebar-nav">
          <li>
            <Link to="/dashboard" className={activeLink('/dashboard')}>Dashboard</Link>
          </li>
          <li>
            <Link to="/generator" className={activeLink('/generator')}>AI Generator</Link>
          </li>
          <li>
            <Link to="/chatbot" className={activeLink('/chatbot')}>Chatbot</Link>
          </li>
          <li>
            <Link to="/social" className={activeLink('/social')}>Social Accounts</Link>
          </li>
          <li>
            <a href="/api/logout" onClick={async (ev) => { ev.preventDefault(); await apiFetch('/api/logout', { method: 'POST' }); window.location.href = '/login'; }}>
              Logout
            </a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <header>
          <h1>Connect Your Social Media</h1>
          <p className="subtitle">Link your accounts to track analytics and share content</p>
        </header>

        <div className="card">
          <h2>Connect Social Media Accounts</h2>
          <p className="description">
            Enter your usernames to connect your social media accounts. We'll fetch basic analytics and enable quick sharing.
          </p>

          <form id="social-form" onSubmit={onConnect}>
            <div className="form-group">
              <label htmlFor="instagram_username">📷 Instagram Username</label>
              <input
                id="instagram_username"
                type="text"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                placeholder="e.g., yourusername"
              />
            </div>

            <div className="form-group">
              <label htmlFor="twitter_username">🐦 X (Twitter) Username</label>
              <input
                id="twitter_username"
                type="text"
                value={twitterUsername}
                onChange={(e) => setTwitterUsername(e.target.value)}
                placeholder="e.g., yourusername"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedin_username">💼 LinkedIn Username or Profile</label>
              <input
                id="linkedin_username"
                type="text"
                value={linkedinUsername}
                onChange={(e) => setLinkedinUsername(e.target.value)}
                placeholder="e.g., yourname or company-name"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Connections'}
            </button>
          </form>
        </div>

        <div style={{ display: loading ? 'none' : 'block' }}>
          {connected ? (
            <div id="connected-accounts">
              <h2 style={{ marginBottom: 20, marginTop: 30 }}>Connected Accounts</h2>
              <div className="analytics-grid">
                {/* Instagram */}
                <div
                  className="analytics-card"
                  id="instagram-card"
                  style={{
                    display: analytics.instagram || accounts?.instagram_username ? 'block' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                    <h3 style={{ margin: 0, marginRight: 10 }}>📷 Instagram</h3>
                    <span className="connection-status" style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: '0.8em' }}>
                      Connected
                    </span>
                  </div>
                  <div id="instagram-info">
                    <div className="analytics-metrics">
                      <div className="metric">
                        <div className="metric-label">Followers</div>
                        <div className="metric-value" id="instagram-followers">
                          {analytics.instagram ? formatNumber(analytics.instagram.followers) : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Posts</div>
                        <div className="metric-value" id="instagram-posts">
                          {analytics.instagram ? analytics.instagram.posts : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Growth</div>
                        <div className="metric-value" id="instagram-growth">
                          {analytics.instagram ? `+${analytics.instagram.growth}%` : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Username</div>
                        <div className="metric-value" id="instagram-username" style={{ fontSize: '1em' }}>
                          @{analytics.instagram ? analytics.instagram.username : accounts.instagram_username}
                        </div>
                      </div>
                    </div>
                    {analytics.instagram?.bio ? (
                      <div id="instagram-bio" style={{ marginTop: 15, color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                        {analytics.instagram.bio}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Twitter */}
                <div
                  className="analytics-card"
                  id="twitter-card"
                  style={{
                    display: analytics.twitter || accounts?.twitter_username ? 'block' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                    <h3 style={{ margin: 0, marginRight: 10 }}>🐦 X (Twitter)</h3>
                    <span className="connection-status" style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: '0.8em' }}>
                      Connected
                    </span>
                  </div>
                  <div id="twitter-info">
                    <div className="analytics-metrics">
                      <div className="metric">
                        <div className="metric-label">Followers</div>
                        <div className="metric-value" id="twitter-followers">
                          {analytics.twitter ? formatNumber(analytics.twitter.followers) : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Tweets</div>
                        <div className="metric-value" id="twitter-tweets">
                          {analytics.twitter ? analytics.twitter.tweets : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Growth</div>
                        <div className="metric-value" id="twitter-growth">
                          {analytics.twitter ? `+${analytics.twitter.growth}%` : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Username</div>
                        <div className="metric-value" id="twitter-username" style={{ fontSize: '1em' }}>
                          @{analytics.twitter ? analytics.twitter.username : accounts.twitter_username}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div
                  className="analytics-card"
                  id="linkedin-card"
                  style={{
                    display: analytics.linkedin || accounts?.linkedin_username ? 'block' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                    <h3 style={{ margin: 0, marginRight: 10 }}>💼 LinkedIn</h3>
                    <span className="connection-status" style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: '0.8em' }}>
                      Connected
                    </span>
                  </div>
                  <div id="linkedin-info">
                    <div className="analytics-metrics">
                      <div className="metric">
                        <div className="metric-label">Followers</div>
                        <div className="metric-value" id="linkedin-followers">
                          {analytics.linkedin ? formatNumber(analytics.linkedin.followers) : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Posts</div>
                        <div className="metric-value" id="linkedin-posts">
                          {analytics.linkedin ? analytics.linkedin.posts : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Growth</div>
                        <div className="metric-value" id="linkedin-growth">
                          {analytics.linkedin ? `+${analytics.linkedin.growth}%` : '-'}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Connections</div>
                        <div className="metric-value" id="linkedin-connections">
                          {analytics.linkedin ? formatNumber(analytics.linkedin.connections) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

