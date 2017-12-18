'use strict';

angular.module('ninepixels', [
    'angular-loading-bar', 'ui.sortable',
    'ngCookies', 'ui.bootstrap',
    'ninepixels.controller',
    'ninepixels.toolbar',
    'ninepixels.pages',
    'ninepixels.users',
    'ninepixels.blog',
    'ninepixels.products',
    'ninepixels.settings',
    'ninepixels.authentification',
    'ninepixels.api',
    'ninepixels.api.token',
    'ninepixels.login',
    'ninepixels.notify',
    'ninepixels.ui',
    'ninepixels.ui.modalDialog',
    'ninepixels.ui.uploader'

])

.constant('config', config);
