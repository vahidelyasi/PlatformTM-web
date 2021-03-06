angular.module('biospeak.dcPlots')

    .factory('DCchartingService', ['$q', '$injector', 'XFilterLinker',
        function ($q, $injector, XFilterLinker) {


            var DCservice = {}

            var DataTypeEnum = {
                COUNT: 1,
                GROUPED_BY_TIME: 2,
                SERIES: 3
            };

            var obsToChartId = {}, //used to retrieving previously created charts
                _obsToChartIdMap = {},
                chartIdToObs = {}; //used when refreshing charts after xfilter data refresh



            //TEMP ... should be merged to the same varaible eventually either as a hashtable or list of ids
            var requestedObsvs = [];
            var counterWidgetId;
            ////////////////////////////


            DCservice.getDCchart = function (projectId, chartGroup, xfilterService, chartDataType, obsRequest) {

                var deferred = $q.defer();
                var chart;
                var obsId = obsRequest.name;

                //console.debug("=========1- Getting CHART for",obsId," ================== ")
                //console.debug("===params: ",projectId, obsId, chartGroup, xfilterService,chartDataType, obsRequest);

                if(_hasChart(obsId + '_' + chartDataType+"_"+chartGroup,chartGroup)){
                    console.log("ERROR: THIS SHOULD NOT BE HAPPENING");
                    deferred.reject();
                }
                else if (xfilterService.hasDimension(obsId, chartGroup)){
                    console.debug("Observation ", obsId, " exists in XF. Creating ", chartDataType)
                    chart = DCservice.createChart(obsId, xfilterService, chartDataType, obsRequest.dataType, chartGroup);
                    deferred.resolve(chart)
                }
                else {
                    console.debug("++Requested observation NOT FOUND IN XF++")
                    requestedObsvs.push(obsRequest);
                    xfilterService.refreshCf(projectId, requestedObsvs, chartGroup)
                        .then(function () {
                            chart = DCservice.createChart(obsId, xfilterService, chartDataType, obsRequest.dataType, chartGroup);
                            _refreshCharts(chartGroup, xfilterService);
                            _reApplySubjectFilter(xfilterService.getXFname());
                            deferred.resolve(chart)
                        })
                }
                return deferred.promise
            };

            DCservice.createChart = function (obsId, xfilterService, chartDataType, dataType, chartGroup) {

                var cfDimension, cfGroup;

                if (chartDataType === 'GroupedByTime') {
                    cfDimension = xfilterService.getTimeDimension()
                    cfGroup = xfilterService.getGroupByTime(obsId)
                } else {
                    cfDimension = xfilterService.getDimension(obsId, chartGroup)
                    cfGroup = xfilterService.getGroup(obsId, chartGroup)
                }

                if (cfGroup.all().length === 1 && cfGroup.all()[0].key === "(Blanks)")
                    return null;

                //console.debug("=======2=CREATING ",chartDataType," CHART for ",obsId, " dataype:",dataType);

                var chartData = _getChartOptions(obsId, cfDimension, cfGroup, chartDataType, dataType);

                //CREATE CHART
                var chartFactory = dc[chartData.chartType];
                var chart = chartFactory();
                chart.options(chartData.chartOptions);
                chart.chartType = chartData.chartType;
                chart.dimName = obsId;
                chart.dataType = dataType;
                chart.module = chartGroup;
                chart.chartName = obsId + "_" + chartDataType+"_"+chartGroup;


                //CACHING
                //Initialize Map if isn't
                //if (!_obsToChartIdMap[chartGroup]) {
                //    _obsToChartIdMap[chartGroup] = [];
                //}

                //obsToChartId[obsId + "_" + chartDataType+"_"+chartGroup] = chart.chartID();
                //_obsToChartIdMap[chartGroup].push(chart.chartID());
                chartIdToObs[chart.chartID()] = obsId;

                return chart
            };

            DCservice.createDCcounter = function (xfilterService, module, type) {
                var chartFactory = dc['dataCount'];
                var chart = chartFactory();
                var chartOptions = {};

                if (type === 'subject') {
                    chartOptions["dimension"] = xfilterService.getSubjectCountData(module)
                    chartOptions["group"] = xfilterService.getSubjectCountGroup(module)
                } else {
                    chartOptions["dimension"] = xfilterService.getCountData(module)
                    chartOptions["group"] = xfilterService.getCountGroup(module)
                }

                chart.options(chartOptions);
                chart.chartType = 'dataCount';
                chart.dimName = "counter";
                chart.module = module;
                counterWidgetId = chart.chartID();

                return chart
            };

            DCservice.createDCcounterBar = function (xfilterService, module, type) {
                var chartFactory = dc['dataCountBar'];
                var chart = chartFactory();
                var chartOptions = {};

                if (type == 'subject') {
                    chartOptions["dimension"] = xfilterService.getSubjectCountData(module)
                    chartOptions["group"] = xfilterService.getSubjectCountGroup(module)
                } else {
                    chartOptions["dimension"] = xfilterService.getCountData(module)
                    chartOptions["group"] = xfilterService.getCountGroup(module)
                }

                chart.options(chartOptions);
                chart.chartType = 'dataCount';
                chart.dimName = "counterBar";
                chart.module = module;
                counterWidgetId = chart.chartID();
                return chart
            };

            DCservice.createDCtable = function (xfilterService, module) {

                if (!xfilterService.cfReady(module))
                    return false;
                var chartFactory = dc['dataTable'];
                var chart = chartFactory();
                var chartOptions = {};
                chartOptions["dimension"] = xfilterService.getTableDimension(module);//subjectDim;//cfservice.getCountData()
                chartOptions["group"] = function (d) {
                    return "booo"
                }//xfilterService.getTableGroup();
                chartOptions["columns"] = xfilterService.getTableHeaders(module);//columns //observationCodes
                chartOptions["width"] = "960"
                chartOptions["height"] = "800"
                chartOptions["showGroups"] = 'false';
                chartOptions["sortBy"] = function (d) {
                    return d[xfilterService.getSubjectHeader()];
                }

                chart.options(chartOptions);
                chart.chartType = 'dataTable';
                chart.dimName = "table"
                chart.module = module;
                chart.on('renderlet', function (table) {
                    // each time table is rendered remove nasty extra row dc.js insists on adding
                    table.select('tr.dc-table-group').remove();
                });


                return chart
            };

            DCservice.propagateFilter = function (xfilterService, chartName, filter) {
                XFilterLinker.propagateFilter(xfilterService, chartName, filter);
            };

            DCservice.clearAll = function (chartGroup) {
                var allCharts = dc.chartRegistry.list(chartGroup);
                var chartsToremove = [];
                for (var i = 0, len = allCharts.length; i < len; i++) {
                    var chart = allCharts[i];
                    if (chart.chartType !== 'dataCount') {
                        chartsToremove.push(chart);
                    }
                };

                chartsToremove.forEach(function (chart) {
                    dc.deregisterChart(chart, chartGroup);
                });

                dc.redrawAll(chartGroup);
                obsToChartId = {};
                chartIdToObs = {};
                requestedObsvs = [];
            };

            DCservice.removeChart = function (obsReq, chartGroup) {
                var deferred = $q.defer();

                var mainChartName = obsReq.name + "_Count_"+chartGroup;
                var rangeChartName = obsReq.name + "_rangeChart_"+chartGroup;

                var mainChart =_findChartByName(mainChartName,chartGroup);
                var rangeChart = _findChartByName(rangeChartName,chartGroup);

                //console.log(mainChart);
                //console.log(rangeChart);
                if(mainChart){
                    console.log('removing',mainChart);
                    //TODO need testing
                    if(mainChart.hasFilter()){
                        console.debug('Removing filter first')
                        mainChart.filterAll();
                    }
                    else
                        console.debug('No filters applied so no not calling filter all')

                    dc.renderAll(chartGroup);
                    dc.deregisterChart(mainChart, chartGroup);
                    delete chartIdToObs[mainChart.chartID()];
                    if(rangeChart) {
                        console.debug('removing',rangeChart);
                        dc.deregisterChart(rangeChart, chartGroup);
                        delete chartIdToObs[rangeChart.chartID()];
                    }

                }
                deferred.resolve();
                return deferred.promise;
            };
            
            DCservice.init = function () {
                requestedObsvs = [];
                obsToChartId = {};
                chartIdToObs = {};
                dc.deregisterAllCharts();
            };

            DCservice.renderGroup = function(chartGroup){
                dc.renderAll(chartGroup);
            }

            /**
             * - Updates charts in the same group to reflect a new crossfilter instance after adding a new dimension
             * - Reapplies previously applied filters
             * @param chartGroup
             * @param xfilterService
             * @private
             */
            var _refreshCharts = function (chartGroup, xfilterService) {

                var allCharts = dc.chartRegistry.list(chartGroup);// change that to activeCharts?
                // console.log('=======3===REFRESHING CHARTS====='+chartGroup+'========= '+allCharts.length+' in total')
                var oldFilters;
                //console.log(allCharts)
                allCharts.forEach(function (chart) {
                    //console.log('got chart ',chart.chartID(),' ',chart.chartGroup(), chart)
                    if (chart.chartGroup() === chartGroup) {


                        oldFilters = chart.filters(); // Get current filters
                        //console.log('a',oldFilters)
                        chart.IsRefreshing = true;

                        //I need to know which observations this id was associated with so that I can query for
                        // the new dimensions created for this observation
                        var obs = chartIdToObs[chart.chartID()]
                        if (!angular.isUndefined(obs)) {
                            // console.log('/////REFRESHING CHART FOR ',obs, ' IN  MODULE/////////', module)
                            chart.dimension(xfilterService.getDimension(obs, chart.module))
                            chart.group(xfilterService.getGroup(obs, chart.module));
                        }

                        if (chart.chartType === 'dataTable') {
                            // console.log('/////REFRESHING TABLE FOR ',module,' MODULE/////////')
                            chart.dimension(xfilterService.getTableDimension(chart.module))
                            chart.group(xfilterService.getTableGroup());
                            chart.columns(xfilterService.getTableHeaders(chart.module));

                        }
                        if (chart.chartType === 'dataCount') {
                            // console.log('/////REFRESHING COUNTER WIDGET FOR ',module,' MODULE/////////')
                            chart.dimension(xfilterService.getCountData(chart.module))
                            chart.group(xfilterService.getCountGroup(chart.module));
                        }


                        if (oldFilters.length > 0) {
                            if (oldFilters.length > 1) {
                                oldFilters = new Array(oldFilters)
                            }
                            else {
                                oldFilters = oldFilters[0]
                            }
                            //console.log('/////REAPPLYING FILTERS ',oldFilters,' FOR ',obs,'/////////')
                            chart.replaceFilter(oldFilters)
                        }
                        chart.IsRefreshing = false;
                    }
                });
                dc.redrawAll(chartGroup)
            };

            var _getMinimumValue = function (dimension, val) {
                var orderedVals = dimension.bottom(Infinity)
                //console.log(orderedVals)
                var i = 0;
                while (orderedVals[i][val] == null || orderedVals[i][val] == "") {
                    i++;
                }
                //console.log(orderedVals[i][val])
                return orderedVals[i][val]
            };

            var _getChartOptions = function (val, cfDimension, cfGroup, chartDataType, dataType) {

                var chartType,
                    chartOptions = {};

                //console.log("Data type is", dataType, val)


                //if(val == 'sysbp') requiresBoxplot = true;
                if (chartDataType == 'GroupedByTime') {
                    //  console.log("doing boxplot")
                    chartType = "boxPlot"
                    chartOptions["width"] = 384 //768////
                    chartOptions["height"] = 240 //480////
                    chartOptions["margins"] = {top: 10, right: 50, bottom: 20, left: 50}
                    chartOptions["elasticX"] = "true"
                    chartOptions["elasticY"] = "true"
                    //chartOptions["boxWidth"] = "10"
                    //chartOptions["boxPadding"] = "0.9"
                    //.dimension(cfDimension)
                    //.group(cfGroup)

                }

                else if (dataType === 'dateTime') {
                    //console.log('making a time chart')
                    chartType = "barChart";
                    //chartOptions["width"] = "2000";
                    var maxDate = cfDimension.top(1)[0][val]
                    var minDate = _getMinimumValue(cfDimension, val)

                    //console.log(maxDate,minDate);
                    //chartOptions["margins"] = {top: 10, right: 20, bottom: 30, left: 30}

                    chartOptions["x"] = d3.time.scale().domain([minDate, maxDate]);

                    chartOptions["xUnits"] = d3.time.minutes
                    //chartOptions["round"] = (d3.time.month.round)
                    //chartOptions["yUnits"] = d3.time.days;
                    //chartOptions["renderArea"] = true
                    chartOptions["barPadding"] = 0.1;
                    chartOptions["outerPadding"] = 0.05;
                    chartOptions["brushOn"] = true;
                    //chartOptions["renderDataPoints"] = true

                }

                else if (dataType === 'ordinal' || dataType === 'integer') {

                    chartType = "barChart";
                    chartOptions["x"] = d3.scale.ordinal();
                    chartOptions["xUnits"] = dc.units.ordinal;
                    //   .brushOn(false)
                    //   .xAxisLabel('Fruit')
                    //   .yAxisLabel('Quantity Sold')
                    //   .dimension(fruitDimension)
                    chartOptions["barPadding"] = 0.1;
                    chartOptions["outerPadding"] = 0.05;
                    chartOptions["yAxisLabel"] = "Frequency"
                    chartOptions["xAxisLabel"] = val
                    //   .group(sumGroup);
                }
                //else if(isNaN(cfGroup.all()[0].key)){
                else if (dataType === "string") {

                    //console.log(cfGroup.all())
                    //Ordinal chart (rowChart or PieChart)

                    var noOfGroups = cfGroup.size();

                    //console.log('number of groups',noOfGroups)
                    //console.log('groups',cfGroup.all())
                    //console.log('dimensions groupall',cfDimension.groupAll().value())
                    //console.log('dimensions top',cfDimension.top(Infinity))

                    if (noOfGroups > 3) {
                        //console.log("Plotting a DC row chart ")
                        chartType = "rowChart"
                        chartOptions["elasticX"] = "true"
                        chartOptions["xAxis"] = {"ticks": "4"}
                        chartOptions["width"] = "300"
                        chartOptions["height"] = noOfGroups * 30 + 20
                        //var chartHeight = "180"
                        //chartOptions["fixedBarHeight"] = chartheight - (noOfGroups + 1) * gap / count
                        chartOptions["margins"] = {top: 10, right: 10, bottom: 20, left: 10}
                    }
                    else {
                        //console.log("making a pie chart ")
                        chartType = "pieChart";
                        chartOptions["radius"] = "100"
                        chartOptions["innerRadius"] = "50"
                        chartOptions["width"] = "300"
                        chartOptions["height"] = "250"
                        chartOptions["renderLabel"] = true
                        chartOptions["externalLabels"] = "50"
                        chartOptions["externalRadiusPadding"] = "20"
                        chartOptions["drawPaths"] = true
                        chartOptions["legend"] = dc.legend()
                        //chartOptions["slicesCap"] = "4"
                    }
                }


                else {
                    //console.log("Plotting a DC bar chart")
                    //numeric bar chart
                    //console.log(cfDimension.top(1)); console.log(cfGroup.all()[0].value)
                    maxValue = parseFloat(cfDimension.top(1)[0][val])
                    minValue = parseFloat(_getMinimumValue(cfDimension, val));

                    //var minTail = parseInt(minValue/4)
                    //var maxTail = parseInt(maxValue/4)

                    var offset = (maxValue - minValue ) / 10.0

                    //console.log('offset',offset, 'min before',minValue,'max before', maxValue)
                    maxValue = maxValue + offset;
                    minValue = minValue - offset;

                    //minValue = cfDimension.bottom(1)[0][val]
                    //console.log('max ',maxValue)
                    //console.log('min ',minValue)

                    chartType = "barChart";
                    chartOptions["transitionDuration"] = "500"
                    chartOptions["centerBar"] = "true"
                    chartOptions["gap"] = "20"
                    chartOptions["xAxisMin"] = minValue
                    chartOptions["xAxisMax"] = maxValue
                    chartOptions["x"] = d3.scale.linear().domain([minValue, maxValue])
                    //chartOptions["elasticX"] = "true"
                    chartOptions["elasticY"] = "true"
                    //chartOptions["elasticX"] = "true"
                    chartOptions["height"] = "320";

                    chartOptions["width"] = "310"
                    chartOptions["renderArea"] = true;
                    chartOptions["renderHorizontalGridLines"] = true;

                    if (chartDataType === 'rangeChart') {
                        //console.log('setting range chart to 40')
                        chartOptions["height"] = "60";

                        chartOptions["yAxisLabel"] = "";
                        chartOptions["xAxisLabel"] = "";
                        chartOptions["xAxisLabel"] = "";
                        chartOptions["margins"] = {top: 0, right: 50, bottom: 30, left: 40};
                        chartOptions["mouseZoomable"] = false;
                        chartOptions["brushOn"] = true;
                    } else {
                        chartOptions["height"] = "180"
                        chartOptions["yAxisLabel"] = "Frequency"
                        chartOptions["xAxisLabel"] = val
                        chartOptions["mouseZoomable"] = false;
                        chartOptions["brushOn"] = false;
                    }

                    //chartOptions["transitionDuration"] = 1000

                    chartOptions["xUnits"] = dc.units.fp.precision(0.01)

                    //+ " values"
                    //chartOptions["margins"] = "{top: 10, right: 10, bottom: 40, left: 20}"
                    //chartOptions[".xAxis().tickFormat"] = "2"
                    //d3.extent(data, function(d) { return d.TC; })
                    // bar width Keep increasing to get right then back off.
                    /* .x(d3.scale.linear()
                     .domain(d3.extent(data, function(d) { return d.TC; }))
                     )
                     .y(d3.scale.linear().domain([0, d3.max(data, function(d) { return d.close; })]))
                     .xAxis().tickFormat(function(v) {return v;});
                     */
                }


                chartOptions["dimension"] = cfDimension;
                chartOptions["group"] = cfGroup
                chartOptions["valueAccessor"] = function (p) {
                    return p.value.count;
                }
                chartOptions["controlsUseVisibility"] = true

                if (chartDataType === 'GroupedByTime') {
                    //chartOptions["dimension"] = cfDimension
                    chartOptions["group"] = cfGroup
                    chartOptions["valueAccessor"] = function (p) {
                        return p.value.valueList;
                    }
                }
                chartOptions["title"] = function (d) {
                    return d.value.count;
                }
                chartOptions["colors"] = etriks.myColors();

                var chartData = {}
                chartData.chartOptions = chartOptions;
                chartData.chartType = chartType;
                return chartData;

            };

            var _reApplySubjectFilter = function (XFname) {
                XFilterLinker.reApplySubjectFilter(XFname)
            };

            var _hasChart = function (cname,chartGroup) {
                var _charts = dc.chartRegistry.list(chartGroup);
                for (var i = 0; i < _charts.length; i++) {
                    if (_charts[i].chartName === cname) {
                        return true;
                    }
                }
                return false;
            };

            var _findChartByName = function(cname, chartGroup){
                var _charts = dc.chartRegistry.list(chartGroup);
                for (var i = 0; i < _charts.length; i++) {
                    if (_charts[i].chartName === cname) {
                        return _charts[i];
                    }
                }
                return false;
            };

            return DCservice;
        }]);