/* eslint-disable prettier/prettier */
module.exports = {
    apps : [{
      name: 'Bigland',
      script: 'dist/main.js',
      instances: 2,
      autorestart: true,
      watch: false
    }],
}