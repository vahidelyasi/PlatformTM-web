/**
 * Created by iemam on 08/07/2014.
 */
angular.module('eTRIKSdata.explorer',[
        'biospeak.subjects',
        'biospeak.clinical',
        'biospeak.assays',
        'eTRIKSdata.dcPlots',
        'eTRIKSdata.exporter'])

    .config(function($stateProvider){

        $stateProvider
            .state('explore', {
                abstract : true,
                url: "",
                templateUrl:"layout/content.html",
                controller: "logOutController"
            })
            .state('explore.main', {
                url: "/{studyId}/explore/",
                views:{
                    '':{
                        templateUrl: 'explore/explore.html',
                        resolve: {
                            loadPlugin: function ($ocLazyLoad) {
                                return $ocLazyLoad.load([
                                    {
                                        insertBefore: '#loadBefore',
                                        name: 'toaster',
                                        files: ['lib/plugins/toastr/toastr.min.js', 'lib/plugins/toastr/toastr.min.css']
                                    },
                                    {
                                        files: ['lib/plugins/slick/css/slick.css','lib/plugins/slick/css/slick-theme.css','lib/plugins/slick/js/slick.min.js']
                                    },
                                    {
                                        name: 'slick',
                                        files: ['lib/plugins/slick/js/angular-slick.min.js']
                                    }
                                ]);
                            }
                        },
                        controller:function(){
/*                            angular.element(document).ready(function () {
                                $(".main").onepage_scroll({

                                    easing: "ease",                  // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in",
                                    // "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
                                    animationTime: 1000,             // AnimationTime let you define how long each section takes to animate
                                    pagination: true,                // You can either show or hide the pagination. Toggle true for show, false for hide.
                                    updateURL: false,                // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
                                    beforeMove: function(index) {},  // This option accepts a callback function. The function will be called before the page moves.
                                    afterMove: function(index) {},   // This option accepts a callback function. The function will be called after the page moves.
                                    loop: false,                     // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
                                    keyboard: true,                  // You can activate the keyboard controls
                                    responsiveFallback: false,        // You can fallback to normal page scroll by defining the width of the browser in which
                                    // you want the responsive fallback to be triggered. For example, set this to 600 and whenever
                                    // the browser's width is less than 600, the fallback will kick in.
                                    direction: "vertical"            // You can now define the direction of the One Page Scroll animation. Options available are "vertical" and "horizontal". The default value is "vertical".
                                });
                            });*/
                        }
                    },
                    'subjects@explore.main':{
                        templateUrl: 'explore/subjects/study_subjects.html',
                        controller: 'SubjectsCtrl'
                    },
                    'assessments@explore.main':{
                        templateUrl: 'explore/clinical/study_clinical.html',
                        controller: 'ClinicalCtrl'
                    },
                    'assays@explore.main':{
                        templateUrl: 'explore/assays/study_assays.html',
                        controller: 'AssayCtrl'
                    },
                    'datacart@explore.main':{
                        templateUrl: 'explore/export/right_sidebar.html',
                        controller: 'DatacartCtrl'
                    },
                    'design@explore':{
                        templateUrl: 'explore/partials/study_design.html'
                    }
                }

            })

    })

    /*.constant('ngAuthSettings', {
        //apiServiceBaseUri: 'http://rachmaninoff.local:8080/'
        apiServiceBaseUri: 'http://ehs.biospeak.solutions/sandbox/'
    })*/