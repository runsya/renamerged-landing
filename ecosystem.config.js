module.exports = {
  apps: [
    {
      name: 'renamerged-fe',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/iuno/.pm2/logs',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'renamerged-be',
      script: 'server/index.js',
      cwd: '/home/iuno/.pm2/logs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
