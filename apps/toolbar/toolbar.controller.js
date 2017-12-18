/* global _ */

'use strict';

npToolbarCtrl.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config', 'orderByFilter'];
function npToolbarCtrl($scope, api, modalDialog, assets, config, orderBy) {
    var self = this;

    $scope.languages = assets.getAsset('languages') || [];

    this.modify = function () {
        $scope.galleries = assets.getAsset('galleries') || [];
        $scope.components = assets.getAsset('components') || [];
        $scope.server_url = config.server_url + config.images.thumbs;

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: npToolbarCtrl,
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/toolbar-dialog.html'
        });
    };

    this.add = function (page, ident, lang) {
        $scope._item = {
            page: page,
            identifier: ident
        };

        if (lang) {
            $scope._item.language = _.findWhere($scope.languages, {code: lang});
        }

        return self.modify();
    };

    this.update = function (_item) {
        return api('items').fetch({id: _item}).then(function (res) {
            $scope._item = res;
            return self.modify();
        });
    };

    this.save = function (_item) {
        return _item.id ?
                api('items').update(_item).then(callback) :
                api('items').add(_item).then(callback);
    };

    this.reorder = function (page, ident) {
        api('items').fetch(false, {page: page, identifier: ident}).then(function (result) {
            $scope.items = orderBy(result, 'position');

            return $scope.modal = modalDialog.showModal({
                scope: $scope,
                controller: npToolbarCtrl,
                controllerAs: 'ctrl',
                size: 'md',
                templateUrl: config.client_url + 'np-controller/templates/toolbar-reorder.html'
            });
        });
    };

    this.saveReorder = function () {
        angular.forEach($scope.items, function (item, key) {
            item['position'] = key;
            return api('items').update(item);
        });

        return callback();
    };

    this.delete = function (_item) {
        return modalDialog.showConfirmation().then(function () {
            api('items').delete({id: _item}).then(function () {
                return $scope.items = assets.removeAsset('items', {id: _item});
            });
        });
    };

    this.cancel = function () {
        delete $scope._item;
        return $scope.modal.close();
    };

    // Callback function
    function callback() {
        return document.location.reload();
    }
}

htmlToPlaintext.$inject = [];
function htmlToPlaintext() {
    return function (text) {
        return text ? String(text).replace(/<[^>]+>/gm, ' ') : '';
    };
}

angular.module('ninepixels.toolbar')
        .filter('htmlToPlaintext', htmlToPlaintext)
        .controller('npToolbarCtrl', npToolbarCtrl);