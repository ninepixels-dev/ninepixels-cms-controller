'use strict';

npController.$inject = ['$cookies', '$window', 'assets', 'config'];
function npController($cookies, $window, assets, config) {
    return {
        templateUrl: config.client_url + 'np-controller/templates/controller.html',
        link: function (scope) {
            scope.user = $cookies.getObject('user');
            scope.config = config;

            scope.components = assets.getAsset('components');

            scope.checkForApp = function (app) {
                return _.find(scope.config.application.apps, function (val) {
                    return val === app;
                });
            };

            scope.logout = function () {
                $cookies.remove('token');
                $cookies.remove('user');
                $cookies.remove('page');
                $window.location.reload();
            };

            scope.reload = function () {
                $('#np-editor-iframe')[0].contentWindow.location.reload();
            };
        }
    };
}

angular.module('ninepixels.controller', ['angular.filter'])
        .directive('npController', npController);