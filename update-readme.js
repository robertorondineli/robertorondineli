const axios = require('axios');
const fs = require('fs');
const path = require('path');

const githubUsername = 'robertorondineli';

const fetchGitHubStats = async () => {
  const userResponse = await axios.get(`https://api.github.com/users/${githubUsername}`);
  const reposResponse = await axios.get(`https://api.github.com/users/${githubUsername}/repos`);

  const { public_repos, followers } = userResponse.data;

  const stars = reposResponse.data.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const languages = {};

  for (const repo of reposResponse.data) {
    const langResponse = await axios.get(repo.languages_url);
    for (const [lang, count] of Object.entries(langResponse.data)) {
      languages[lang] = (languages[lang] || 0) + count;
    }
  }

  const languageStats = Object.entries(languages).map(([lang, count]) => `${lang}: ${count}`).join('\n');

  return {
    public_repos,
    followers,
    stars,
    languageStats
  };
};

const updateReadme = async () => {
  const stats = await fetchGitHubStats();

  const readmeContent = `
# Meu Perfil no GitHub

Olá, eu sou Roberto Rondineli, desenvolvedor backend.

## Estatísticas do GitHub

- **Repositórios Públicos:** ${stats.public_repos}
- **Seguidores:** ${stats.followers}
- **Estrelas:** ${stats.stars}

## Linguagens Utilizadas

${stats.languageStats}
  `;

  fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent, 'utf8');
};

updateReadme();
