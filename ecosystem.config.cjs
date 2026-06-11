module.exports = {
  apps: [{
    name: 'studenthub-plus',
    script: 'dist/server.cjs',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
};
