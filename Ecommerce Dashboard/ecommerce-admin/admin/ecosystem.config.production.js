// Production PM2 config - Use this after building the React app
// First run: npm run build
// Then: pm2 start ecosystem.config.production.js

module.exports = {
  apps: [
    {
      name: "ecom-admin",
      script: "serve",
      args: "-s build -l 4600",
      env: {
        NODE_ENV: "production",
        PM2_SERVE_PATH: "./build",
        PM2_SERVE_PORT: 4600
      },
      // Install serve first: npm install -g serve
      // Or use: npx serve -s build -l 4600
    }
  ]
};

