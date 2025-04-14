// GitHub API Configuration
const config = {
    // This placeholder will be replaced with the actual API key during deployment
    apiKey: 'YOUR_LOCAL_DEV_TOKEN',
    orgName: 'Krypto-Hashers-Community'
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.config = config;
} 