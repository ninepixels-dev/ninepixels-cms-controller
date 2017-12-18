/* global _, moment */

'use strict';

npBlogCtrl.$inject = ['$scope', 'api', 'modalDialog', 'assets', 'config'];
function npBlogCtrl($scope, api, modalDialog, assets, config) {
    this.manage = function () {
        $scope.blogs = assets.getAsset('blogs');
        $scope.pages = assets.getAsset('pages');
        $scope.templates = config.templates.blog;
        $scope.server_url = config.server_url + config.images.thumbs;

        $scope.view = 'list';

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            controller: 'npBlogCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            templateUrl: config.client_url + 'np-controller/templates/blog-dialog.html'
        });

    };

    this.add = function () {
        return $scope.view = 'form';
    };

    this.update = function (_blog) {
        $scope.view = 'form';
        return $scope.blog = _blog;
    };

    this.validate = function (value) {
        $scope.blog.name = encodeURI(value
                .replace(/č|ć/gi, 'c')
                .replace(/ž/gi, 'z')
                .replace(/š/gi, 's')
                .replace(/đ/gi, 'dj')
                .replace(/ +/g, '-').toLowerCase());

        if ($scope.blog.page && $scope.blog.name.indexOf($scope.blog.page.name + '/') === -1) {
            $scope.blog.name = $scope.blog.page.name + '/' + $scope.blog.name;
        } else if ($scope.blog.name.indexOf(config.application.blog_prefix + '/') === -1) {
            $scope.blog.name = config.application.blog_prefix + '/' + $scope.blog.name;
        }
    };

    this.date = function (date) {
        return moment(date).format('DD. MMMM YYYY, HH:mm');
    };

    this.save = function (_blog) {
        return _blog.id ?
                api('blogs').update(_blog).then(callback) :
                api('blogs').add(_blog).then(callback);
    };

    this.delete = function (_blog) {
        return modalDialog.showConfirmation().then(function () {
            api('blogs').delete(_blog).then(function () {
                return $scope.pages = assets.removeAsset('blogs', _blog);
            });
        });
    };

    this.cancel = function () {
        if ($scope.view === 'list') {
            return $scope.modal.close();
        }

        $scope.view = 'list';
        delete $scope.blog;
    };

    // Callback function
    function callback(res) {
        if (res.status === 201) {
            $scope.blogs = assets.setAsset('blogs', res.item);
        }
        if (res.status === 200) {
            $scope.blogs = assets.updateAsset('blogs', res.item);
        }

        delete $scope.blog;
        return $scope.view = 'list';
    }

}

angular.module('ninepixels.blog', [])
        .controller('npBlogCtrl', npBlogCtrl);