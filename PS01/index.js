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
          .orientation("7/8", "7/8")
          .size(10)
          .strokeWidth(.25)
          .stroke("#1F5869")
svg.call(t);

var formatComma = d3.format(",");

d3.csv("./daca_approvals.csv", function(error, loadData) {
    if (error) { throw error };

    // parsing for number output
    loadData.forEach(function(d){
        d.date = parsingTime(d.date);
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
    drawArea(dataIn, "#1F5869");
    drawLine(dataIn, "#1F5869" ,"1,0");

    //drawing projection area chart
    drawArea(projection, t.url())
    drawLine(projection, "#1F5869", "0.5,7");

    //drawing circles on data points
    drawPlots(dataIn, "#282D48");

    // calling title, subtitle and axis labels
    chartTitle();
    chartSubtitle();
    // xLabel();
    yLabel();

    window.setTimeout(drawAnnotation, 1200);

});

var parsingTime = d3.timeParse("%m/%d/%Y");

function drawAnnotation() {

  const type = d3.annotationCalloutCircle
  const annotations = [{
    note: { label: "On Sep 5, Attorney General Jeff Sessions announced the Trump administration would stop receiving work permit applications immediately and cancel the program in six months.", title: "The end of DACA", wrap: 200},
    // data: { date: "9/1/2017", initial_cumulative: 751659 },
    x: 1009, y: 130,
    dy:15, dx: 100,
    subject: { radius: 10, radiusPadding: 0 }
  }]

  // const parseTime = d3.timeParse("%b/%d/%Y")
  // const timeFormat = d3.timeFormat("%d/%m/%Y")

  const makeAnnotations = d3.annotation()
    .type(type)
    // accessors & accessorsInverse not needed
    // if using x, y in annotations JSON
    // .accessors({
    //   x: d => scaleX(parseTime(d.date)),
    //   y: d => scaleY(d.initial_cumulative)
    // })
    // .accessorsInverse({
    //    date: d => timeFormat(scaleX.invert(d.scaleX)),
    //    initial_cumulative: d => scaleY.invert(d.scaleY)
    // })
    .annotations(annotations)

  d3.select("svg")
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);
};

function drawArea(dataset, fill) {

      var initialArea = d3.area()
                           .x(0)
                           .y0(height - 200)
                           .y1(function(d) { return scaleY(d.initial_cumulative) });

      var area = d3.area()
                     .x(function(d) { return scaleX(d.date) })
                     .y0(height - 200)
                     .y1(function(d) { return scaleY(d.initial_cumulative) });

      var appendArea = svg.append("g")
                            .append("path")
                            .data([dataset])
                            .attr("class", "area")
                            .attr("fill", fill)
                            .attr("opacity", .5)
                            .attr("d", initialArea)
                             .transition()
                             .duration(1000)
                             .ease(d3.easeCubic)
                            .attr("d", area);

};

function drawLine(dataset, stroke, dotted) {

      var initialLine = d3.area()
                           .x(0)
                           .y0(height - 200)
                           .y1(function(d) { return scaleY(d.initial_cumulative) });

      var valueline = d3.line()
                     .x(function(d) { return scaleX(d.date) })
                     .y(function(d) { return scaleY(d.initial_cumulative) });

      var appendLine = svg.append("g")
                            .append("path")
                            .data([dataset])
                            .attr("class", "line")
                            .attr("fill", "none")
                            .attr("stroke", stroke)
                            .attr("stroke-width", 2.5)
                            .style("stroke-linecap", "round")
                            .style("stroke-dasharray", (dotted))
                            .attr("opacity", 1)
                            .attr("d", initialLine)
                             .transition()
                             .duration(1000)
                             .ease(d3.easeCubic)
                            .attr("d", valueline);
};

function drawPlots(dataset, fill) {

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("opacity", 0)
        .attr("cy", function(d) { return scaleY(d.initial_cumulative) })
        .attr("fill", fill)
        .attr('data-toggle', 'tooltip')
        .attr('title', function(d) {
            return "DACA requests approved: " + formatComma(d.initial_cumulative);
        })
        .attr("cx", 0)
          .transition()
          .duration(1000)
          .ease(d3.easeSin)
        .attr("cx", function(d) { return scaleX(d.date) })
        .attr("r", 4)
        ;

        $('[data-toggle="tooltip"]').tooltip();
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
