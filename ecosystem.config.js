module.exports = {
    apps: [
      {
        name: 'theflora',
        cwd: '/var/www/theflora',
        script: 'npm',
        args: 'start',
        watch: true,
        env: {
          NODE_ENV: 'development',
          
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 3032,
        },
      },
]
}
