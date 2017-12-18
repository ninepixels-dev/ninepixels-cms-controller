'use strict';

authentification.$inject = ['$cookies', 'api'];
function authentification($cookies, api) {
    var user;

    this.getActiveUser = function () {
        if (user) {
            return user;
        }

        return api('user').fetch();
    };

    this.isLoggedIn = function () {
        return !!$cookies.getObject('token');
    };
}

angular.module('ninepixels.authentification', [])
        .service('authentification', authentification);