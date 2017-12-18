/* global _ */

'use strict';

npLanguageController.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config'];
function npLanguageController($scope, api, modalDialog, assets, config) {
    var self = this;

    this.manage = function () {
        $scope.languages = assets.getAsset('languages') || [];
        $scope.locales = assets.getAsset('locales') || [];
        $scope.view = 'list';

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: 'npLanguageCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/language-dialog.html'
        });
    };

    this.add = function () {
        return $scope.view = 'form';
    };

    this.save = function (_language) {
        return _language.id ?
                api('languages').update(_language).then(callback) :
                api('languages').add(_language).then(callback);
    };

    this.toggle = function (_language) {
        _language.visible = !_language.visible;
        return api('languages').update(_language).then(callback);
    };

    this.update = function (_language) {
        $scope.view = 'form';
        return $scope.language = _language;
    };

    this.delete = function (_language) {
        return modalDialog.showConfirmation().then(function () {
            api('languages').delete(_language).then(function () {
                return $scope.languages = assets.removeAsset('languages', _language);
            });
        });
    };

    this.cancel = function () {
        if ($scope.view === 'list') {
            return $scope.modal.close();
        }

        $scope.view = 'list';
        delete $scope.locale;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.languages = assets.setAsset('languages', res.item);
        }
        if (res.status === 200) {
            $scope.languages = assets.updateAsset('languages', res.item);
        }

        delete $scope.language;
        return $scope.view = 'list';
    }

    // LOCALIZATION PART
    $scope.localization = {};
    this.localization = {
        init: function (origin, language) {
            $scope.localization[origin + language.id].language = language;
            $scope.localization[origin + language.id].origin = origin;

            if (self.localization.get(origin, language)) {
                $scope.localization[origin + language.id].id = self.localization.get(origin, language).id;
            }
        },
        get: function (origin, language) {
            return _.find($scope.locales, function (item) {
                return item.origin === origin && _.isEqual(item.language, language);
            });
        },
        save: function (_localization) {
            return angular.forEach(_localization, function (locale) {
                return locale.id ?
                        api('locales').update(locale).then(self.localization.callback) :
                        api('locales').add(locale).then(self.localization.callback);

            });
        },
        callback: function (res) {
            if (res.status === 201) {
                $scope.locales = assets.setAsset('locales', res.item);
            }
            if (res.status === 200) {
                $scope.locales = assets.updateAsset('locales', res.item);
            }

            delete $scope.localization;
        }
    };
}

angular.module('ninepixels.controller')
        .controller('npLanguageCtrl', npLanguageController);