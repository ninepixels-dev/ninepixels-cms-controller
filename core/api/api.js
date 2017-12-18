/* global templateCache */

'use strict';

apiService.$inject = ['$q', '$http', '$cookies', '$window', 'notify', 'token'];
function apiService($q, $http, $cookies, $window, notify, token) {

    /**
     * Call $http once url is resolved
     * @param {Object} config
     */
    function http(config) {
        return $q.when(config.url).then(function (url) {
            config.url = url;
            return $http(config);
        }).then(function (response) {
            return isOK(response) ? response.data : $q.reject(response);
        });
    }

    function isOK(response) {
        function isErrData(data) {
            return data && data._status && data._status === 'ERR';
        }

        return response.status >= 200 && response.status < 300 && !isErrData(response.data);
    }

    function errorCallback(response) {
        switch (response.status) {
            case - 1:
                notify.error('Request Timeout');
                return {status: 408, statusText: "Request Timeout"};
                break;

            case 401:
                notify.error(response.data.error_description);
                $cookies.remove('token');
                $cookies.remove('user');
                $window.location.reload();
                break;

            default:
                if (response.data.error.message)
                    notify.error(response.data.error.message);
                break;
        }

        return response;
    }

    var api = function (route) {
        return {
            fetch: function (item, params) {
                return http({
                    url: token.resolveUrl(route, item),
                    method: 'GET',
                    headers: token.getToken(),
                    params: params
                }).then(function (response) {
                    return response;
                }, function (response) {
                    errorCallback(response);
                });
            },
            add: function (params) {
                return http({
                    url: token.resolveUrl(route),
                    method: 'POST',
                    headers: token.getToken(),
                    data: params
                }).then(function (response) {
                    notify.success(response.message);
                    return response;
                }, errorCallback);
            },
            update: function (params) {
                return http({
                    url: token.resolveUrl(route, params),
                    method: 'PUT',
                    headers: token.getToken(),
                    data: params
                }).then(function (response) {
                    notify.success(response.message);
                    return response;
                }, errorCallback);
            },
            delete: function (item) {
                return http({
                    url: token.resolveUrl(route, item),
                    method: 'DELETE',
                    headers: token.getToken()
                }).then(function (response) {
                    notify.success(response.message);
                    return response;
                }, errorCallback);
            },
            login: function (username, password) {
                return http({
                    url: token.resolveAuthUrl(),
                    method: 'POST',
                    data: token.getAuthCred({
                        username: username,
                        password: password
                    })
                }).then(function (response) {
                    $cookies.putObject('token', response);
                }, errorCallback);
            },
            download: function (params) {
                return http({
                    url: token.resolveUrl(route),
                    method: 'GET',
                    headers: token.getToken(),
                    responseType: 'blob'
                }).then(function (response) {
                    return response;
                }, errorCallback);
            }
        };
    };

    return api;
}

angular.module('ninepixels.api', [])
        .service('api', apiService);
