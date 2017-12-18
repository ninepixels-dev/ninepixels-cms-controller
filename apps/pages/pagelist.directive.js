/* global _ */

'use strict';

npPageList.$inject = ['config', 'api', 'orderByFilter'];
function npPageList(config, api, orderBy) {
    return {
        scope: {
            list: '=',
            parent: '=',
            filter: '=',
            update: '=',
            toggle: '=',
            remove: '='
        },
        templateUrl: config.client_url + 'np-controller/templates/page-list.html',
        link: function (scope, elem) {
            scope._update = function (page) {
                return scope.update(page);
            };
            scope._delete = function (page) {
                return scope.remove(page);
            };
            scope._toggle = function (page, asset) {
                return scope.toggle(page, asset);
            };

            // Sort element
            scope.list = orderBy(scope.list, 'position', false);

            // Reorder with drag and drop
            var updated = false;
            elem.sortable({
                start: function (event, ui) {
                    ui.item.data('start_index',
                            ui.item
                            .parent()
                            .find('li.' + ui.item[0].className)
                            .index(ui.item));
                },
                stop: function (event, ui) {
                    if (updated) {
                        updated = false;

                        var start = ui.item.data('start_index'),
                                end = ui.item.parent().find('li.' + ui.item[0].className)
                                .index(ui.item);

                        scope.reorder(start, end, ui.item);
                        scope.$apply();
                    }
                },
                update: function () {
                    updated = true;
                }
            });

            scope.reorder = function (start, end) {
                var filteredList = _.filter(scope.list, function (obj) {
                    return scope.parent ? obj.parent && obj.parent.id === scope.parent : obj && !obj.parent;
                });

                filteredList.splice(end, 0, filteredList.splice(start, 1)[0]);

                angular.forEach(filteredList, function (page, key) {
                    page['position'] = key + 1;
                    return api('pages').update(page);
                });
            };
        }
    };
}

angular.module('ninepixels.pages')
        .directive('npPageList', npPageList);