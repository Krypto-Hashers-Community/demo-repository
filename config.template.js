// Rename this file to config.js and add your API keys
const config = {
    // This will be replaced during deployment
    apiKey: 'YOUR_LOCAL_DEV_TOKEN',
    orgName: 'Krypto-Hashers-Community'
};

// Don't modify this
if (typeof window !== 'undefined') {
    window.config = config;
} 