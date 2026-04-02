import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/api';

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

// Add toast animation once
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(style);
}

export default function GeneratorPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('campaign');

  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignHtml, setCampaignHtml] = useState('');

  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchHtml, setPitchHtml] = useState('');

  const [leadLoading, setLeadLoading] = useState(false);
  const [leadScore, setLeadScore] = useState(null);
  const [leadAnalysisHtml, setLeadAnalysisHtml] = useState('');
  const [leadError, setLeadError] = useState(null);

  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState('');

  const [pitchProduct, setPitchProduct] = useState('');
  const [customer, setCustomer] = useState('');

  const [leadName, setLeadName] = useState('');
  const [budget, setBudget] = useState('');
  const [need, setNeed] = useState('');
  const [urgency, setUrgency] = useState('');

  const active = useMemo(() => (tab) => (activeTab === tab ? 'tab-button active' : 'tab-button'), [activeTab]);
  const activeLink = (path) => (location.pathname === path ? 'active' : '');

  const copyToClipboard = async (html) => {
    const text = stripHtml(html);
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const exportContent = (html, type) => {
    const text = stripHtml(html);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketai-${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareToInstagram = async (html) => {
    await copyToClipboard(html);
    setTimeout(() => window.open('https://instagram.com', '_blank'), 300);
  };

  const shareToTwitter = (html) => {
    const text = stripHtml(html);
    const tweetText = text.length > 280 ? text.substring(0, 277) + '...' : text;
    const encodedText = encodeURIComponent(tweetText);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  };

  const shareToLinkedIn = (html) => {
    const text = stripHtml(html);
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
      '_blank',
    );
  };

  const submitCampaign = async (e) => {
    e.preventDefault();
    setCampaignLoading(true);
    try {
      const data = await apiFetch('/generate-campaign', {
        method: 'POST',
        body: { product, audience, platform },
      });
      if (!data?.success) throw new Error(data?.error || 'Failed to generate campaign');
      setCampaignHtml(data.campaign || '');
      setActiveTab('campaign');
    } catch (err) {
      setCampaignHtml(`<div class="error">Error: ${err?.message || 'Failed to generate campaign'}</div>`);
    } finally {
      setCampaignLoading(false);
    }
  };

  const submitPitch = async (e) => {
    e.preventDefault();
    setPitchLoading(true);
    try {
      const data = await apiFetch('/generate-pitch', {
        method: 'POST',
        body: { product: pitchProduct, customer },
      });
      if (!data?.success) throw new Error(data?.error || 'Failed to generate pitch');
      setPitchHtml(data.pitch || '');
      setActiveTab('pitch');
    } catch (err) {
      setPitchHtml(`<div class="error">Error: ${err?.message || 'Failed to generate pitch'}</div>`);
    } finally {
      setPitchLoading(false);
    }
  };

  const submitLead = async (e) => {
    e.preventDefault();
    setLeadLoading(true);
    setLeadError(null);
    try {
      const data = await apiFetch('/score-lead', {
        method: 'POST',
        body: { leadName, budget, need, urgency },
      });
      if (!data?.success) throw new Error(data?.error || 'Failed to score lead');

      setLeadScore(data?.score ?? null);
      setLeadAnalysisHtml(data?.analysis || '');
      setActiveTab('lead');
    } catch (err) {
      setLeadError(err?.message || 'Failed to score lead');
      setLeadAnalysisHtml(`<div class="error">Error: ${err?.message || 'Failed to score lead'}</div>`);
      setLeadScore(null);
    } finally {
      setLeadLoading(false);
    }
  };

  const leadScoreClass = useMemo(() => {
    const score = leadScore;
    if (score == null) return '';
    if (score >= 90) return 'score-hot';
    if (score >= 75) return 'score-warm';
    if (score >= 60) return 'score-lukewarm';
    return 'score-cold';
  }, [leadScore]);

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
          <div className="header-content">
            <h1>AI Generator</h1>
            <p className="subtitle">Create campaigns, pitches, and score leads</p>
          </div>
        </header>

        <nav className="tabs">
          <button className={active('campaign')} onClick={() => setActiveTab('campaign')} type="button">
            Marketing Campaign
          </button>
          <button className={active('pitch')} onClick={() => setActiveTab('pitch')} type="button">
            Sales Pitch
          </button>
          <button className={active('lead')} onClick={() => setActiveTab('lead')} type="button">
            Lead Score
          </button>
        </nav>

        {/* Campaign */}
        {activeTab === 'campaign' ? (
          <div id="campaign-tab" className="tab-content active">
            <div className="card">
              <h2>AI-Generated Marketing Campaign</h2>
              <p className="description">
                Generate comprehensive marketing strategies with targeted content ideas, ad copy variations, and CTA suggestions.
              </p>

              <form id="campaign-form" onSubmit={submitCampaign}>
                <div className="form-group">
                  <label htmlFor="product">Product/Service *</label>
                  <textarea id="product" name="product" rows="3" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g., AI-powered email marketing platform for e-commerce businesses" required />
                </div>

                <div className="form-group">
                  <label htmlFor="audience">Target Audience *</label>
                  <textarea id="audience" name="audience" rows="3" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., Small business owners, 25-45 years old, active on LinkedIn, interested in marketing automation" required />
                </div>

                <div className="form-group">
                  <label htmlFor="platform">Platform *</label>
                  <input id="platform" name="platform" type="text" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g., LinkedIn, Instagram, Facebook, Google Ads" required />
                </div>

                <button type="submit" className="btn-primary" disabled={campaignLoading}>
                  {campaignLoading ? 'Generating Campaign...' : 'Generate Campaign'}
                </button>
              </form>

              <div id="campaign-result" className="result-container" style={{ display: campaignHtml ? 'block' : 'none' }}>
                <h3>Your Campaign Strategy</h3>
                <div id="campaign-content" className="result-content" dangerouslySetInnerHTML={{ __html: campaignLoading ? '<div class="spinner"></div><div class="loading">Generating your campaign strategy</div>' : campaignHtml }} />

                <div className="action-buttons">
                  <button className="btn-copy" type="button" onClick={() => copyToClipboard(campaignHtml)}>Copy</button>
                  <button className="btn-export" type="button" onClick={() => exportContent(campaignHtml, 'campaign')}>Export</button>
                </div>

                <div className="social-share-buttons" style={{ marginTop: 15, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-share-instagram" type="button" onClick={() => shareToInstagram(campaignHtml)}>📷 Post to Instagram</button>
                  <button className="btn-share-twitter" type="button" onClick={() => shareToTwitter(campaignHtml)}>🐦 Post to X</button>
                  <button className="btn-share-linkedin" type="button" onClick={() => shareToLinkedIn(campaignHtml)}>💼 Post to LinkedIn</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Pitch */}
        {activeTab === 'pitch' ? (
          <div id="pitch-tab" className="tab-content active">
            <div className="card">
              <h2>Intelligent Sales Pitch Generator</h2>
              <p className="description">Create personalized, compelling pitches tailored to specific customer personas and use cases.</p>

              <form id="pitch-form" onSubmit={submitPitch}>
                <div className="form-group">
                  <label htmlFor="pitch-product">Product/Service *</label>
                  <textarea id="pitch-product" name="product" rows="3" value={pitchProduct} onChange={(e) => setPitchProduct(e.target.value)} placeholder="e.g., Cloud-based inventory management system" required />
                </div>

                <div className="form-group">
                  <label htmlFor="customer">Customer Persona *</label>
                  <textarea id="customer" name="customer" rows="3" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g., Operations Director, Fortune 500 retail company, scaling operations across 500 stores" required />
                </div>

                <button type="submit" className="btn-primary" disabled={pitchLoading}>
                  {pitchLoading ? 'Generating Pitch...' : 'Generate Pitch'}
                </button>
              </form>

              <div id="pitch-result" className="result-container" style={{ display: pitchHtml ? 'block' : 'none' }}>
                <h3>Your Sales Pitch</h3>
                <div id="pitch-content" className="result-content" dangerouslySetInnerHTML={{ __html: pitchHtml }} />

                <div className="action-buttons">
                  <button className="btn-copy" type="button" onClick={() => copyToClipboard(pitchHtml)}>Copy</button>
                  <button className="btn-export" type="button" onClick={() => exportContent(pitchHtml, 'pitch')}>Export</button>
                </div>

                <div className="social-share-buttons" style={{ marginTop: 15, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-share-instagram" type="button" onClick={() => shareToInstagram(pitchHtml)}>📷 Post to Instagram</button>
                  <button className="btn-share-twitter" type="button" onClick={() => shareToTwitter(pitchHtml)}>🐦 Post to X</button>
                  <button className="btn-share-linkedin" type="button" onClick={() => shareToLinkedIn(pitchHtml)}>💼 Post to LinkedIn</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Lead */}
        {activeTab === 'lead' ? (
          <div id="lead-tab" className="tab-content active">
            <div className="card">
              <h2>Lead Qualification & Scoring</h2>
              <p className="description">Identify and prioritize high-value leads with AI-powered scoring (0-100 scale).</p>

              <form id="lead-form" onSubmit={submitLead}>
                <div className="form-group">
                  <label htmlFor="leadName">Lead Name</label>
                  <input id="leadName" type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="e.g., Sarah Johnson" />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Budget Quality *</label>
                  <textarea id="budget" rows="2" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., $150,000 annual software budget, can approve deals up to $50,000" required />
                </div>

                <div className="form-group">
                  <label htmlFor="need">Business Need *</label>
                  <textarea id="need" rows="2" value={need} onChange={(e) => setNeed(e.target.value)} placeholder="e.g., Improving customer retention by 20%, reducing churn" required />
                </div>

                <div className="form-group">
                  <label htmlFor="urgency">Urgency Level *</label>
                  <textarea id="urgency" rows="2" value={urgency} onChange={(e) => setUrgency(e.target.value)} placeholder="e.g., Board of directors requested solution by end of Q3, high priority" required />
                </div>

                <button type="submit" className="btn-primary" disabled={leadLoading}>
                  {leadLoading ? 'Scoring Lead...' : 'Score Lead'}
                </button>
              </form>

              <div id="lead-result" className="result-container" style={{ display: leadAnalysisHtml ? 'block' : 'none' }}>
                <h3>Lead Qualification Analysis</h3>

                <div id="lead-score-display" className={`score-display ${leadScoreClass}`}>
                  {leadScore == null ? (
                    <div className="score-value">N/A</div>
                  ) : (
                    <>
                      <div className="score-value">{leadScore}</div>
                      <div className="score-label">Lead Qualification Score</div>
                    </>
                  )}
                </div>

                <div id="lead-content" className="result-content" dangerouslySetInnerHTML={{ __html: leadAnalysisHtml }} />

                <div className="action-buttons">
                  <button className="btn-copy" type="button" onClick={() => copyToClipboard(leadAnalysisHtml)}>Copy</button>
                  <button className="btn-export" type="button" onClick={() => exportContent(leadAnalysisHtml, 'lead')}>Export</button>
                </div>

                <div className="social-share-buttons" style={{ marginTop: 15, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-share-instagram" type="button" onClick={() => shareToInstagram(leadAnalysisHtml)}>📷 Post to Instagram</button>
                  <button className="btn-share-twitter" type="button" onClick={() => shareToTwitter(leadAnalysisHtml)}>🐦 Post to X</button>
                  <button className="btn-share-linkedin" type="button" onClick={() => shareToLinkedIn(leadAnalysisHtml)}>💼 Post to LinkedIn</button>
                </div>
              </div>

              {leadError && (
                <div style={{ marginTop: 15, color: 'var(--text-secondary)' }}>{leadError}</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

