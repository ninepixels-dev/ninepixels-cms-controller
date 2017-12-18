'use strict';

typeaheadDirective.$inject = ['$timeout', 'config'];
function typeaheadDirective($timeout, config) {
    return {
        scope: {
            selectedItem: '=model',
            items: '=',
            field: '@',
            label: '@',
            onchange: '&',
            isDisabled: '=disabled',
            isRequired: '=required'
        },
        templateUrl: config.client_url + 'np-controller/templates/typeahead.html',
        link: function (scope, elem, attr, ctrl) {
            var field = scope.field ? scope.field.split(', ') : false;

            function parseField(item) {
                if (!field)
                    return item;

                if (field.length === 1)
                    return item[field[0]];

                var parsed_name = '';
                angular.forEach(field, function (elem, index) {
                    parsed_name += item[elem] || '';
                    if (index !== field.length - 1)
                        parsed_name += ' ';
                });

                return parsed_name.trim();
            }
            scope.parseField = parseField;

            /*
             * Search for item
             * @param {Object} query
             * @return {Object} list of items
             */
            scope.querySearch = function (query) {
                return query ? scope.items.filter(createFilterFor(query)) : scope.items;
            };

            /*
             * Create filter function for a query string
             * @param {string} query
             */
            function createFilterFor(query) {
                return function (item) {
                    return angular.lowercase(parseField(item))
                            .indexOf(angular.lowercase(query)) === 0;
                };
            }

            scope.itemChanged = function () {
                if (scope.isDisabled)
                    return false;

                $timeout(function () {
                    return scope.onchange();
                }, 500);
            };
        }
    };
}

angular.module('ninepixels.ui')
        .directive('npTypeahead', typeaheadDirective);