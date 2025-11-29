// scripts/clone-repos.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const username = 'choijinwon';
const repos = [
  'promptedu',
  'vibe-coding-academy',
  'naver-blog-automation',
  'blog-hub',
  'shadcnui',
  'chapter-heard-01',
  'htmlCodeExample',
  'typescripblockchin',
  'graphql-ap',
  'vue-til-server',
  'vue-cli',
  'skinny-bones-jekyll',
  'todo-homeworks',
  'springboot-jpa',
  'learncoin',
  'altcryptomining',
  'ionic-site'
];

const baseDir = path.join(__dirname, '..', 'github-repos');

// Create base directory if it doesn't exist
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

console.log(`Cloning ${repos.length} repositories to ${baseDir}...\n`);

repos.forEach((repo, index) => {
  const repoUrl = `https://github.com/${username}/${repo}.git`;
  const repoPath = path.join(baseDir, repo);
  
  try {
    if (fs.existsSync(repoPath)) {
      console.log(`[${index + 1}/${repos.length}] ${repo} already exists, skipping...`);
      return;
    }
    
    console.log(`[${index + 1}/${repos.length}] Cloning ${repo}...`);
    execSync(`git clone ${repoUrl} "${repoPath}"`, { stdio: 'inherit' });
    console.log(`✓ Successfully cloned ${repo}\n`);
  } catch (error) {
    console.error(`✗ Failed to clone ${repo}: ${error.message}\n`);
  }
});

console.log('Done!');

