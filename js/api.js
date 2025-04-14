class GitHubAPI {
    constructor(config) {
        this.config = config;
        this.baseUrl = 'https://api.github.com';
        this.headers = {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/vnd.github.v3+json'
        };
    }

    async fetchOrganizationData() {
        try {
            const response = await fetch(`${this.baseUrl}/orgs/${this.config.orgName}`, {
                headers: this.headers
            });
            if (!response.ok) throw new Error(`Failed to fetch organization data: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching organization data:', error);
            return null;
        }
    }

    async fetchRepositories() {
        try {
            const response = await fetch(`${this.baseUrl}/orgs/${this.config.orgName}/repos`, {
                headers: this.headers
            });
            if (!response.ok) throw new Error(`Failed to fetch repositories: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return [];
        }
    }

    async fetchMembers() {
        try {
            const response = await fetch(`${this.baseUrl}/orgs/${this.config.orgName}/members`, {
                headers: this.headers
            });
            if (!response.ok) throw new Error(`Failed to fetch members: ${response.status}`);
            const members = await response.json();
            
            // Fetch contribution data for each member
            const membersWithContributions = await Promise.all(members.map(async member => {
                const contributionsResponse = await fetch(`${this.baseUrl}/users/${member.login}/contributions`, {
                    headers: this.headers
                });
                if (contributionsResponse.ok) {
                    const contributionsData = await contributionsResponse.json();
                    return {
                        ...member,
                        contributions: contributionsData.total || 0
                    };
                }
                return member;
            }));
            
            return membersWithContributions;
        } catch (error) {
            console.error('Error fetching members:', error);
            return [];
        }
    }

    async fetchLanguageStats() {
        try {
            const repos = await this.fetchRepositories();
            const languageStats = {};
            
            // Calculate total lines of code per language
            for (const repo of repos) {
                const response = await fetch(`${this.baseUrl}/repos/${this.config.orgName}/${repo.name}/languages`, {
                    headers: this.headers
                });
                if (response.ok) {
                    const languages = await response.json();
                    Object.entries(languages).forEach(([lang, lines]) => {
                        languageStats[lang] = (languageStats[lang] || 0) + lines;
                    });
                }
            }
            
            // Calculate percentages
            const totalLines = Object.values(languageStats).reduce((sum, lines) => sum + lines, 0);
            return Object.entries(languageStats).reduce((acc, [lang, lines]) => {
                acc[lang] = Math.round((lines / totalLines) * 100);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching language stats:', error);
            return {};
        }
    }
} 