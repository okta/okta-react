---
to: ../samples/<%= dest %>/bs-config.js
force: true
---
module.exports = {
  port: 8080,
  logLevel: 'silent',
  files: ['./dist/**/*.{html,htm,css,js}'],
  server: { 
    baseDir: './dist',
    middleware: {
      0: null
    }
  },
  open: false
};
