/* global _ */

'use strict';

npPageController.$inject = ['$scope', '$timeout', 'api', 'modalDialog', 'assets', 'config'];
function npPageController($scope, $timeout, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.pages = assets.getAsset('pages');
        $scope.galleries = assets.getAsset('galleries');
        $scope.languages = assets.getAsset('languages');
        $scope.server_url = config.server_url + config.images.thumbs;
        $scope.templates = config.templates.default;

        $scope.status = {
            view: 'list'
        };

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: 'npPageCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/page-view-dialog.html'
        });
    };

    this.addNew = function () {
        $scope.status.view = 'form';
        $scope.update = false;

        return $scope.page = {
            show_header: true,
            show_navigation: true,
            show_footer: true,
            show_in_navigation: true,
            visible: true
        };
    };

    this.toggle = function (obj, value) {
        obj[value] = !obj[value];
        return api('pages').update(obj).then(function (res) {
            if (res.status !== 200)
                return false;

            $scope.pages = assets.updateAsset('pages', res.item);
        });
    };

    this.update = function (_page) {
        $scope.status.view = 'form';
        $scope.update = false;

        return $scope.page = _page;
    };

    this.validate = function (value) {
        $scope.page.name = encodeURI(value
                .replace(/č|ć/gi, 'c')
                .replace(/ž/gi, 'z')
                .replace(/š/gi, 's')
                .replace(/đ/gi, 'dj')
                .replace(/ +/g, '-').toLowerCase());

        if ($scope.page.parent && $scope.page.name.indexOf($scope.page.parent.name + '/') === -1) {
            $scope.page.name = $scope.page.parent.name + '/' + encodeURI(value.replace(/ /g, '-').toLowerCase());
        }
    };

    this.save = function (_page) {
        return _page.id ?
                api('pages').update(_page).then(callback) :
                api('pages').add(_page).then(callback);
    };

    this.delete = function (_page) {
        return modalDialog.showConfirmation().then(function () {
            api('pages').delete(_page).then(function () {
                return $scope.pages = assets.removeAsset('pages', _page);
            });
        });
    };

    this.cancel = function () {
        if ($scope.status.view === 'list') {
            return $scope.modal.close();
        }

        $scope.status.view = 'list';
        $scope.update = false;

        delete $scope.page;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.pages = assets.setAsset('pages', res.item);
            $scope.page = res.item;

        } else if (res.status === 200) {
            $scope.pages = assets.updateAsset('pages', res.item);
        }

        $scope.update = true;

        $timeout(function () {
            $scope.status.view = 'list';
            delete $scope.page;
        }, 500, false);
    }
}

parentFilter.$inject = [];
function parentFilter() {
    return function (input, page) {
        var out = [];

        _.each(input, function (obj) {
            if (!obj.parent && !page) {
                out.push(obj);
            } else if (obj.parent && page && obj.parent.id === page) {
                out.push(obj);
            }
        });

        return out;
    };
}

angular.module('ninepixels.pages', [])
        .filter('parent', parentFilter)
        .controller('npPageCtrl', npPageController);
