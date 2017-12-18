/* global _ */

'use strict';

npMetadata.$inject = ['api', 'config'];
function npMetadata(api, config) {
    return {
        scope: {language: '=', page: '=', update: '='},
        controller: 'npPageCtrl',
        controllerAs: 'ctrl',
        templateUrl: config.client_url + 'np-controller/templates/page-metadata.html',
        link: function (scope, elem, attr, ctrl) {
            if (!scope.page)
                return false;

            var query = scope.language ?
                    'languages/' + scope.language.id + '/pages/' + scope.page.id + '/metadatas' :
                    'pages/' + scope.page.id + '/metadatas';

            api(query).fetch().then(function (response) {
                scope.metadata = response ? response : {};
            });

            scope.$watch('update', function (update) {
                if (!update || !scope.metadata || !scope.metadata.navigation)
                    return false;

                if (scope.metadata.id) {
                    return api('metadatas').update(scope.metadata);
                }

                if (scope.language) {
                    scope.metadata.language = scope.language;
                }

                scope.metadata.page = scope.page;

                return api('metadatas').add(scope.metadata);
            });

        }
    };
}

angular.module('ninepixels.pages')
        .directive('npMetadata', npMetadata);