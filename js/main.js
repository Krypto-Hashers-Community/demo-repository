// Function to wait for config to load
function waitForConfig(maxAttempts = 20) {
    return new Promise((resolve, reject) => {
        if (window.config) {
            console.log('Config already loaded!');
            return resolve(window.config);
        }

        let attempts = 0;
        const checkConfig = () => {
            attempts++;
            console.log(`Checking for config (attempt ${attempts})...`);
            
            if (window.config) {
                console.log('Config found!');
                resolve(window.config);
            } else if (attempts >= maxAttempts) {
                console.error('Available window properties:', Object.keys(window));
                reject(new Error('Config failed to load. Please check if the API key is set in GitHub Secrets.'));
            } else {
                setTimeout(checkConfig, 100);
            }
        };
        checkConfig();
    });
}

// Main initialization function
async function initializeApp() {
    try {
        // First check if we're in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Development mode detected, using local config...');
            window.config = {
                apiKey: 'YOUR_LOCAL_DEV_TOKEN', // Replace with your local token
                orgName: 'Krypto-Hashers-Community'
            };
        }

        console.log('Waiting for config to load...');
        await waitForConfig();
        console.log('Config loaded:', { 
            hasApiKey: !!window.config.apiKey, 
            orgName: window.config.orgName,
            isDev: window.location.hostname === 'localhost'
        });

        console.log('Initializing GitHub API...');
        const api = new GitHubAPI();
        
        // Load organization data
        console.log('Fetching organization data...');
        const orgData = await api.fetchOrganizationData();
        if (orgData) {
            document.getElementById('total-repos').textContent = orgData.public_repos || '0';
            document.getElementById('total-members').textContent = orgData.followers || '0';
        }

        // Load repositories
        console.log('Fetching repositories...');
        const repos = await api.fetchRepositories();
        const projectsContainer = document.getElementById('projects-container');
        if (repos.length > 0) {
            projectsContainer.innerHTML = repos.map(repo => `
                <div class="project-card">
                    <h3>
                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                        ${repo.fork ? '<span class="fork-label">(Forked)</span>' : ''}
                    </h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="repo-stats">
                        <span class="language">
                            ${repo.language ? `<span class="language-color ${repo.language.toLowerCase()}"></span>${repo.language}` : ''}
                        </span>
                        <span class="stars">⭐ ${repo.stargazers_count}</span>
                        <span class="forks">🔱 ${repo.forks_count}</span>
                    </div>
                </div>
            `).join('');
        } else {
            projectsContainer.innerHTML = '<p class="error-message">No repositories found</p>';
        }

        // Load members
        console.log('Fetching members...');
        const [owners, members] = await Promise.all([
            api.fetchOwners(),
            api.fetchMembers()
        ]);

        const membersContainer = document.getElementById('members-container');
        const allMembers = [...owners, ...members.filter(m => !owners.find(o => o.login === m.login))];
        
        if (allMembers.length > 0) {
            membersContainer.innerHTML = allMembers.map(member => `
                <div class="member-card">
                    <img src="${member.avatar_url}" alt="${member.login}'s avatar">
                    <h3><a href="${member.html_url}" target="_blank">${member.login}</a></h3>
                    ${owners.find(o => o.login === member.login) ? '<span class="owner-badge">Owner</span>' : ''}
                </div>
            `).join('');
        } else {
            membersContainer.innerHTML = '<p class="error-message">No members found</p>';
        }

        // Calculate total stats
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        document.getElementById('total-stars').textContent = totalStars;
        document.getElementById('total-forks').textContent = totalForks;

        // Calculate language stats
        const languages = repos.reduce((acc, repo) => {
            if (repo.language) {
                acc[repo.language] = (acc[repo.language] || 0) + 1;
            }
            return acc;
        }, {});

        const languagesContainer = document.getElementById('languages-container');
        languagesContainer.innerHTML = Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .map(([lang, count]) => `
                <div class="language-stat">
                    <span class="language-color ${lang.toLowerCase()}"></span>
                    ${lang}: ${count}
                </div>
            `).join('');

    } catch (error) {
        console.error('Error initializing application:', error);
        // Update all loading elements to show error
        document.querySelectorAll('.loading-spinner, [id$="-container"]').forEach(el => {
            el.innerHTML = `<div class="error-message">
                <p>Error: ${error.message}</p>
                <p>Please ensure the API_KEY secret is set in the GitHub repository settings.</p>
                <p>Go to: Repository Settings → Secrets and Variables → Actions → New Repository Secret</p>
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