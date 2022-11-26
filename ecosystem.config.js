/* eslint-disable prettier/prettier */
module.exports = {
    apps : [{
      name: 'Bigland',
      script: 'dist/main.js',
      instances: 5,
      autorestart: true,
      watch: false
    }],
}