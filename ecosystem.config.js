module.exports = {
  apps: [
    {
      name: 'renamerged',
      script: 'server/index.js',
      cwd: '/home/iuno/.pm2/logs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
