'use strict';

tokenService.$inject = ['$cookies', 'config'];
function tokenService($cookies, config) {
    var params = {
        server_url: config.server_url,
        auth_url: 'oauth/v2/token',
        type: 'Bearer',
        grant_type: 'password',
        client_id: config.client_id,
        client_secret: config.client_secret
    };

    this.getAuthCred = function (data) {
        var header = {
            grant_type: params.grant_type,
            client_id: params.client_id,
            client_secret: params.client_secret
        };

        if (!data) {
            var data = {};
        }

        return _.extend(header, data);
    };

    this.getServerUrl = function () {
        return params.server_url;
    };

    this.resolveUrl = function (route, item) {
        var url = this.getServerUrl() + route;

        if (item) {
            url = url + '/' + item['id'];
        }

        return url;
    };

    this.resolveAuthUrl = function () {
        return params.server_url + params.auth_url;
    };

    this.getToken = function (data) {
        var token = $cookies.getObject('token');

        if (!data) {
            var data = {};
        }

        var tokenAuth = {
            Authorization: params.type + ' ' + token.access_token
        };

        return _.extend(data, tokenAuth);
    };
}

angular.module('ninepixels.api.token', [])
        .service('token', tokenService);