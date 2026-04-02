import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../auth/AuthContext';

function formatNumber(num) {
  if (num == null) return '';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

function stripNullish(s) {
  return s == null ? '' : String(s);
}

export default function DashboardPage() {
  const location = useLocation();
  const { userName } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [socialData, setSocialData] = useState(null);
  const [error, setError] = useState(null);

  const socialAccounts = dashboard?.socialAccounts || null;
  const socialConnected = useMemo(() => {
    return Boolean(
      socialAccounts &&
        (socialAccounts.instagramUsername || socialAccounts.twitterUsername || socialAccounts.linkedinUsername),
    );
  }, [socialAccounts]);

  // Connect form fields
  const [instagramUsername, setInstagramUsername] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [savingSocial, setSavingSocial] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/api/dashboard');
        if (!mounted) return;
        setDashboard(data);
        setInstagramUsername(data?.socialAccounts?.instagramUsername || '');
        setTwitterUsername(data?.socialAccounts?.twitterUsername || '');
        setLinkedinUsername(data?.socialAccounts?.linkedinUsername || '');
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!socialConnected) return;
    (async () => {
      try {
        const data = await apiFetch('/get_social');
        if (!mounted) return;
        setSocialData(data);
      } catch {
        if (!mounted) return;
        setSocialData(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [socialConnected]);

  const onConnect = async (e) => {
    e.preventDefault();
    setSavingSocial(true);
    setError(null);
    try {
      await apiFetch('/connect_social', {
        method: 'POST',
        body: {
          instagram_username: instagramUsername.trim(),
          twitter_username: twitterUsername.trim(),
          linkedin_username: linkedinUsername.trim(),
        },
      });

      const refreshed = await apiFetch('/api/dashboard');
      setDashboard(refreshed);
      setInstagramUsername(refreshed?.socialAccounts?.instagramUsername || '');
      setTwitterUsername(refreshed?.socialAccounts?.twitterUsername || '');
      setLinkedinUsername(refreshed?.socialAccounts?.linkedinUsername || '');

      const s = await apiFetch('/get_social');
      setSocialData(s);
    } catch (e2) {
      setError(e2?.message || 'Failed to save social connections');
    } finally {
      setSavingSocial(false);
    }
  };

  const activeLink = (path) => (location.pathname === path ? 'active' : '');

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
        <header style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: '2em', marginBottom: 10 }}>
            Welcome back, {dashboard?.userName || userName || 'User'}!
          </h1>
          <p className="subtitle">Here's your marketing overview</p>
        </header>

        {loading ? (
          <div className="card" style={{ padding: 30 }}>Loading...</div>
        ) : error ? (
          <div className="card" style={{ padding: 30, color: 'var(--text-secondary)' }}>
            {error}
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Generations</h3>
                <div className="stat-value">{dashboard?.stats?.totalGenerations ?? 0}</div>
              </div>
              <div className="stat-card">
                <h3>Campaigns Created</h3>
                <div className="stat-value">{dashboard?.stats?.campaigns ?? 0}</div>
              </div>
              <div className="stat-card">
                <h3>Pitches Generated</h3>
                <div className="stat-value">{dashboard?.stats?.pitches ?? 0}</div>
              </div>
              <div className="stat-card">
                <h3>Leads Scored</h3>
                <div className="stat-value">{dashboard?.stats?.leads ?? 0}</div>
              </div>
            </div>

            {!socialConnected ? (
              <div className="card" style={{ marginBottom: 30 }}>
                <h2 style={{ marginBottom: 20 }}>Connect Your Social Media Accounts</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                  No social accounts connected yet. Add your usernames to load analytics.
                </p>

                <form id="dashboard-social-form" onSubmit={onConnect}>
                  <div className="form-group">
                    <label htmlFor="dashboard-instagram">📷 Instagram Username</label>
                    <input
                      type="text"
                      id="dashboard-instagram"
                      name="instagram_username"
                      placeholder="e.g., yourusername"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dashboard-twitter">🐦 X (Twitter) Username</label>
                    <input
                      type="text"
                      id="dashboard-twitter"
                      name="twitter_username"
                      placeholder="e.g., yourusername"
                      value={twitterUsername}
                      onChange={(e) => setTwitterUsername(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dashboard-linkedin">💼 LinkedIn Username or Profile</label>
                    <input
                      type="text"
                      id="dashboard-linkedin"
                      name="linkedin_username"
                      placeholder="e.g., yourname or company-name"
                      value={linkedinUsername}
                      onChange={(e) => setLinkedinUsername(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={savingSocial}>
                    {savingSocial ? 'Saving...' : 'Save Connections'}
                  </button>
                </form>
              </div>
            ) : (
              socialData && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ marginBottom: 20, fontSize: '1.8em' }}>Social Media Analytics</h2>
                  <div className="analytics-grid" id="social-analytics-grid">
                    {socialData?.analytics?.instagram ? (
                      <div className="analytics-card">
                        <h3>📷 Instagram</h3>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: 15, fontSize: '0.9em' }}>
                          @{stripNullish(socialData.analytics.instagram.username)}
                        </div>
                        <div className="analytics-metrics">
                          <div className="metric">
                            <div className="metric-label">Followers</div>
                            <div className="metric-value">{formatNumber(socialData.analytics.instagram.followers)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Posts</div>
                            <div className="metric-value">{socialData.analytics.instagram.posts ?? 0}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Growth</div>
                            <div className="metric-value">
                              +{socialData.analytics.instagram.growth ?? 0}%
                            </div>
                          </div>
                        </div>
                        {socialData.analytics.instagram.bio ? (
                          <div style={{ marginTop: 15, color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                            {socialData.analytics.instagram.bio}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {socialData?.analytics?.twitter ? (
                      <div className="analytics-card">
                        <h3>🐦 X (Twitter)</h3>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: 15, fontSize: '0.9em' }}>
                          @{stripNullish(socialData.analytics.twitter.username)}
                        </div>
                        <div className="analytics-metrics">
                          <div className="metric">
                            <div className="metric-label">Followers</div>
                            <div className="metric-value">{formatNumber(socialData.analytics.twitter.followers)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Tweets</div>
                            <div className="metric-value">{socialData.analytics.twitter.tweets ?? 0}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Growth</div>
                            <div className="metric-value">
                              +{socialData.analytics.twitter.growth ?? 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {socialData?.analytics?.linkedin ? (
                      <div className="analytics-card">
                        <h3>💼 LinkedIn</h3>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: 15, fontSize: '0.9em' }}>
                          {stripNullish(socialData.analytics.linkedin.username)}
                        </div>
                        <div className="analytics-metrics">
                          <div className="metric">
                            <div className="metric-label">Followers</div>
                            <div className="metric-value">{formatNumber(socialData.analytics.linkedin.followers)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Posts</div>
                            <div className="metric-value">{socialData.analytics.linkedin.posts ?? 0}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Growth</div>
                            <div className="metric-value">
                              +{socialData.analytics.linkedin.growth ?? 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {socialData && Object.keys(socialData.analytics || {}).length === 0 ? (
                      <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 30 }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Analytics are being loaded for your connected accounts.</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            )}

            <div className="quick-actions">
              <Link to="/generator" className="btn-primary" style={{ width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
                Generate Campaign
              </Link>
              <Link to="/generator" className="btn-primary" style={{ width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
                Generate Pitch
              </Link>
              <Link to="/generator" className="btn-primary" style={{ width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
                Score Lead
              </Link>
              <Link to="/chatbot" className="btn-primary" style={{ width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
                Ask Chatbot
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 }}>
              <div className="activity-list">
                <h2 style={{ marginBottom: 20 }}>Recent Generations</h2>
                {dashboard?.stats?.recentActivity?.length ? (
                  dashboard.stats.recentActivity.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <div>
                        <span className="activity-type">{String(activity.type || '').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</span>
                        <div className="activity-date">{activity.createdAt}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>No recent activity</p>
                )}
              </div>

              <div className="activity-list">
                <h2 style={{ marginBottom: 20 }}>Recent Chats</h2>
                {dashboard?.recentChats?.length ? (
                  dashboard.recentChats.slice(0, 5).map((chat, idx) => {
                    const preview = (chat.message || '').length > 50 ? (chat.message || '').slice(0, 50) + '...' : chat.message || '';
                    const isUser = chat.role === 'user';
                    return (
                      <div key={idx} className="activity-item">
                        <div>
                          <span className="activity-type" style={{ color: isUser ? 'var(--accent-blue)' : 'var(--accent-purple)' }}>
                            {isUser ? 'User' : 'Assistant'}
                          </span>
                          <div className="activity-date" style={{ fontSize: '0.85em', marginTop: 5, color: 'var(--text-primary)' }}>
                            {preview}
                          </div>
                          <div className="activity-date">{chat.timestamp}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>No recent chats</p>
                    <div style={{ textAlign: 'center' }}>
                      <Link to="/chatbot" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
                        Start Chatting →
                      </Link>
                    </div>
                  </>
                )}
                {dashboard?.recentChats?.length ? (
                  <div style={{ textAlign: 'center', marginTop: 15 }}>
                    <Link to="/chatbot" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
                      View All Chats →
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

