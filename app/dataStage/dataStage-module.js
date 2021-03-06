/**
 * Created by iemam on 10/09/2015.
 */


function config($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('datastage', {
            abstract: true,
            url: "/{projectId}",
            templateUrl: "layout/content.html"
        })
        .state('datastage.files', {
            url: "/datastage/files/{dir:[a-zA-Z /]*}",
            templateUrl: "dataStage/fileManager/fileManager.html",
            controller: "fileController as vm",
            resolve: {
                loadDirective: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataStage/fileManager/file-directive.js'
                    ]);
                }],
                loadDependency: ['$ocLazyLoad',function($ocLazyLoad){
                   return $ocLazyLoad.load(
                       {
                           serie: true,
                           files: ['dataStage/fileManager/fileManager-service.js',
                               'dataStage/fileManager/fileManager-controller.js'
                           ]
                       }
                   )
                }],
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie:true,
                            files: ['lib/plugins/iCheck/custom.css','lib/plugins/ngSweetAlert/css/sweetalert.css',
                                'lib/plugins/iCheck/icheck.min.js',
                                'lib/plugins/angular-xeditable/js/xeditable.min.js',
                                'lib/plugins/angular-xeditable/css/xeditable.css',
                                'lib/plugins/ngSweetAlert/js/sweetalert.min.js',
                                'lib/plugins/ngSweetAlert/js/ngSweetAlert.min.js']
                        }
                    ]);
                }
            }
        })

        .state('datastage.files.view', {
            url: "/view/{fileId}",
            templateUrl: "dataStage/fileManager/fileViewer.html",
            controller : "fileViewController",
            resolve: {
                loadPlugin: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: ['lib/plugins/dataTables/js/jquery.dataTables.js',
                                'lib/plugins/dataTables/css/datatables.bootstrap.min.css']
                        },
                        {
                            name: 'datatables',
                            serie: true,
                            files: ['lib/plugins/dataTables/js/angular-datatables.min.js',
                                'lib/plugins/dataTables/js/angular-datatables.bootstrap.min.js',
                                'lib/plugins/dataTables/js/angular-datatables.buttons.min.js',
                                'lib/plugins/dataTables/css/angular-datatables.min.css']
                        }
                    ]);
                }],
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataStage/fileManager/fileViewer-controller.js'
                    ]);
                }]
            }
        })

        .state("datastage.upload", {
            url: "/upload/{dir}",
            onEnter: ['$stateParams', '$state', '$uibModal', 'fileService',function($stateParams, $state, $uibModal, fileService) {
                $uibModal.open({
                    templateUrl: "dataStage/upload/upload.html",
                    resolve: {
                        loadPlugin:['$ocLazyLoad',function($ocLazyLoad){
                          return $ocLazyLoad.load([
                              {
                                  serie:true,
                                  files:['lib/plugins/angular-file-upload/angular-file-upload.min.js']
                              }
                          ])
                        }],
                        loadController:['$ocLazyLoad',function($ocLazyLoad){
                            return $ocLazyLoad.load([
                                'dataStage/upload/upload-controller.js'
                            ]);
                        }]
                    },
                    controller: 'uploadController'
                }).result.finally(function($stateParams) {
                        fileService.getFiles()
                            .then(function(data){
                            $state.go('datastage.files',{projectId:$stateParams.projectId, dir:$stateParams.dir})
                            })
                    }, function () {
                        console.info('Modal dismissed at: ' + new Date());
                        $state.go('^');
                    });

            }]
        });
}

angular
    .module('bioSpeak.DataStager', ['ngResource'])
    .config(config)
