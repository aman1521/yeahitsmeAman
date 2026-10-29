module.exports = {
  apps: [
    {
      name: "ecom-admin",
      script: "npm",
      args: "start",
      env: {
        PORT: 4600,
        NODE_ENV: "production",
        DISABLE_ESLINT_PLUGIN: "true",
        BROWSER: "none"
      },
      // For production with built app, use this instead:
      // script: "serve",
      // args: "-s build -l 4600",
      // (requires: npm install -g serve)
      // (after running: npm run build)
    }
  ]
};
