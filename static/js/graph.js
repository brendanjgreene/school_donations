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
        d.Year = d.date_posted.getFullYear();
    });


    //Create a Crossfilter instance
    ndx = crossfilter(donorsUSProjects);

    //Define Dimensions
    var dateDim = ndx.dimension(function (d) {
        return d["date_posted"];
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


    var all = ndx.groupAll();
    totalDonations = ndx.groupAll().reduceSum(function (d) {
        return d["total_donations"];
    });

    results=all

    var max_state = totalDonationsByState.top(1)[0].value;
    var max_county = totalDonationsByCounty.top(1)[0].value;

    //Define values (to be used in charts)
    minDate = dateDim.bottom(1)[0]["date_posted"];
    maxDate = dateDim.top(1)[0]["date_posted"];


    //Charts
    timeChart = dc.lineChart("#time-chart");
    timeRangeChart = dc.barChart("#time-range-chart");
    resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    numberProjectsND = dc.numberDisplay("#number-projects-nd");
    totalDonationsND = dc.numberDisplay("#total-donations-nd");
    fundingStatusChart = dc.pieChart("#funding-chart");
    datatable = dc.dataTable("#dcdatatable");


    datatable
        .dimension(dateDim)
        .group(function (d) {
            return d.Year
        })
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
        ]);


    selectField = dc.selectMenu('#menu-select')
        .dimension(stateDim)
        .group(stateGroup);

    selectField2 = dc.selectMenu('#menu-select2')
        .dimension(countyDim)
        .group(countyGroup);


    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);

    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"));

    timeChart
        .width(750)
        .height(200)
        .renderArea(true)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .rangeChart(timeRangeChart)
        .group(numProjectsByDate)
        .brushOn(false)
        .mouseZoomable(true)
        .transitionDuration(500)
        .margins({top: 30, right: 50, bottom: 50, left: 40})
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel('Select Below to Zoom in on a time range')
        .yAxis().ticks(4);

    timeRangeChart
        .width(750)
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
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


var ofs = 0, pag = 17;
function display() {
        d3.select('#begin')
            .text(ofs);
        d3.select('#end')
            .text(ofs+pag-1);
        d3.select('#last')
            .attr('disabled', ofs-pag<0 ? 'true' : null);
        d3.select('#next')
            .attr('disabled', ofs+pag>=maxDate ? 'true' : null);
        d3.select('#size')
            .text(ndx.size);

}
function update() {
      datatable.beginSlice(ofs);
      datatable.endSlice(ofs+pag);
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
