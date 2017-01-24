/**
 * Created by iemam on 17/05/2016.
 */
'use strict'
function AssayConfigCtrl($scope, $state, $stateParams, AssayConfigService){
    var vm = this;
    vm.projectId = $stateParams.projectId
    vm.assayId = $stateParams.assayId;
    console.log($stateParams.projectId)

    vm.templates={}
    vm.loaded = false;

    vm.featuresVM = {}
    vm.samplesVM = {}
    vm.dataVM = {}



    AssayConfigService.getAssayTerms().then(function(data){
        vm.assayTypes = data.terms;
        //console.log(vm.assayTypes)
        //updateTerms()
    });

    vm.genericFields = ['Reporter Database Entry','Reporter Group','Composite Element Database Entry','Composite Element Comment']

    vm.refsources = ['RefSeq','genbank']
    var updateTerms = function(){
        var selAssayType = vm.assay.type;
        //console.log(selAssayType)
        for(var i=0; i<vm.assayTypes.length; i++){
            var type = vm.assayTypes[i]
            if(type.assayTypeTerm.id == selAssayType){
                vm.assayTechTerms = type.assayTechTerms;
                vm.assayPlatTerms = type.assayPlatTerms;
            }
        }
    }
    
    vm.updateAssayTerms = updateTerms;
    
    vm.selectedDatasets = {};


    if($stateParams.assayId==0){
        console.log("New Assay")
        vm.assay = new AssayConfigService.getAssayResource();
        vm.assay.ProjectId = $stateParams.projectId;//"Study1"
        vm.assay.isNew = true;
        vm.assay.status = "New";
        vm.assay.datasets = {};
        vm.assay.assayId = 0;

    }

    else if($stateParams.assayId){
        console.log(AssayConfigService.getAssayResource);
        AssayConfigService.getAssayResource.get({assayId:$stateParams.assayId},function(response){
            vm.assay = response;
            vm.assay.isNew = false;
            console.log("Retrieved Assay",vm.assay.id);


            vm.selectedDatasets['sample'] = vm.assay.samplesDataset;
            vm.selectedDatasets['feature'] = vm.assay.featuresDataset;
            vm.selectedDatasets['data'] = vm.assay.observationsDataset;

            updateTerms();

        })
    }
    
    vm.showTemplate = function(domainId,dsType){
        AssayConfigService.getDatasetResource.get({datasetId:domainId}, function(response) {
            vm.selectedDatasets[dsType] = response;
            vm.selectedDatasets[dsType].isNew = true;
            vm.selectedDatasets[dsType].activityId = $stateParams.assayId;
            vm.selectedDatasets[dsType].projectStrAcc = vm.projectId;

        })
    }
    
    vm.saveTemplateToAssay = function(dsType){
        vm.assay.datasets[dsType] = vm.selectedDatasets[dsType];

        if(dsType == "sample")
            vm.assay.samplesDataset = vm.selectedDatasets[dsType];
        if(dsType == "feature")
            vm.assay.featuresDataset = vm.selectedDatasets[dsType];
        if(dsType == "data")
            vm.assay.observationsDataset = vm.selectedDatasets[dsType];


        console.log('Updating',dsType, 'template');
    }

    AssayConfigService.getAssaySampleTemplates().then(function(data) {
        if (data != null && !angular.isUndefined(data)) {
            vm.templates.sample = data.templates;
        }
    });
        AssayConfigService.getAssayFeatureTemplates().then(function(data) {
            if (data != null && !angular.isUndefined(data)) {
                vm.templates.feature = data.templates;
            }
        });

            AssayConfigService.getAssayDataTemplates().then(function(data) {
                if (data != null && !angular.isUndefined(data)) {
                    vm.templates.data = data.templates;
                }
            });
    vm.loadAssaySampleTemplates = function(){
        return AssayConfigService.getAssaySampleTemplates().then(function(data) {
            if (data != null && !angular.isUndefined(data)) {
                vm.templates.sample = data.templates;
            }
        })
    }

    vm.loadAssayFeatureTemplates = function(){
        return AssayConfigService.getAssayFeatureTemplates().then(function(data) {
            if (data != null && !angular.isUndefined(data)) {
                vm.templates.feature = data.templates;
            }
        })
    }
    vm.loadAssayDataTemplates = function(){
        return AssayConfigService.getAssayDataTemplates().then(function(data) {
            if (data != null && !angular.isUndefined(data)) {
                vm.templates.data = data.templates;
            }
        })
    }

    vm.saveAssay = function(){
        if(vm.assay.isNew){
            console.log(vm.assay)


            vm.assay.$save(function(response) {
                console.log("Assay created",response)
                $state.transitionTo('manager.main', $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            });
        }
        else{
            console.log("Activity Edited")
             console.log(vm.selectedDatasets)
            vm.assay.samplesDataset = vm.selectedDatasets['sample'];
            vm.assay.featuresDataset = vm.selectedDatasets['feature'];
            vm.assay.observationsDataset = vm.selectedDatasets['data'];

            //TODO: REPEATED SAVE AFTER FAILING FIRST tIME WILL KEEP PUSHING TO DAtASETS
            //NEED TO REMOVE BEFORE PUSH
            
            vm.assay.datasets.push(vm.selectedDatasets['sample'])
            vm.assay.datasets.push(vm.selectedDatasets['feature'])
            vm.assay.datasets.push(vm.selectedDatasets['data'])

            vm.assay.$update(function(response) {
                console.log("Activity Updated")
                $state.transitionTo('manager.main', $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            });
        }

        //console.log($stateParams)
        //$state.go('manager.activities.detail',$stateParams,{
        //    reload: true,
        //    inherit: false
        //    });
    }

    vm.dontSaveAssay = function(){
        vm.assay = {}
        $state.go('admin.project',{
            projectId: vm.projectId}
            );
    }
}

angular.module('bioSpeak.config')
    .controller('AssayConfigCtrl',['$scope', '$state','$stateParams','AssayConfigService','$timeout',AssayConfigCtrl])
