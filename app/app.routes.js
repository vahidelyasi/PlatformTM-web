/**
 * Created by iemam on 06/04/2017.
 */
angular.module('biospeak.app').config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider){

    $urlRouterProvider.otherwise('/dashboard');

    $urlRouterProvider.when('', '/login');
    $urlRouterProvider.when('/home', '/dashboard');


    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider
        .state("root", {
            url: "/",
            onEnter: function($state){
                $state.go("home.dashboard")
            }
        })
        .state('home',{
            abstract:true,
            url: "",
            templateUrl:"layout/content.html"
        })
        .state('home.dashboard',{
            // url: "/admin/projects",
            url: "/dashboard",
            templateUrl:"home/dashboard.html",
            controller:'DashboardCtrl as vm',
            resolve: {
                loadService: ['$ocLazyLoad', function ($ocLazyLoad) {
                    console.log("loading service");
                    return $ocLazyLoad.load([
                        'admin/project/project-service.js','export/export-service.js',
                        'explore/explorer-service.js','explore/checkout/checkout-service.js']);
                }],
                loadPlugins:['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load(['lib/plugins/ngSweetAlert/js/sweetalert.min.js',
                        'lib/plugins/ngSweetAlert/js/ngSweetAlert.min.js'
                    ]);
                }],
                loadCSS:['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([
                        {
                            serie:true,
                            insertBefore: '#load_css_before',
                            files:[
                                'lib/plugins/angular-xeditable/css/xeditable.css',
                                'lib/plugins/ngSweetAlert/css/sweetalert.css']
                        }

                    ])
                }],

                /*loadDirectives:['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load(['admin/studies/study-plan-directives.js'
                    ]);
                }],*/
                loadController:['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load(['home/dashboard-controller.js'
                    ]);
                }]
            }
            //templateUrl:"admin/project/project-list.html"
            /*templateUrl:"dashboard/dashboard.html"*/
        })
        .state('main',{
            url: "/dashboard",
            templateUrl:"home/dashboard.html"
        })
});