/* global _ */

'use strict';

npUsersController.$inject = ['$scope', '$cookies', 'api', 'modalDialog', 'assets', 'config'];
function npUsersController($scope, $cookies, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.users = assets.getAsset('users');
        $scope.currentUser = $cookies.getObject('user');

        $scope.status = {
            view: 'list'
        };

        return $scope.modal = modalDialog.showModal({
            controller: 'npUsersCtrl',
            controllerAs: 'ctrl',
            scope: $scope,
            size: 'md',
            templateUrl: config.client_url + 'np-controller/templates/users-dialog.html'
        });
    };

    this.addNew = function () {
        return $scope.status.view = 'form';
    };

    this.update = function (_user) {
        _user.admin = !_.isEmpty(_user.roles);
        delete _user.password;

        $scope.status.view = 'form';

        return $scope._user = _user;
    };

    this.save = function (_user) {
        return _user.id ?
                api('users').update(_user).then(callback) :
                api('users').add(_user).then(callback);
    };

    this.toggle = function (_user) {
        _user.enabled = !_user.enabled;

        return api('users').update(_user).then(function (result) {
            if (result.status !== 200)
                return false;

            return $scope.users = assets.updateAsset('users', _user);
        });
    };

    this.delete = function (_user) {
        return modalDialog.showConfirmation().then(function () {
            api('users').delete(_user).then(function () {
                return $scope.users = assets.removeAsset('users', _user);
            });
        }, function () {
            return false;
        });
    };

    this.cancel = function () {
        if ($scope.status.view === 'list') {
            return $scope.modal.close();
        }

        $scope.status.view = 'list';
        delete $scope.user;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.users = assets.setAsset('users', res.item);
        }
        if (res.status === 200) {
            $scope.users = assets.updateAsset('users', res.item);
        }

        delete $scope._user;
        return $scope.status.view = 'list';
    }
}

angular.module('ninepixels.users', [])
        .controller('npUsersCtrl', npUsersController);
