/* global _ */

'use strict';

npComponentController.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config'];
function npComponentController($scope, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.components = assets.getAsset('components');
        $scope.view = 'list';

        $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: 'npComponentCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/component-dialog.html'
        });
    };

    this.add = function () {
        return $scope.view = 'form';
    };

    this.update = function (_component) {
        $scope.view = 'form';
        return $scope._component = _component;
    };

    this.save = function (_component) {
        return _component.id ?
                api('components').update(_component).then(callback) :
                api('components').add(_component).then(callback);
    };

    this.delete = function (_component) {
        return modalDialog.showConfirmation().then(function () {
            api('components').delete(_component).then(function () {
                return $scope.components = assets.removeAsset('components', _component);
            });
        });
    };

    this.cancel = function () {
        if ($scope.view === 'list') {
            return $scope.modal.close();
        }

        $scope.view = 'list';
        delete $scope._component;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.components = assets.setAsset('components', res.item);
        }
        if (res.status === 200) {
            $scope.components = assets.updateAsset('components', res.item);
        }

        delete $scope._component;
        return $scope.view = 'list';
    }
}

angular.module('ninepixels.controller')
        .controller('npComponentCtrl', npComponentController);