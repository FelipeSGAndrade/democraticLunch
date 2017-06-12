'use strict';

const Boom = require('boom');
const SecurityManager = require('./libs/securityManager');
const Plugins = require('./config/plugins');
const Config = require('./config/config');
const Hapi = require('hapi');
const Routes = require('./routes');

const UserRepository = require('./resources/user/repository');

const server = new Hapi.Server();

server.connection({
    host: Config.server.host,
    port: Config.server.port,
    labels: ['api']
});

server.register(Plugins, (err) => {

    if (err) {
        console.log(err);
    }
});

server.auth.strategy('token', 'jwt', {
    key: Config.security.key,
    validateFunc: (request, decodedData, callback) => {

        try {
            const userId = SecurityManager.decrypt(decodedData.encryptedUserId);

            const filter = {
                _id: userId
            };

            UserRepository.findSingle(filter)
              .then((user) => {

                  if (!user) {
                      return callback(Boom.notFound('User not found'), false, null);
                  }

                  callback(null, true, { userId: userId });
              });
        }
        catch (error) {
            callback(error, false, null);
        }
    },
    verifyOptions: {
        maxAge: Config.security.tokenMaxAge,
        algorithms: [
            Config.security.algorithm
        ]
    }
});

server.ext('onPreResponse', (request, reply) => {

    const response = request.response;
    const statusCode = response.statusCode || response.output.statusCode;

    if (statusCode < 400 || Config.isEnvironment('test')) {
        return reply.continue();
    }

    console.log(response);
    return reply.continue();
});

Routes.getRoutes().forEach((route) => {

    server.route(route);
});

const start = () => {

    server.start((err) => {

        if (err) {
            console.log(err);
        }

        server.log('info', 'server running at: ' + server.info.uri + ' using environment: ' + Config.getEnvironment());
    });

};

const stop = (reason) => {

    server.log('info', 'server stopping: ' + reason);
    server.stop();
};


module.exports = {
    start: start,
    stop: stop,
    server: server
};
