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

// Main initialization function
async function initializeApp() {
    try {
        // Get configuration from Netlify environment variables
        const config = {
            apiKey: process.env.GITHUB_TOKEN,
            orgName: 'Krypto-Hashers-Community'
        };

        if (!config.apiKey) {
            throw new Error('GitHub API token not found. Please set GITHUB_TOKEN in Netlify environment variables.');
        }

        console.log('Initializing GitHub API...');
        const api = new GitHubAPI(config);
        
        // Load organization data
        console.log('Fetching organization data...');
        const orgData = await api.fetchOrganizationData();
        if (orgData) {
            document.getElementById('total-repos').textContent = orgData.public_repos || '0';
            document.getElementById('total-members').textContent = orgData.followers || '0';
            
            // Set organization logo and favicon
            if (orgData.avatar_url) {
                document.getElementById('org-logo').src = orgData.avatar_url;
                setFavicon(orgData.avatar_url);
            }
        }

        // Load repositories
        console.log('Fetching repositories...');
        const repos = await api.fetchRepositories();
        if (repos && repos.length > 0) {
            const reposContainer = document.getElementById('repos-container');
            reposContainer.innerHTML = ''; // Clear loading state
            
            repos.forEach(repo => {
                const repoCard = document.createElement('div');
                repoCard.className = 'repo-card';
                repoCard.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="repo-stats">
                        <span class="stars">⭐ ${repo.stargazers_count}</span>
                        <span class="forks">🔀 ${repo.forks_count}</span>
                    </div>
                    <div class="repo-languages">
                        ${repo.language ? `<span class="language">${repo.language}</span>` : ''}
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="repo-link">View on GitHub</a>
                `;
                reposContainer.appendChild(repoCard);
            });
        }

        // Load members
        console.log('Fetching members...');
        const members = await api.fetchMembers();
        if (members && members.length > 0) {
            const membersContainer = document.getElementById('members-container');
            membersContainer.innerHTML = ''; // Clear loading state
            
            // Sort members: owners first, then by contributions
            const sortedMembers = members.sort((a, b) => {
                if (a.role === 'OWNER' && b.role !== 'OWNER') return -1;
                if (a.role !== 'OWNER' && b.role === 'OWNER') return 1;
                return (b.contributions || 0) - (a.contributions || 0);
            });

            // Display first 8 members
            const displayMembers = sortedMembers.slice(0, 8);
            displayMembers.forEach(member => {
                const memberCard = document.createElement('div');
                memberCard.className = 'member-card';
                memberCard.innerHTML = `
                    <img src="${member.avatar_url}" alt="${member.login}" class="member-avatar">
                    <h3>${member.name || member.login}</h3>
                    <p class="username">@${member.login}</p>
                    ${member.role === 'OWNER' ? '<span class="owner-badge">Owner</span>' : ''}
                    <p class="contributions">Contributions: ${member.contributions || 0}</p>
                    <a href="${member.html_url}" target="_blank" class="profile-link">View Profile</a>
                `;
                membersContainer.appendChild(memberCard);
            });

            // Add "View All" button if there are more members
            if (members.length > 8) {
                const viewAllButton = document.createElement('button');
                viewAllButton.className = 'view-all-button';
                viewAllButton.textContent = 'View All Members';
                viewAllButton.onclick = () => {
                    membersContainer.innerHTML = '';
                    members.forEach(member => {
                        const memberCard = document.createElement('div');
                        memberCard.className = 'member-card';
                        memberCard.innerHTML = `
                            <img src="${member.avatar_url}" alt="${member.login}" class="member-avatar">
                            <h3>${member.name || member.login}</h3>
                            <p class="username">@${member.login}</p>
                            ${member.role === 'OWNER' ? '<span class="owner-badge">Owner</span>' : ''}
                            <p class="contributions">Contributions: ${member.contributions || 0}</p>
                            <a href="${member.html_url}" target="_blank" class="profile-link">View Profile</a>
                        `;
                        membersContainer.appendChild(memberCard);
                    });
                    viewAllButton.remove();
                };
                membersContainer.appendChild(viewAllButton);
            }
        }

        // Load language statistics
        console.log('Fetching language statistics...');
        const languageStats = await api.fetchLanguageStats();
        if (languageStats) {
            const languagesContainer = document.getElementById('languages-container');
            languagesContainer.innerHTML = ''; // Clear loading state
            
            Object.entries(languageStats).forEach(([language, percentage]) => {
                const languageElement = document.createElement('div');
                languageElement.className = 'language-stat';
                languageElement.innerHTML = `
                    <span class="language-name">${language}</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%"></div>
                    </div>
                    <span class="percentage">${percentage}%</span>
                `;
                languagesContainer.appendChild(languageElement);
            });
        }

    } catch (error) {
        console.error('Error initializing application:', error);
        // Update all loading elements to show error
        document.querySelectorAll('.loading-spinner, [id$="-container"]').forEach(el => {
            el.innerHTML = `<div class="error-message">
                <p>Error: ${error.message}</p>
                <p>Please ensure the GITHUB_TOKEN is set in your Netlify environment variables.</p>
                <p>Go to: Netlify Dashboard → Site Settings → Environment Variables</p>
            </div>`;
        });
        // Update stat elements
        ['total-repos', 'total-stars', 'total-forks', 'languages-container'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'Error loading data';
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp(); 
} 