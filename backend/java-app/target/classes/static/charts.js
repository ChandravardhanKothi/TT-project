// Chart.js configuration and initialization
let charts = {};

function initCharts(data) {
    const platforms = data.platforms;
    const chartData = data.charts;
    
    // Chart.js default colors for dark theme
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.borderColor = '#334155';
    Chart.defaults.backgroundColor = 'rgba(139, 92, 246, 0.1)';
    
    // Instagram Engagement Chart
    if (document.getElementById('instagram-chart')) {
        const ctx = document.getElementById('instagram-chart').getContext('2d');
        charts.instagram = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.engagement.labels.slice(-7), // Last 7 days
                datasets: [{
                    label: 'Engagement Rate %',
                    data: chartData.engagement.instagram.slice(-7),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        grid: {
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }
    
    // LinkedIn Engagement Chart
    if (document.getElementById('linkedin-chart')) {
        const ctx = document.getElementById('linkedin-chart').getContext('2d');
        charts.linkedin = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.engagement.labels.slice(-7),
                datasets: [{
                    label: 'Engagement Rate %',
                    data: chartData.engagement.linkedin.slice(-7),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        grid: {
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }
    
    // Twitter Engagement Chart
    if (document.getElementById('twitter-chart')) {
        const ctx = document.getElementById('twitter-chart').getContext('2d');
        charts.twitter = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.engagement.labels.slice(-7),
                datasets: [{
                    label: 'Engagement Rate %',
                    data: chartData.engagement.twitter.slice(-7),
                    borderColor: '#1da1f2',
                    backgroundColor: 'rgba(29, 161, 242, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        grid: {
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }
    
    // Platform Comparison Chart
    if (document.getElementById('comparison-chart')) {
        const ctx = document.getElementById('comparison-chart').getContext('2d');
        charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Instagram', 'LinkedIn', 'X (Twitter)'],
                datasets: [
                    {
                        label: 'Followers',
                        data: [
                            platforms.instagram.followers,
                            platforms.linkedin.followers,
                            platforms.twitter.followers
                        ],
                        backgroundColor: [
                            'rgba(139, 92, 246, 0.6)',
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(29, 161, 242, 0.6)'
                        ],
                        borderColor: [
                            '#8b5cf6',
                            '#3b82f6',
                            '#1da1f2'
                        ],
                        borderWidth: 2
                    },
                    {
                        label: 'Engagement Rate %',
                        data: [
                            platforms.instagram.engagement_rate,
                            platforms.linkedin.engagement_rate,
                            platforms.twitter.engagement_rate
                        ],
                        backgroundColor: [
                            'rgba(139, 92, 246, 0.3)',
                            'rgba(59, 130, 246, 0.3)',
                            'rgba(29, 161, 242, 0.3)'
                        ],
                        borderColor: [
                            '#8b5cf6',
                            '#3b82f6',
                            '#1da1f2'
                        ],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#9ca3af'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    x: {
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }
}

