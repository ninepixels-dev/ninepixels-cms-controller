/* global _, moment */

'use strict';

npTravelCtrl.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config'];
function npTravelCtrl($scope, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.travels = assets.getAsset('travels');
        $scope.pages = assets.getAsset('pages');
        $scope.galleries = assets.getAsset('galleries');
        $scope.templates = config.templates.travel;
        $scope.server_url = config.server_url + config.images.thumbs;

        $scope.view = 'list';

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: 'npTravelCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/travel-dialog.html'
        });
    };

    this.add = function () {
        $scope.travel = {
            basic_info: [{key: '', value: ''}],
            additional_info: [{key: '', value: ''}]
        };

        return $scope.view = 'form';
    };

    this.update = function (_travel) {
        $scope.travel = _travel;
        $scope.travel.basic_info = typeof $scope.travel.basic_info === "string" ? JSON.parse($scope.travel.basic_info) : $scope.travel.basic_info;
        $scope.travel.additional_info = typeof $scope.travel.additional_info === "string" ? JSON.parse($scope.travel.additional_info) : $scope.travel.additional_info;

        return $scope.view = 'form';
    };

    this.pin = function (_travel) {
        _travel['pinned'] = !_travel['pinned'];

        return api('travels').update(_travel).then(callback);
    };

    this.validate = function (value) {
        if (!value) {
            return false;
        }

        $scope.travel.name = encodeURI(value
                .replace(/'/gi, '')
                .replace(/č|ć/gi, 'c')
                .replace(/ž/gi, 'z')
                .replace(/š/gi, 's')
                .replace(/đ/gi, 'dj')
                .replace(/ +/g, '-').toLowerCase());

        if ($scope.travel.page && $scope.travel.name.indexOf($scope.travel.page.name + '/') === -1) {
            $scope.travel.name = $scope.travel.page.name + '/' + $scope.travel.name;

        } else if ($scope.travel.name.indexOf(config.application.travel_prefix + '/') === -1) {

            $scope.travel.name = config.application.travel_prefix + '/' + $scope.travel.name;
        }
    };

    this.addExtraField = function (group) {
        return $scope.travel[group].push({key: '', value: ''});
    };

    this.date = function (date) {
        return moment(date).format('DD. MMMM YYYY, HH:mm');
    };

    this.save = function (_travel) {
        _travel.basic_info = JSON.stringify(_travel.basic_info);
        _travel.additional_info = JSON.stringify(_travel.additional_info);

        return _travel.id ?
                api('travels').update(_travel).then(callback) :
                api('travels').add(_travel).then(callback);
    };

    this.delete = function (_travel) {
        return modalDialog.showConfirmation().then(function () {
            api('travels').delete(_travel).then(function () {
                return $scope.travels = assets.removeAsset('travels', _travel);
            });
        });
    };

    this.cancel = function () {
        if ($scope.view === 'list') {
            return $scope.modal.close();
        }

        $scope.view = 'list';
        delete $scope.travel;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.travels = assets.setAsset('travels', res.item);
        }
        if (res.status === 200) {
            $scope.travels = assets.updateAsset('travels', res.item);
        }

        delete $scope.travel;
        return $scope.view = 'list';
    }
}

angular.module('ninepixels.travel', [])
        .controller('npTravelCtrl', npTravelCtrl);