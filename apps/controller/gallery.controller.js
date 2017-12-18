/* global _ */

'use strict';

npGalleryController.$inject = ['$scope', 'modalDialog', 'api', 'assets', 'config'];
function npGalleryController($scope, modalDialog, api, assets, config) {
    var self = this;

    $scope.galleries = assets.getAsset('gallery/images');
    $scope.server_url = config.server_url + config.images.thumbs;

    $scope.$on('asset:gallery/images:changed', function (e, data) {
        $scope.galleries = data;

        $scope.selected ?
                $scope.selected = _.findWhere($scope.galleries, {id: $scope.selected.id}) : false;
    });

    this.manage = function () {
        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            size: 'lg',
            controller: npGalleryController,
            controllerAs: 'ctrl',
            templateUrl: config.client_url + 'np-controller/templates/gallery-dialog.html'
        });
    };

    this.add = function () {
        return modalDialog.showDialogBox('Nova galerija', 'Naziv').then(function (gallery) {
            api('galleries').add({name: gallery}).then(function () {
                return assets.initAsset('gallery/images');
            });
        });
    };

    this.select = function (_gallery) {
        if (!_gallery)
            return delete $scope.selected;

        return $scope.selected = _gallery;
    };

    this.update = function (_gallery) {
        angular.forEach(_gallery.images, function (image) {
            return image.$dirty ?
                    api('images').update(_.omit(image, '$dirty')) : false;
        });

        return delete $scope.selected;
    };

    this.delete = function (image) {
        return modalDialog.showConfirmation().then(function () {
            api('images').delete(image).then(function () {
                return assets.initAsset('gallery/images');
            });
        });
    };

    this.cancel = function () {
        if ($scope.selected) {
            return delete $scope.selected;
        }

        return $scope.modal.close();
    };
}

angular.module('ninepixels.controller')
        .controller('npGalleryCtrl', npGalleryController);