/**
 * Created by iemam on 15/01/2015.
 */
angular.module('biospeak.explorer')

    .directive('clTreeClass', function(){
        return{
            restrict:'EA',
            scope:true,
            template:
                    '<div class="ibox-content">'+
                        '<h3>{{class.class}}</h3>'+
                        /*'<div class="input-group">' +
                            '<input type="text" placeholder="Search" class="input-sm form-control" ng-model="searchText"> ' +
                        '<span class="input-group-btn">'+
                            '<button type="button" class="btn btn-sm btn-primary"> Go!</button>' +
                        ' </span>' +
                        '</div>'+*/
                        '<ul>'+
                            '<cl-tree-obs-grp ng-repeat="domain in class.domains " group="domain" charting-opts = "chartingOpts" callbck = "updateCurrentCart(obs)"></cl-tree-obs-grp>'+
                        '</ul>'+
                    '</div>'
        }
    })

    .directive('clTreeObsGrp', function(){
        return{
            restrict:'EA',
            scope:{
                group:'=',
                chartingOpts:'=',
                sels:'=',
                callbck: '&'
            },
            controller: function($scope,$injector) {

                var clinicalDataService = $injector.get($scope.chartingOpts.clinicalDataService);
                var domain;

                $scope.localcallbck = function(obsRequest){
                    console.log("ana b2 here",obsRequest)
                    $scope.callbck({obs:obsRequest})
                }

                if($scope.group.isDomain){
                    domain = $scope.group;
                    domain.selMultiObsGrps = {};
                    domain.selMultiObsGrps.currSelected = [];
                    domain.selMultiObsGrps.tempSelected = [];
                    domain.selMultiObsGrps.grpRequests = [];

                }else {
                    $scope.group.selMultiObsGrps = $scope.sels
                }

                $scope.groupObservations = function(){
                    var multiObsList = $scope.group.selMultiObsGrps;
                    var currSelected = multiObsList.currSelected;
                    var tempSelected = multiObsList.tempSelected;
                    var selectedObsRequests = [];

                    tempSelected.forEach(function(node){
                        selectedObsRequests.push(node.defaultObservation)
                        currSelected.push(node);
                    })

                    clinicalDataService.getGroupObsNode($scope.chartingOpts.projectId,selectedObsRequests)
                        .then(function(obsGrpNode)
                        {
                            obsGrpNode.groupedObsNodes = angular.copy(tempSelected);


                            for(var i=0; i< obsGrpNode.groupedObsNodes.length;i++) {
                                obsGrpNode.groupedObsNodes[i].isLocked = true;
                                obsGrpNode.groupedObsNodes[i].isSelected = false
                            }

                            console.log(obsGrpNode);
                            $scope.group.selMultiObsGrps.grpRequests.push(obsGrpNode);


                            for(var i=0; i< currSelected.length;i++) {
                                currSelected[i].isGrouped = true
                            }
                            multiObsList.tempSelected = [];
                        })
                }

                $scope.checkChanged = function(checked){
                    var multiObsList = $scope.group.selMultiObsGrps;
                    var tempSelected = multiObsList.tempSelected;
                    var selectedNode = $scope.group;


                    if(checked){
                        console.log("adding node:",selectedNode.code);
                        tempSelected.push(selectedNode);
                    }
                    else{
                        var pos;
                        for(var i=0; i< tempSelected.length;i++) {
                            if(selectedNode.code == tempSelected[i].code){
                                pos = i;
                                break;
                            }
                        }
                        console.log('removing node',selectedNode.code, pos )
                        tempSelected.splice(pos,1);
                    }
                }
            },
            replace:true,
            template:
                '<li ng-hide="group.isGrouped">'+

                    /* > */
                    '<div class="node-toggle">' +
                        '<a style="outline:none;" class="btn btn-sm btn-outline btn-link " ' +
                            'ng-click="group.isCollapsed = !group.isCollapsed" ng-init="group.isCollapsed = true"'+
                            'ng-class="{collapsed: group.isCollapsed}">'+
                        '</a>'+
                    '</div>'+

                    /* text */
                    '<span class="list-item-text"  ' +
                           'ng-class="{group: group.isSelectable, selected: group.isSelected, locked:group.isLocked}"' +
                           'ng-class="{selected: group.isSelected}"' +
                           'uib-tooltip="{{group.name}} ({{group.count}})">' +
                        '{{group.name}} ({{group.count}})' +
                    '</span>'+

                    /* checkbox */
                    '<div class="node-select" ng-if="group.isSelectable && !group.isLocked">'+
                        '<input cl-select cb="groupClicked" type="checkbox"  ng-model="group.isSelected" >' +
                    '</div>'+

                    /*Group control*/
                    '<span class="link-btn" ng-if="group.isDomain" ng-show="group.selMultiObsGrps.tempSelected.length>0" class="pull-right">' +
                        '<a ng-click="groupObservations()" class="btn btn-xs btn-white"><i class="fa fa-link"></i>&nbsp;&nbsp;Group Selected Events</a>'+
                    '</span>'+


                    '<ul uib-collapse="group.isCollapsed" id="{{group.code}}"  class="list-group">'+

                        '<li ng-if="group.isDomain" ng-show="group.selMultiObsGrps.grpRequests.length > 0" class="animated fadeIn">' +
                            '<div class="selectDiv">' +
                                '<h4>Grouped Events</h4>'+
                                '<ul>'+
                                    '<li style="margin-bottom: 15px;" ng-repeat="grpNode in group.selMultiObsGrps.grpRequests">' +
                                        '<div class="grp-name">' +
                                            '<span>{{grpNode.defaultObservation.o3}}</span>' +

                                        '</div>'+
                                        '<div style="position:absolute; right:5px;top:0px;">' +
                                             '<a class="switchery" charting-button ' +
                                                 'obs="grpNode.defaultObservation"  charting-opts="chartingOpts" quals="grpNode.qualifiers"' +
                                                 'ng-init="grpNode.defaultObservation.isActive = false" ' +
                                                 'ng-class="{on:grpNode.defaultObservation.isActive}" '+
                                                 'ng-click="grpNode.defaultObservation.isActive = !grpNode.defaultObservation.isActive; grpNode.isLocked=true; localcallbck(grpNode.defaultObservation)">' +
                                                 '<small></small>'+
                                             '</a>'+
                                        '</div>' +
                                        '<ul>' +
                                            '<li cl-tree-obs class="list-item-text" ng-repeat="obsNode in grpNode.groupedObsNodes" node="obsNode" charting-opts="chartingOpts" ></li>'+
                                        '</ul>'+
                                    '</li>'+
                                '</ul>'+
                            '</div>' +
                        '</li>'+

                        '<li cl-tree-obs class="list-item-text" ng-repeat="node in group.terms " sels="group.selMultiObsGrps"  node="node" charting-opts="chartingOpts" callbck="localcallbck(request)"></li>'+
                    '</ul>'+
                '</li>',
            link: function (scope, element, attrs) {
                scope.$watch('group.isSelected', function(newVal) {
                    //console.log(newVal,scope.group.isSelected)
                    if (newVal) {
                            scope.group.terms.forEach(function(group){
                                group.isSelected = true//scope.group.isSelected;
                                if(group.defaultObservation){
                                    group.defaultObservation.isSelected = true
                                    group.defaultObservation.isActive = true
                                }
                            })
                        //}

                    }else{
                        if(scope.group.terms){
                            scope.group.terms.forEach(function(group){
                                group.isSelected = false;
                                if(group.defaultObservation){
                                    group.defaultObservation.isSelected = false
                                    group.defaultObservation.isActive = false
                                }
                            })
                        }
                    }
                })

                scope.$watch('group.isLocked', function(newVal) {
                    if (newVal) {
                        scope.group.terms.forEach(function(group){
                          group.isLocked = true;
                        })
                    }
                })
            }
        }
    })

    .directive('clTreeObs',function($compile){
        return{
            restrict:'EA',
            replace:true,
            scope:{
                chartingOpts:'=',
                node:'='/*,
                search:'='*/,
                sels:'=',
                callbck:'&'
            },
            controller: function($scope){
                $scope.updateCurrentCart = function(obsRequest){
                    //console.log("In here",obsRequest)
                    $scope.callbck({ request: obsRequest })
                }
            },
            template:

           '<div ng-class="{selected: node.isSelected}">' +
                '<div class="plotting-switch">'+
                    '<a ng-hide="node.isSelected || node.isLocked" class=" switchery" charting-button ' +
                        'obs="node.defaultObservation" quals="node.qualifiers" charting-opts="chartingOpts" style="color: #222f3f;" ' +
                        'ng-init="node.defaultObservation.isActive = false" ' +
                        'data-ng-disabled="node.isSelected" '+
                        'ng-class="{on:node.defaultObservation.isActive}" '+
                        'ng-click="node.defaultObservation.isActive = !node.defaultObservation.isActive;  updateCurrentCart(node.defaultObservation)"> ' +
                        '<small></small>'+
                    '</a>'+
                    '<a ng-show="node.isLocked" class="btn btn-xs btn-white" disabled="disabled"><i class="fa fa-link"></i></a>'+
                '</div>'+
                '<span>{{node.defaultObservation.o3}}</span>'+
            '</div>',

            link: function (scope, element, attrs) {
                if (angular.isArray(scope.node.terms)) {
                    $compile("<cl-tree-obs-grp group='node' sels='sels'  callbck = 'updateCurrentCart(obs)' charting-opts='chartingOpts'></cl-tree-obs-grp>")
                    (scope, function(cloned){
                        element.replaceWith(cloned);
                    });
                }
            }
        }
    })

    .directive('clOptionMenu', function() {
        return {
            restrict: 'EA',
            scope: {
                obs: '=',
                chartingOpts: '=',
                callbck:'&'
            },
            controller: function($scope){
                $scope.updateCurrentCart = function(obsRequest){
                    //console.log("In here",obsRequest)
                    $scope.callbck({ request: obsRequest })
                }
            },
            replace:true,
            template:
            '<div class="dropdown" uib-dropdown>'+
                '<a class="dropdown-toggle" href uib-dropdown-toggle>'+
                    '<i class="fa fa-ellipsis-v"></i>'+
                '</a>'+
                '<ul class=" dropdown-menu dropdown-menu-right plotting-options"> ' +
                    '<li class="dropdown-header">Chart Value for {{obs.o3}}</li>'+
                    '<li>' +
                        '<div ng-repeat="var in obs.qualifiers" class="checkbox">'+
                            '<input id="checkbox_{{var.id}}" type="checkbox" ' +
                                    'charting-button  obs="var"  ' +
                                    'ng-init="var.isActive = false" ' +
                                    'ng-click="var.isActive = !var.isActive; updateCurrentCart(var)" ' +
                                    'charting-opts="chartingOpts" >' +
                            '<label for="checkbox_{{var.id}}">{{var.qO2_label}}</label>' +
                        '</div>' +
                    '</li>' +
                '</ul>'+
            '</div>'
        }
    })

    .directive('clSelect',function($timeout){
        return {
            restrict: 'A',
            require: 'ngModel',

            link: function($scope, element, $attrs, ngModel) {
                return $timeout(function() {
                    var value;
                    value = $attrs['value'];

                    $scope.$watch($attrs['ngModel'], function(newValue){
                        $(element).iCheck('update');
                    })

                    return $(element).iCheck({
                        checkboxClass: 'icheckbox_square-aero'

                    }).on('ifChanged', function(event) {
                        $scope.$parent.checkChanged(event.target.checked)

                        //console.log("Im clicked",)
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                    });
                });
            }
        };
    })


