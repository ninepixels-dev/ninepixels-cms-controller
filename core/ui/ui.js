/* global moment */

'use strict';

datetimePicker.$inject = [];
function datetimePicker() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {
            elem.datetimepicker({
                format: 'DD-MM-YYYY HH:mm',
                sideBySide: true,
                icons: {
                    time: 'glyphicon glyphicon-time',
                    date: 'glyphicon glyphicon-calendar',
                    up: 'glyphicon glyphicon-chevron-up',
                    down: 'glyphicon glyphicon-chevron-down',
                    previous: 'glyphicon glyphicon-chevron-left',
                    next: 'glyphicon glyphicon-chevron-right',
                    today: 'glyphicon glyphicon-screenshot',
                    clear: 'glyphicon glyphicon-trash',
                    close: 'glyphicon glyphicon-remove'
                }
            });

            elem.on('dp.change', function (e) {
                ngModel.$setViewValue(moment(e.date).format('DD-MM-YYYY HH:mm'));
            });
        }
    };
}

filterDatetime.$inject = [];
function filterDatetime() {
    return function (input, format) {
        return moment(input).format(format);
    };
}

angular.module('ninepixels.ui', ['angularFileUpload'])
        .directive('npDatetimePicker', datetimePicker)
        .filter('formatDate', filterDatetime);
