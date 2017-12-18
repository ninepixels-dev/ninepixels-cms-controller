/* global _ */

'use strict';

npSettingsCtrl.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config'];
function npSettingsCtrl($scope, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.options = assets.getAsset('options');

        $scope.view = 'list';
        
        $scope.types = ['default', 'meta', 'head', 'after-body', 'styling'];

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: npSettingsCtrl,
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/settings-dialog.html'
        });

    };

    this.add = function () {
        return $scope.view = 'form';
    };

    this.update = function (_option) {
        $scope.view = 'form';
        return $scope._option = _option;
    };

    this.save = function (_option) {
        return _option.id ?
                api('options').update(_option).then(callback) :
                api('options').add(_option).then(callback);
    };

    this.delete = function (_option) {
        return modalDialog.showConfirmation().then(function () {
            api('options').delete(_option).then(function () {
                return $scope.options = assets.removeAsset('options', _option);
            });
        });
    };

    this.cancel = function () {
        if ($scope.view === 'list') {
            return $scope.modal.close();
        }

        $scope.view = 'list';
        delete $scope.option;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.options = assets.setAsset('options', res.item);
        }
        if (res.status === 200) {
            $scope.options = assets.updateAsset('options', res.item);
        }

        delete $scope._option;
        return $scope.view = 'list';
    }

}

angular.module('ninepixels.settings', [])
        .controller('npSettingsCtrl', npSettingsCtrl);