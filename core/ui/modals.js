/* global _ */

'use strict';

modalDialogService.$inject = ['$uibModal', 'config'];
function modalDialogService($uibModal, config) {

    this.showModal = function (params) {
        _.extend(params, {windowClass: 'np-modal', backdrop: 'static'});
        return $uibModal.open(params);
    };

    this.showConfirmation = function (message, accept, decline) {
        return new Promise(function (resolve, reject) {
            return $uibModal.open({
                size: 'md',
                templateUrl: config.client_url + 'np-controller/templates/confirmation.html',
                windowClass: 'np-modal',
                controller: function ($uibModalInstance) {
                    this.message = message || 'Da li ste sigurni?';
                    this.accept = accept || 'Potvrdi';
                    this.decline = decline || 'Otkaži';

                    this.ok = function () {
                        $uibModalInstance.close();
                        return resolve();
                    };
                    this.cancel = function () {
                        $uibModalInstance.close();
                    };
                },
                controllerAs: 'confirmation'
            });
        });
    };

    this.showDialogBox = function (header, label) {
        return new Promise(function (resolve, reject) {
            return $uibModal.open({
                size: 'md',
                templateUrl: config.client_url + 'np-controller/templates/dialog-box.html',
                windowClass: 'np-modal',
                controller: function ($scope, $uibModalInstance) {
                    this.header = header || 'Unesite podatke';
                    this.label = label || 'Label';

                    this.ok = function () {
                        $uibModalInstance.close();
                        return resolve($scope.data);
                    };
                    this.cancel = function () {
                        $uibModalInstance.close();
                    };
                },
                controllerAs: 'confirmation'
            });
        });
    };
}

angular.module('ninepixels.ui.modalDialog', [])
        .service('modalDialog', modalDialogService);