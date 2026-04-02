// Tab switching functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Clear previous results
    clearResults();
}

function clearResults() {
    document.querySelectorAll('.result-container').forEach(result => {
        result.style.display = 'none';
    });
}

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.innerText || element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'var(--accent-purple)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

// Export content function
function exportContent(elementId, type) {
    const element = document.getElementById(elementId);
    const text = element.innerText || element.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketai-${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Social sharing functions
function shareToInstagram(elementId) {
    const element = document.getElementById(elementId);
    const text = element.innerText || element.textContent;
    
    // Copy text to clipboard
    navigator.clipboard.writeText(text).then(() => {
        // Show toast notification
        showToast('Caption copied to clipboard! Paste it in Instagram.', 'success');
        
        // Open Instagram in new tab
        setTimeout(() => {
            window.open('https://instagram.com', '_blank');
        }, 500);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy to clipboard', 'error');
    });
}

function shareToTwitter(elementId) {
    const element = document.getElementById(elementId);
    const text = element.innerText || element.textContent;
    
    // Truncate text to Twitter's character limit (280 chars)
    const tweetText = text.length > 280 ? text.substring(0, 277) + '...' : text;
    
    // Encode text for URL
    const encodedText = encodeURIComponent(tweetText);
    
    // Open Twitter share dialog
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
}

function shareToLinkedIn(elementId) {
    const element = document.getElementById(elementId);
    const text = element.innerText || element.textContent;
    
    // Encode text for URL
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(window.location.href);
    
    // Open LinkedIn share dialog
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`, '_blank');
}

// Toast notification function
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

// Add CSS for toast animation if not already present
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Marketing Campaign Form Handler
document.getElementById('campaign-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const resultContainer = document.getElementById('campaign-result');
    const resultContent = document.getElementById('campaign-content');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Generating Campaign...';
    resultContainer.style.display = 'block';
    resultContent.innerHTML = '<div class="spinner"></div><div class="loading">Generating your campaign strategy</div>';
    
    try {
        const response = await fetch('/generate-campaign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: document.getElementById('product').value,
                audience: document.getElementById('audience').value,
                platform: document.getElementById('platform').value
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultContent.innerHTML = data.campaign;
        } else {
            resultContent.innerHTML = `<div class="error">Error: ${data.error || 'Failed to generate campaign'}</div>`;
        }
    } catch (error) {
        resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Generate Campaign';
    }
});

// Sales Pitch Form Handler
document.getElementById('pitch-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const resultContainer = document.getElementById('pitch-result');
    const resultContent = document.getElementById('pitch-content');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Generating Pitch...';
    resultContainer.style.display = 'block';
    resultContent.innerHTML = '<div class="spinner"></div><div class="loading">Creating your personalized pitch</div>';
    
    try {
        const response = await fetch('/generate-pitch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: document.getElementById('pitch-product').value,
                customer: document.getElementById('customer').value
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultContent.innerHTML = data.pitch;
        } else {
            resultContent.innerHTML = `<div class="error">Error: ${data.error || 'Failed to generate pitch'}</div>`;
        }
    } catch (error) {
        resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Generate Pitch';
    }
});

// Lead Scoring Form Handler
document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const resultContainer = document.getElementById('lead-result');
    const scoreDisplay = document.getElementById('lead-score-display');
    const resultContent = document.getElementById('lead-content');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Scoring Lead...';
    resultContainer.style.display = 'block';
    scoreDisplay.innerHTML = '<div class="spinner"></div><div class="loading">Analyzing lead</div>';
    resultContent.innerHTML = '';
    
    try {
        const response = await fetch('/score-lead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                leadName: document.getElementById('leadName').value,
                budget: document.getElementById('budget').value,
                need: document.getElementById('need').value,
                urgency: document.getElementById('urgency').value
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Display score
            const score = data.score || 'N/A';
            let scoreClass = 'score-cold';
            if (score >= 90) scoreClass = 'score-hot';
            else if (score >= 75) scoreClass = 'score-warm';
            else if (score >= 60) scoreClass = 'score-lukewarm';
            
            scoreDisplay.className = `score-display ${scoreClass}`;
            scoreDisplay.innerHTML = `
                <div class="score-value">${score}</div>
                <div class="score-label">Lead Qualification Score</div>
            `;
            
            // Display analysis
            resultContent.innerHTML = data.analysis;
        } else {
            scoreDisplay.innerHTML = '';
            resultContent.innerHTML = `<div class="error">Error: ${data.error || 'Failed to score lead'}</div>`;
        }
    } catch (error) {
        scoreDisplay.innerHTML = '';
        resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Score Lead';
    }
});
