//'use strict';


// Declare app level module which depends on filters, and services
var eTRIKSdataApp = angular.module('eTRIKSdata', [
        "ui.router",
        "eTRIKSdata.studyDesign",
        "eTRIKSdata.explorer",
        "eTRIKSdata.loader",
        "eTRIKSdata.userAuth"
    ]);

eTRIKSdataApp.config(function($stateProvider, $urlRouterProvider){

       /*$urlRouterProvider.otherwise('/home');*/

    $urlRouterProvider.when('', '/home');
        $stateProvider
            .state('home',{
                url: "/home",
                templateUrl:"authentication/login.html"
            })



    });
