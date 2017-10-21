var height = 700;
var width = 1350;

var padding = { "top": 100,
                "right": 100,
                "bottom": 100,
                "left": 100 };

// creating svg canvas
var svg = d3.select(".svg-container")
              .append("svg")
              .attr("height", height)
              .attr("width", width)
              .append("g")
              .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

scaleY = d3.scaleLinear()
            .range([0, height - padding.top - padding.bottom])
            .nice(); // making scale end in round number

scaleX = d3.scaleTime()
            .range([0, width - padding.right - padding.left]);

var t = textures.lines()
    .orientation("diagonal")
    .size(40)
    .strokeWidth(26)
    .stroke("#282D48")
    .background("firebrick");

svg.call(t);

d3.csv("./daca_approvals.csv", function(error, loadData) {
    if (error) { throw error };

    // parsing for number output
    loadData.forEach(function(d){
        d.date = parseTime(d.date);
        d.initial_intake = +d.initial_intake;
        d.initial_approval = +d.initial_approval;
        d.initial_cumulative = +d.initial_cumulative;
        d.renewal_intake = +d.renewal_intake;
        d.renewal_approval = +d.renewal_approval;
    });

    var dataIn = loadData.filter( function(d) { return d.data_origin == "uscis" });

    var projection = loadData.filter( function(d) { return d.data_origin == "projection" });

    var maxY = getMaxY(loadData);

    scaleX.domain(d3.extent(loadData, function(d) { return d.date; }))
    scaleY.domain([maxY,0]).nice()

    // calling axis
    xAxis(scaleX);
    yAxis(scaleY);

    // drawing data area chart
    // drawArea(dataIn, "#d11919");
    drawArea(dataIn, t.url());
    drawLine(dataIn, "1,0");

    //drawing projection area chart
    drawArea(projection, "none")
    drawLine(projection, "0.5,5");

    //drawing circles on data points
    drawPlots(dataIn, "#282D48", 0);

    // calling title, subtitle and axis labels
    chartTitle();
    chartSubtitle();
    // xLabel();
    yLabel();

});

var parseTime = d3.timeParse("%m/%d/%Y");

function drawArea(dataset, fill) {

      var area = d3.area()
                     .x(function(d) { return scaleX(d.date) })
                     .y0(height - 200)
                     .y1(function(d) { return scaleY(d.initial_cumulative) });

      var appendArea = svg.append("path")
                            .data([dataset])
                            .attr("class", "area")
                            .attr("fill", fill)
                            .attr("opacity", .8)
                            .attr("d", area);

};

function drawLine(dataset, stroke) {

      var valueline = d3.line()
                     .x(function(d) { return scaleX(d.date) })
                     .y(function(d) { return scaleY(d.initial_cumulative) });

      var appendLine = svg.append("path")
                            .data([dataset])
                            .attr("class", "line")
                            .attr("fill", "none")
                            .attr("stroke", "#990000")
                            .attr("stroke-width", 2.5)
                            .style("stroke-linecap", "round")
                            .style("stroke-dasharray", (stroke))
                            .attr("opacity", 1)
                            .attr("d", valueline);
};

function drawPlots(dataset, fill, radius) {

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return scaleX(d.date) })
        .attr("cy", function(d) { return scaleY(d.initial_cumulative) })
        .attr("r", radius)
        .attr("fill", fill);
};

function getMaxY(dataset) {
      return d3.max(dataset, function(d) { return d.initial_cumulative * 1.05 });
};

// defining functions to append axis
function xAxis(scale) {
          svg.append("g")
              .attr("transform", "translate(0,500)" )
              .attr("class", "xAxis")
              .call(d3.axisBottom(scale));
};

function yAxis(scale) {

          svg.append("g")
              .attr("transform", "translate(0,0)")
              .attr("class", "yAxis")
              .call(d3.axisLeft(scale));
};

// defining functions to append title, subtitle and labels to axis
function chartTitle() {
          svg.append("text")
               .attr("x", 0)
               .attr("y", -50)
               .attr("class", "title")
               .text("DACA approvals, 2012-17");
};

function chartSubtitle() {
          svg.append("text")
               .attr("x", 0)
               .attr("y", -25)
               .attr("class", "subtitle")
               .text("" );
};

// function xLabel() {
//           svg.append("text")
//               .attr("x", 300)
//               .attr("y", 440)
//               .attr("class", "label")
//               .attr("text-anchor", "middle")
//               .text("Total earnings, in USD");
// };

function yLabel() {
          svg.append("text")
               .attr("transform", "rotate(270)")
               .attr("x", -100)
               .attr("y", -70)
               .attr("class", "label")
               .attr("text-anchor", "middle")
               .text("Cumulative approvals");
};
