// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const request = require('request');

module.exports = async (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  const get = (options) => {
    return new Promise((resolve, reject) => {
      request(options, (error, message) => {
        if (error || message.statusCode >= 400) {
          reject({ error, message });
        } else {
          resolve(JSON.parse(message.body));
        }
      });
    });
  };

  const requestOptions = {
    method: 'GET',
    url: config.env.loginUrl,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'client_credentials',
      client_id: config.env.clientId,
      client_secret: config.env.clientSecret,
      scope: config.env.authScope
    }
  };

  const authBody = await get(requestOptions);
  config.env.accessToken = authBody.access_token;
  config.env.authBody = JSON.stringify(authBody);

  return config;
};
