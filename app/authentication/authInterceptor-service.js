/**
 * Created by iemam on 15/09/2015.
 */
'use strict';
//app.factory('authInterceptorService', ['$q', '$injector','$location', 'localStorageService', function ($q, $injector,$location, localStorageService) {

function authInterceptorService($q, $injector,$location, localStorageService){
    var authInterceptorServiceFactory = {};

    //var redirectUrl;

    var _request = function (config) {
        config.headers = config.headers || {};

        //redirectUrl = config.url;
        var authData = localStorageService.get('authorizationTFAData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }

        return config;
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            if ((rejection.data.code) && (rejection.data.code = 100))
            {
                //Case that OTP is not valid but access token is valid
                return $q.reject(rejection);
            }

            var authService = $injector.get('authService');

            authService.logOut();
            $location.path('/login');
        }
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}

angular
    .module('bioSpeak.userAuth')
    .factory('authInterceptorService',['$q', '$injector','$location', 'localStorageService', authInterceptorService])



