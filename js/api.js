class GitHubAPI {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        this.orgName = 'Krypto-Hashers-Community';
        this.token = window.config.apiKey;
    }

    async fetchOrganizationData() {
        try {
            const response = await fetch(
                `${this.baseUrl}/orgs/${this.orgName}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch organization data: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching organization data:', error);
            return null;
        }
    }

    async fetchRepositories() {
        try {
            const response = await fetch(
                `${this.baseUrl}/orgs/${this.orgName}/repos?per_page=100&sort=updated`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch repositories: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return [];
        }
    }

    async fetchAllPages(url) {
        let allData = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const pageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${page}&per_page=100`;
            const response = await fetch(pageUrl, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }

            const data = await response.json();
            if (data.length === 0) {
                hasNextPage = false;
            } else {
                allData = allData.concat(data);
                page++;
            }
        }

        return allData;
    }

    async fetchMembers(role = 'all') {
        try {
            const url = `${this.baseUrl}/orgs/${this.orgName}/members?role=${role}`;
            return await this.fetchAllPages(url);
        } catch (error) {
            console.error('Error fetching members:', error);
            return [];
        }
    }

    async fetchOwners() {
        try {
            const url = `${this.baseUrl}/orgs/${this.orgName}/members?role=admin`;
            return await this.fetchAllPages(url);
        } catch (error) {
            console.error('Error fetching owners:', error);
            return [];
        }
    }

    async fetchMemberDetails(username) {
        try {
            const response = await fetch(
                `${this.baseUrl}/users/${username}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch member details: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching member details:', error);
            return {};
        }
    }

    async fetchMemberContributions(username) {
        try {
            const response = await fetch(
                `${this.baseUrl}/users/${username}/events?per_page=100`,
                { headers: this.headers }
            );
            const events = await response.json();
            return events.filter(event => 
                event.org?.login === window.config.orgName && 
                ['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(event.type)
            ).length;
        } catch (error) {
            console.error('Error fetching member contributions:', error);
            return 0;
        }
    }

    async fetchUserTotalContributions(username) {
        try {
            const query = `
            query {
                user(login: "${username}") {
                    contributionsCollection {
                        totalCommitContributions
                        totalIssueContributions
                        totalPullRequestContributions
                        totalPullRequestReviewContributions
                        restrictedContributionsCount
                    }
                }
            }`;

            const response = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                console.error('Error fetching contributions:', await response.text());
                return 0;
            }

            const data = await response.json();
            if (data.errors) {
                console.error('GraphQL Errors:', data.errors);
                return 0;
            }

            const contributions = data.data.user.contributionsCollection;
            const total = 
                contributions.totalCommitContributions +
                contributions.totalIssueContributions +
                contributions.totalPullRequestContributions +
                contributions.totalPullRequestReviewContributions +
                contributions.restrictedContributionsCount;

            return total;
        } catch (error) {
            console.error('Error fetching user contributions:', error);
            return 0;
        }
    }
} 