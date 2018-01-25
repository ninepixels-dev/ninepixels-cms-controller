/* global _, moment */

'use strict';

npEventsCtrl.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config'];
function npEventsCtrl($scope, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.events = assets.getAsset('events');
        $scope.pages = assets.getAsset('pages');
        $scope.galleries = assets.getAsset('galleries');
        $scope.server_url = config.server_url + config.images.thumbs;

        $scope.view = 'list';

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: 'npEventsCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/events-dialog.html'
        });
    };

    this.add = function () {
        return $scope.view = 'form';
    };

    this.update = function (_event) {
        $scope.event = _event;

        return $scope.view = 'form';
    };

    this.validate = function (value) {
        if (!value) {
            return false;
        }

        $scope.event.name = encodeURI(value
                .replace(/č|ć/gi, 'c')
                .replace(/ž/gi, 'z')
                .replace(/š/gi, 's')
                .replace(/đ/gi, 'dj')
                .replace(/ +/g, '-').toLowerCase());

        if ($scope.event.page && $scope.event.name.indexOf($scope.event.page.name + '/') === -1) {
            $scope.event.name = $scope.event.page.name + '/' + $scope.event.name;

        } else if ($scope.event.name.indexOf(config.application.event_prefix + '/') === -1) {

            $scope.event.name = config.application.event_prefix + '/' + $scope.event.name;
        }
    };

    this.date = function (date) {
        return moment(date).format('DD. MMMM YYYY, HH:mm');
    };

    this.save = function (_event) {
        return _event.id ?
                api('events').update(_event).then(callback) :
                api('events').add(_event).then(callback);
    };

    this.delete = function (_event) {
        return modalDialog.showConfirmation().then(function () {
            api('events').delete(_event).then(function () {
                return $scope.events = assets.removeAsset('events', _event);
            });
        });
    };

    this.cancel = function () {
        if ($scope.view === 'list') {
            return $scope.modal.close();
        }

        $scope.view = 'list';
        delete $scope.event;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.events = assets.setAsset('events', res.item);
        }
        if (res.status === 200) {
            $scope.events = assets.updateAsset('events', res.item);
        }

        delete $scope.event;
        return $scope.view = 'list';
    }
}

angular.module('ninepixels.events', [])
        .controller('npEventsCtrl', npEventsCtrl);