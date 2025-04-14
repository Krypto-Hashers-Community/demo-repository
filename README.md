# Krypto Hashers Community Website

The official website for the Krypto Hashers Community, showcasing our projects, members, and community initiatives.

## 🌐 Website

Visit our website at: https://krypto-hashers-community.github.io/demo-repository/

## 🛠️ Development

This is a static website built with HTML, CSS, and JavaScript. It uses the GitHub API to dynamically fetch and display:
- Organization repositories
- Member profiles
- Community statistics

### API Configuration

For security reasons, API keys are not stored in the repository. To set up the API:

1. Copy `config.template.js` to `config.js`
2. Add your API keys to `config.js`
3. Never commit `config.js` to the repository

Example:
```javascript
// config.js
const config = {
    apiKey: 'your_actual_api_key_here'
};
```

## 🚀 Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by GitHub Actions using the workflow defined in `.github/workflows/deploy.yml`.

### Secure API Key Deployment
For production deployment, set up your API keys as GitHub Secrets:

1. Go to your repository Settings > Secrets and Variables > Actions
2. Add your API keys as new secrets
3. The deployment workflow will handle them securely

To deploy locally for testing:
1. Clone the repository
2. Create `config.js` with your API keys
3. Open `index.html` in your browser

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
