/* global _ */

'use strict';

npImagePicker.$inject = ['assets', 'modalDialog', 'config'];
function npImagePicker(assets, modalDialog, config) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {
            var modalScope = scope.$new();

            modalScope.galleries = assets.getAsset('gallery/images');
            modalScope.server_url = config.server_url + config.images.thumbs;

            scope.manage = function () {
                return scope.modal = modalDialog.showModal({
                    scope: modalScope,
                    size: 'lg',
                    templateUrl: config.client_url + 'np-controller/templates/imagepicker.html'
                });
            };

            modalScope.select = function (gallery) {
                if (!gallery)
                    return delete modalScope.selected;

                return modalScope.selected = gallery.images;
            };

            modalScope.pick = function (image) {
                ngModel.$setViewValue(image);
                delete modalScope.selected;

                return scope.modal.close();
            };

            modalScope.cancel = function () {
                if (modalScope.selected)
                    return delete modalScope.selected;

                return scope.modal.close();
            };
        }
    };
}

npImagePickerController.$inject = ['$scope', 'assets', 'modalDialog', 'config'];
function npImagePickerController($scope, assets, modalDialog, config) {
    $scope.galleries = assets.getAsset('gallery/images');
    $scope.server_url = config.server_url + config.images.thumbs;

    this.trigger = function () {
        return new Promise(function (resolve) {
            $scope.modal = modalDialog.showModal({
                scope: $scope,
                size: 'lg',
                templateUrl: config.client_url + 'np-controller/templates/imagepicker.html'
            });

            $scope.select = function (gallery) {
                if (!gallery)
                    return delete $scope.selected;

                return $scope.selected = gallery.images;
            };

            $scope.pick = function (image) {
                delete $scope.selected;
                $scope.modal.close();

                return resolve(image);
            };

            $scope.cancel = function () {
                if ($scope.selected)
                    return delete $scope.selected;

                $scope.modal.close();
            };
        });
    };
}

angular.module('ninepixels.ui')
        .directive('npImagePicker', npImagePicker)
        .controller('npImagePickerCtrl', npImagePickerController);