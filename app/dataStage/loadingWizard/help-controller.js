/**
 * Created by iemam on 06/10/2015.
 */



    'use strict';

    function helpController($scope,$state,$stateParams,wizardService){

        var vm = {}
        //$scope.vm = vm;

        $scope.vm = {
            selectedFiles: $stateParams.selFiles,
            selectedDataset:null,
            selectedActivity:null,
            currentFile: $scope.$parent.vm.fileSelected
        };
        console.log($scope.vm)

        console.log('help controller scope',$scope)

        $scope.getPhotoName = function(){
            return $scope.photoName;
        }
        console.log('inside help controller',$stateParams.selFiles)
        //var projectId = $stateParams.projectId
        /*var projectId = "STD-BVS-01";

        wizardService.getActivities(projectId).then(function(activities){
                $scope.activities = activities;
        })


        $scope.goToStep2 = function(){
            $scope.vm.selectedDataset.dataFile = $scope.$parent.vm.fileSelected
            wizardService.updateDatasetFile($scope.vm.selectedDataset).then(function(){
                $state.go('datastage.wizard.step_two',{ file: $scope.$parent.vm.fileSelected,
                    activityId: $scope.vm.selectedActivity.id, datasetId: $scope.vm.selectedDataset.id });
            })
            //$state.go('datastage.wizard.step_one',{selFiles: $scope.vm.selectedFiles})

        }*/


    }

    angular.module('bioSpeak.import')
        .controller('helpController',['$scope','$state','$stateParams','wizardService',helpController]);
