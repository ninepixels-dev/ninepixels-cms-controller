/* global _ */

'use strict';

login.$inject = ['config'];
function login(config) {
    return {
        controller: loginRegisterCtrl,
        templateUrl: config.client_url + 'np-controller/templates/login.html'
    };
}

loginRegisterCtrl.$inject = ['$scope', '$cookies', '$window', 'api', 'authentification'];
function loginRegisterCtrl($scope, $cookies, $window, api, authentification) {
    $scope.login = function () {
        $scope.isLoading = true;
        delete $scope.errorMsg;

        api().login($scope.username, $scope.password).then(function (response) {
            if (response && response.status >= 400 && response.status < 500) {
                $scope.isLoading = false;

                if (response.status === 400) {
                    $scope.errorMsg = 'Wrong credentials!';
                }

                if (response.status === 408) {
                    $scope.errorMsg = 'Request Timeout!';
                }

                return false;
            }

            authentification.getActiveUser().then(function (user) {
                $scope.isLoading = false;

                if (!user.username)
                    return $scope.errorMsg = 'User is not activated!';

                user.admin = !_.isEmpty(user.roles);
                $cookies.putObject('user', user);
                $window.location.pathname = '';
            });
        });
    };

}

angular.module('ninepixels.login', [])
        .directive('npLogin', login)
        .controller('npLogingisterCtrl', loginRegisterCtrl);