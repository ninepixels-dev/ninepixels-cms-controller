/* global _ */

'use strict';

assetService.$inject = ['$rootScope', 'api'];
function assetService($rootScope, api) {
    var self = this;

    var assets = {};

    this.getAllAssets = function () {
        return assets;
    };

    this.getAsset = function (_asset) {
        return assets[_asset] || [];
    };

    this.setAsset = function (_asset, value) {
        assets[_asset].push(value);
        $rootScope.$broadcast('asset:' + _asset + ':changed', assets[_asset]);
        localStorage.setItem(_asset, JSON.stringify(assets[_asset]));
        return assets[_asset];
    };

    this.updateAsset = function (_asset, value) {
        self.removeAsset(_asset, value);
        self.setAsset(_asset, value);
        $rootScope.$broadcast('asset:' + _asset + ':changed', assets[_asset]);
        localStorage.setItem(_asset, JSON.stringify(assets[_asset]));
        return assets[_asset];
    };

    this.removeAsset = function (_asset, value) {
        assets[_asset] = _.reject(assets[_asset], {id: value.id});
        $rootScope.$broadcast('asset:' + _asset + ':changed', assets[_asset]);
        localStorage.setItem(_asset, JSON.stringify(assets[_asset]));
        return assets[_asset];
    };

    this.initAsset = function (_asset, _path) {
        api(_path || _asset).fetch().then(function (asset) {
            assets[_asset] = asset || [];
            $rootScope.$broadcast('asset:' + _asset + ':changed', asset);
            localStorage.setItem(_asset, JSON.stringify(asset));
        });
    };

    this.initMainAssets = function () {
        return api('assets').fetch().then(function (_assets) {
            angular.forEach(_assets, function (data, _asset) {
                assets[_asset] = data || [];
                $rootScope.$broadcast('asset:assets:changed', data);
                localStorage.setItem(_asset, JSON.stringify(data));
            });
        });
    };

    if (window.location.search.substr(1) !== "toolbar=false") {
        self.initMainAssets();

        self.initAsset('users');
        self.initAsset('components');
        self.initAsset('galleries');
        self.initAsset('gallery/images');

    } else {
        var languages = localStorage.getItem('languages');
        assets['languages'] = JSON.parse(languages);
        var components = localStorage.getItem('components');
        assets['components'] = JSON.parse(components);
        var images = localStorage.getItem('gallery/images');
        assets['gallery/images'] = JSON.parse(images);
        var galleries = localStorage.getItem('galleries');
        assets['galleries'] = JSON.parse(galleries);
    }
}

angular.module('ninepixels.controller')
        .service('assets', assetService);
