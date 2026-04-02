// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load social analytics only if accounts are connected
    loadSocialAnalytics();
    
    // Handle connect form if it exists
    const connectForm = document.getElementById('dashboard-social-form');
    if (connectForm) {
        connectForm.addEventListener('submit', handleConnectForm);
    }
});

async function loadSocialAnalytics() {
    const analyticsGrid = document.getElementById('social-analytics-grid');
    if (!analyticsGrid) return; // Analytics section not shown (no accounts connected)
    
    try {
        const response = await fetch('/get_social');
        const data = await response.json();
        
        // Check if accounts are connected
        if (data.accounts && (data.accounts.instagram_username || data.accounts.twitter_username || data.accounts.linkedin_username)) {
            // Only show analytics if we have actual analytics data
            if (data.analytics && Object.keys(data.analytics).length > 0) {
                displayAnalytics(data.analytics);
            } else {
                // Accounts connected but analytics not available yet or failed to load
                analyticsGrid.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 30px;">
                        <p style="color: var(--text-secondary);">
                            Analytics are being loaded for your connected accounts. 
                            This may take a few moments.
                        </p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to load social analytics:', error);
        const analyticsGrid = document.getElementById('social-analytics-grid');
        if (analyticsGrid) {
            analyticsGrid.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 30px;">
                    <p style="color: var(--text-secondary);">
                        Unable to load analytics at this time. Please try again later.
                    </p>
                </div>
            `;
        }
    }
}

function displayAnalytics(analytics) {
    const analyticsGrid = document.getElementById('social-analytics-grid');
    if (!analyticsGrid) return;
    
    analyticsGrid.innerHTML = ''; // Clear existing cards
    
    // Only show cards for platforms with actual analytics data (not null)
    // Instagram analytics card
    if (analytics.instagram && analytics.instagram !== null) {
        const insta = analytics.instagram;
        const card = createAnalyticsCard(
            '📷 Instagram',
            '@' + (insta.username || ''),
            {
                'Followers': formatNumber(insta.followers || 0),
                'Posts': insta.posts || 0,
                'Growth': '+' + (insta.growth || 0) + '%'
            },
            insta.bio ? insta.bio : null
        );
        analyticsGrid.appendChild(card);
    }
    
    // Twitter analytics card
    if (analytics.twitter && analytics.twitter !== null) {
        const twitter = analytics.twitter;
        const card = createAnalyticsCard(
            '🐦 X (Twitter)',
            '@' + (twitter.username || ''),
            {
                'Followers': formatNumber(twitter.followers || 0),
                'Tweets': twitter.tweets || 0,
                'Growth': '+' + (twitter.growth || 0) + '%'
            }
        );
        analyticsGrid.appendChild(card);
    }
    
    // LinkedIn analytics card
    if (analytics.linkedin && analytics.linkedin !== null) {
        const linkedin = analytics.linkedin;
        const card = createAnalyticsCard(
            '💼 LinkedIn',
            linkedin.username || '',
            {
                'Followers': formatNumber(linkedin.followers || 0),
                'Posts': linkedin.posts || 0,
                'Growth': '+' + (linkedin.growth || 0) + '%'
            }
        );
        analyticsGrid.appendChild(card);
    }
}

function createAnalyticsCard(title, username, metrics, bio = null) {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    let metricsHTML = '<div class="analytics-metrics">';
    for (const [label, value] of Object.entries(metrics)) {
        metricsHTML += `
            <div class="metric">
                <div class="metric-label">${label}</div>
                <div class="metric-value">${value}</div>
            </div>
        `;
    }
    metricsHTML += '</div>';
    
    if (bio) {
        metricsHTML += `<div style="margin-top: 15px; color: var(--text-secondary); font-size: 0.9em;">${bio}</div>`;
    }
    
    card.innerHTML = `
        <h3>${title}</h3>
        <div style="color: var(--text-secondary); margin-bottom: 15px; font-size: 0.9em;">${username}</div>
        ${metricsHTML}
    `;
    
    return card;
}

async function handleConnectForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    
    try {
        const response = await fetch('/connect_social', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instagram_username: document.getElementById('dashboard-instagram').value.trim(),
                twitter_username: document.getElementById('dashboard-twitter').value.trim(),
                linkedin_username: document.getElementById('dashboard-linkedin').value.trim()
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload page to show updated state
            window.location.reload();
        } else {
            alert('Error: ' + (data.error || 'Failed to connect accounts'));
            submitButton.disabled = false;
            submitButton.textContent = 'Save Connections';
        }
    } catch (error) {
        alert('Error: ' + error.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Save Connections';
    }
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}


