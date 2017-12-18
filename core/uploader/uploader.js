/* global uploader, _ */

'use strict';

npUploaderCtrl.$inject = ['$scope', 'FileUploader', 'token', 'assets', 'modalDialog', 'config'];
function npUploaderCtrl($scope, FileUploader, token, assets, modalDialog, config) {
    $scope.galleries = assets.getAsset('galleries');

    $scope.uploader = new FileUploader({
        method: 'POST',
        headers: token.getToken(),
        url: token.resolveUrl('images')
    });

    $scope.uploader.onBeforeUploadItem = function (item) {
        return item.formData = [{
                title: item.formData.title || '',
                alt: item.formData.alt || '',
                gallery: $scope._gallery.id || 0
            }];
    };

    $scope.uploader.onCompleteAll = function () {
        return assets.initAsset('gallery/images');
    };

    this.manage = function (_gallery) {
        if (_gallery)
            $scope._gallery = _.omit(_gallery, 'images');

        return $scope.modal = modalDialog.showModal({
            scope: $scope,
            size: 'lg',
            controller: npUploaderCtrl,
            controllerAs: 'ctrl',
            templateUrl: config.client_url + 'np-controller/templates/uploader.html'
        });
    };

    this.cancel = function () {
        return $scope.modal.close();
    };
}

ngThumb.$inject = ['$window'];
function ngThumb($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function (item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function (file) {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function (scope, element, attributes) {
            if (!helper.support)
                return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file))
                return;
            if (!helper.isImage(params.file))
                return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({width: width, height: height});
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}

angular.module('ninepixels.ui.uploader', ['angularFileUpload'])
        .controller('npUploaderCtrl', npUploaderCtrl)
        .directive('ngThumb', ngThumb);