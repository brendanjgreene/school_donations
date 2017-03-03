/**
 * Created by brendangreene on 13/02/2017.
 */
queue()
   .defer(d3.json, "/donorsUS/projects")
   .await(makeGraphs);

function makeGraphs(error, projectsJson) {

    //Clean projectsJson data
    var donorsUSProjects = projectsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
    donorsUSProjects.forEach(function (d) {
        d["date_posted"] = dateFormat.parse(d["date_posted"]);
        d["date_posted"].setDate(1);
        d["total_donations"] = +d["total_donations"];
        d['school_longitude'] = +d['school_longitude'];
        d['school_latitude'] = +d['school_latitude'];
        d.Year = d.date_posted.getFullYear();

    });


    //Create a Crossfilter instance
    ndx = crossfilter(donorsUSProjects);

    //Define Dimensions

    dateDim = ndx.dimension(function (d) {
        return d["date_posted"];
    });
    var latDim = ndx.dimension(function (d) {
        return d["school_latitude"]
    });
    var longDim = ndx.dimension(function (d) {
        return [+d.school_longitude, +d.school_latitude];
    });

    var resourceTypeDim = ndx.dimension(function (d) {
        return d["resource_type"];
    });
    var povertyLevelDim = ndx.dimension(function (d) {
        return d["poverty_level"];
    });
    var stateDim = ndx.dimension(function (d) {
        return d["school_state"];
    });
    var countyDim = ndx.dimension(function (d) {
        return d["school_county"];
    });
    totalDonationsDim = ndx.dimension(function (d) {
        return d["total_donations"];
    });
    var fundingStatus = ndx.dimension(function (d) {
        return d["funding_status"];
    });


    //Calculate metrics
    var numProjectsByDate = dateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByPovertyLevel = povertyLevelDim.group();
    var numProjectsByFundingStatus = fundingStatus.group();
    var totalDonationsByState = stateDim.group().reduceSum(function (d) {
        return d["total_donations"];
    });
    var totalDonationsByCounty = countyDim.group().reduceSum(function (d) {
        return d["total_donations"];
    });
    var stateGroup = stateDim.group();
    var countyGroup = countyDim.group();

    var Lat = longDim.group().reduceSum(function (d) {
        return d.school_longitude;
    });



    var all = ndx.groupAll();
    totalDonations = ndx.groupAll().reduceSum(function (d) {
        return d["total_donations"];
    });


    var max_state = totalDonationsByState.top(1)[0].value;
    var max_county = totalDonationsByCounty.top(1)[0].value;

    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];

    var minLong = longDim.bottom(1)[0]["school_longitude"];
    var maxLong = longDim.top(1)[0]["school_longitude"];

    var minLat = latDim.bottom(1)[0]["school_latitude"];
    var maxLat = latDim.top(1)[0]["school_latitude"];


    //Charts
    timeChart = dc.lineChart("#time-chart");
    timeRangeChart = dc.barChart("#time-range-chart");
    resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    numberProjectsND = dc.numberDisplay("#number-projects-nd");
    totalDonationsND = dc.numberDisplay("#total-donations-nd");
    fundingStatusChart = dc.pieChart("#funding-chart");
    datatable = dc.dataTable("#dcdatatable");
    mySize = dc.numberDisplay("#mySize");
    scatterChart = dc.scatterPlot("#scatter");

    scatterChart
        .width(700)
        .height(300)
        .x(d3.scale.linear().domain([-130, -60]))
        .y(d3.scale.linear().domain([22, 52]))
        .brushOn(false)
        .symbolSize(1)
        .clipPadding(2)
        .dimension(longDim)
        .group(Lat);


    datatable
        .dimension(dateDim)
        .group(function(d) { return d.Year; })
        .turnOnControls(true)
        .size(Infinity)
        .columns([
            function (d) {
                return d.date_posted.getMonth() + 1 + "/" + d.date_posted.getFullYear();
            },
            function (d) {
                return d.total_donations
            },
            function (d) {
                return d.resource_type
            },
            function (d) {
                return d.poverty_level
            },
            function (d) {
                return d.school_state
            },
            function (d) {
                return d.school_county
            }
        ])
        .order(d3.ascending);


    selectField = dc.selectMenu('#menu-select')
        .dimension(stateDim)
        .group(stateGroup);

    selectField2 = dc.selectMenu('#menu-select2')
        .dimension(countyDim)
        .group(countyGroup);

    mySize
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all)
        .formatNumber(d3.format(","));

    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalDonations)
        .formatNumber(d3.format("$.3s"));

    timeChart
        .width(625)
        .height(200)
        .renderArea(true)
        .margins({top: 10, right: 30, bottom: 40, left: 40})
        .dimension(dateDim)
        .rangeChart(timeRangeChart)
        .group(numProjectsByDate)
        .brushOn(false)
        .mouseZoomable(true)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel('Select Below to Zoom in on a time range')
        .yAxis().ticks(4);

    timeRangeChart
        .width(625)
        .height(50)
        .margins({top: 0, right: 30, bottom: 20, left: 40})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .yAxis().ticks(0);

    resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .elasticX(true)
        .xAxis().ticks(4);

    povertyLevelChart
        .width(300)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .elasticX(true)
        .xAxis().ticks(4);

    fundingStatusChart
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus);

    update();
    dc.renderAll();
}
var ofs = 1, pag = 15;
function display() {
        d3.select('#begin')
            .text(ofs);
        d3.select('#end')
            .text(ofs+pag-1);
        d3.select('#last')
            .attr('disabled', ofs-pag<0 ? 'true' : null);
        d3.select('#next')
            .attr('disabled', ofs+pag>=parseInt($("#mySize").text()) ? 'true' : null);
}
function update() {
      datatable.beginSlice(ofs-1);
      datatable.endSlice(ofs+pag-1);
      display();
}
function next() {
      ofs += pag;
      update();
      datatable.redraw();
}
function last() {
      ofs -= pag;
      update();
      datatable.redraw();
}

function resetofs() {
    ofs = 1;
    update();
    datatable.redraw();
}
function lastpag() {
    ofs = 1+parseInt($("#mySize").text())-pag;
    update();
    datatable.redraw();
}
