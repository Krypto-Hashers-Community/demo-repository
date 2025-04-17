import { fetchOrgData, fetchMembers, fetchRepositories, fetchCommunityStats } from './api.js';

// Function to set favicon
function setFavicon(url) {
    const head = document.head || document.getElementsByTagName('head')[0];
    const existingFavicon = document.getElementById('favicon');
    
    if (existingFavicon) {
        head.removeChild(existingFavicon);
    }

    const favicon = document.createElement('link');
    favicon.id = 'favicon';
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = url;
    head.appendChild(favicon);
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    return 'just now';
}

// Update community statistics
async function updateCommunityStats() {
    const stats = await fetchCommunityStats();
    if (!stats) return;

    // Update stats on home page
    const elements = {
        totalMembers: document.getElementById('total-members'),
        totalRepos: document.getElementById('total-repos'),
        totalContributions: document.getElementById('total-contributions'),
        totalStars: document.getElementById('total-stars')
    };

    Object.entries(elements).forEach(([key, element]) => {
        if (element) {
            element.textContent = formatNumber(stats[key]);
        }
    });

    // Update community page stats
    const communityStats = {
        'total-members-count': stats.totalMembers,
        'total-contributions-count': stats.totalContributions,
        'active-projects-count': stats.totalRepos,
        'total-commits': stats.totalContributions,
        'total-prs': stats.totalPRs || 0,
        'total-issues': stats.totalIssues || 0,
        'total-reviews': stats.totalReviews || 0,
        'total-repos-contributed': stats.totalRepos,
        'total-stars-earned': stats.totalStars
    };

    Object.entries(communityStats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = formatNumber(value);
        }
    });

    // Update language chart if on community page
    const languageStats = document.getElementById('language-stats');
    if (languageStats && stats.languages) {
        updateLanguageChart(stats.languages);
    }
}

// Update featured members
async function updateFeaturedMembers() {
    const members = await fetchMembers();
    if (!members.length) return;

    const featuredContainer = document.getElementById('featured-members-container');
    if (!featuredContainer) return;

    const featuredMembers = members
        .sort((a, b) => b.public_repos - a.public_repos)
        .slice(0, 6);

    featuredContainer.innerHTML = featuredMembers.map(member => `
        <div class="member-card">
            <img src="${member.avatar_url}" alt="${member.login}" class="member-avatar">
            <h3>${member.name || member.login}</h3>
            <p>${member.bio || 'Community Member'}</p>
            <div class="member-stats">
                <span>${member.public_repos} repos</span>
                <span>${member.followers} followers</span>
            </div>
            <a href="${member.html_url}" target="_blank" class="view-profile">View Profile</a>
        </div>
    `).join('');
}

// Update repositories
async function updateRepositories() {
    const repos = await fetchRepositories();
    if (!repos.length) return;

    // Update trending repositories
    const trendingContainer = document.getElementById('trending-repos');
    if (trendingContainer) {
        const trendingRepos = repos
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);

        trendingContainer.innerHTML = trendingRepos.map(repo => `
            <div class="repo-card">
                <h3>${repo.name}</h3>
                <p>${repo.description || 'No description available'}</p>
                <div class="repo-stats">
                    <span>${repo.stargazers_count} stars</span>
                    <span>${repo.forks_count} forks</span>
                    <span>${repo.language || 'Various'}</span>
                </div>
                <a href="${repo.html_url}" target="_blank" class="view-repo">View Repository</a>
            </div>
        `).join('');
    }

    // Update project categories if on projects page
    const categoryStats = {
        'blockchain-count': repos.filter(r => r.topics?.includes('blockchain')).length,
        'defi-count': repos.filter(r => r.topics?.includes('defi')).length,
        'tools-count': repos.filter(r => r.topics?.includes('tools')).length,
        'other-count': repos.filter(r => !r.topics?.some(t => ['blockchain', 'defi', 'tools'].includes(t))).length
    };

    Object.entries(categoryStats).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = formatNumber(count);
        }
    });
}

// Initialize page
async function initializePage() {
    const path = window.location.pathname;
    
    // Common updates for all pages
    await updateCommunityStats();

    // Page-specific updates
    if (path.includes('community.html')) {
        await updateFeaturedMembers();
    } else if (path.includes('projects.html')) {
        await updateRepositories();
    } else if (path.includes('home.html') || path === '/') {
        await Promise.all([
            updateFeaturedMembers(),
            updateRepositories()
        ]);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 