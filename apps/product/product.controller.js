/* global _, moment */

'use strict';

npProductCtrl.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config'];
function npProductCtrl($scope, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.products = assets.getAsset('products');
        $scope.pages = assets.getAsset('pages');
        $scope.galleries = assets.getAsset('galleries');
        $scope.templates = config.templates.product;
        $scope.server_url = config.server_url + config.images.thumbs;

        $scope.view = 'list';

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: 'npProductCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/product-dialog.html'
        });
    };

    this.add = function () {
        return $scope.view = 'form';
    };

    this.update = function (_product) {
        $scope.product = _product;

        return $scope.view = 'form';
    };

    this.validate = function (value) {
        if (!value) {
            return false;
        }

        $scope.product.name = encodeURI(value
                .replace(/č|ć/gi, 'c')
                .replace(/ž/gi, 'z')
                .replace(/š/gi, 's')
                .replace(/đ/gi, 'dj')
                .replace(/ +/g, '-').toLowerCase());

        if ($scope.product.page && $scope.product.name.indexOf($scope.product.page.name + '/') === -1) {
            $scope.product.name = $scope.product.page.name + '/' + $scope.product.name;

        } else if ($scope.product.name.indexOf(config.application.product_prefix + '/') === -1) {

            $scope.product.name = config.application.product_prefix + '/' + $scope.product.name;
        }
    };

    this.date = function (date) {
        return moment(date).format('DD. MMMM YYYY, HH:mm');
    };

    this.save = function (_product) {
        return _product.id ?
                api('products').update(_product).then(callback) :
                api('products').add(_product).then(callback);
    };

    this.delete = function (_product) {
        return modalDialog.showConfirmation().then(function () {
            api('products').delete(_product).then(function () {
                return $scope.pages = assets.removeAsset('products', _product);
            });
        });
    };

    this.cancel = function () {
        if ($scope.view === 'list') {
            return $scope.modal.close();
        }

        $scope.view = 'list';
        delete $scope.product;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.products = assets.setAsset('products', res.item);
        }
        if (res.status === 200) {
            $scope.products = assets.updateAsset('products', res.item);
        }

        delete $scope.product;
        return $scope.view = 'list';
    }
}

angular.module('ninepixels.product', [])
        .controller('npProductCtrl', npProductCtrl);