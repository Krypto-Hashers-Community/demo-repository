// GitHub API Configuration
const GITHUB_API = 'https://api.github.com';
const ORG_NAME = 'Krypto-Hashers-Community';

// Fetch organization data
async function fetchOrgData() {
    try {
        const response = await fetch(`${GITHUB_API}/orgs/${ORG_NAME}`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching org data:', error);
        return null;
    }
}

// Fetch members data
async function fetchMembers() {
    try {
        const response = await fetch(`${GITHUB_API}/orgs/${ORG_NAME}/members`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        const members = await response.json();
        return await Promise.all(members.map(async member => {
            const userResponse = await fetch(member.url, {
                headers: {
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                }
            });
            return await userResponse.json();
        }));
    } catch (error) {
        console.error('Error fetching members:', error);
        return [];
    }
}

// Fetch repositories data
async function fetchRepositories() {
    try {
        const response = await fetch(`${GITHUB_API}/orgs/${ORG_NAME}/repos`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        const repos = await response.json();
        return await Promise.all(repos.map(async repo => {
            const [contributors, languages] = await Promise.all([
                fetchRepoContributors(repo.name),
                fetchRepoLanguages(repo.name)
            ]);
            return { ...repo, contributors, languages };
        }));
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
    }
}

// Fetch repository contributors
async function fetchRepoContributors(repoName) {
    try {
        const response = await fetch(`${GITHUB_API}/repos/${ORG_NAME}/${repoName}/contributors`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error(`Error fetching contributors for ${repoName}:`, error);
        return [];
    }
}

// Fetch repository languages
async function fetchRepoLanguages(repoName) {
    try {
        const response = await fetch(`${GITHUB_API}/repos/${ORG_NAME}/${repoName}/languages`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error(`Error fetching languages for ${repoName}:`, error);
        return {};
    }
}

// Fetch community statistics
async function fetchCommunityStats() {
    try {
        const [org, members, repos] = await Promise.all([
            fetchOrgData(),
            fetchMembers(),
            fetchRepositories()
        ]);

        const stats = {
            totalMembers: members.length,
            totalRepos: repos.length,
            totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
            totalContributions: repos.reduce((sum, repo) => sum + (repo.contributors?.length || 0), 0),
            languages: repos.reduce((acc, repo) => {
                Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
                    acc[lang] = (acc[lang] || 0) + bytes;
                });
                return acc;
            }, {})
        };

        return stats;
    } catch (error) {
        console.error('Error fetching community stats:', error);
        return null;
    }
}

// Export functions
export {
    fetchOrgData,
    fetchMembers,
    fetchRepositories,
    fetchCommunityStats
}; 