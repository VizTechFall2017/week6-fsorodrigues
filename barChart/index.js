var width = d3.select('svg').attr('width');
var height = d3.select('svg').attr('height');

var marginLeft = 100;
var marginTop = 100;

var svg = d3.select('svg')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

//set up scales to position circles using the data
var scaleX = d3.scaleBand()
                .rangeRound([0, 600])
                .padding(0.1);

var scaleY = d3.scaleLinear()
                .range([400, 0]);  //remember that 0,0 is at the top of the screen! 300 is the lowest value on the y axis

var nestedData = [];

//import the data from the .csv file
d3.csv('./countryData.csv', function(dataIn){

    nestedData = d3.nest()
        .key(function(d){return d.year})
        .entries(dataIn);

    var loadData = nestedData.filter(function(d){return d.key == '2007'})[0].values;

    scaleX.domain(loadData.map(function(d) {
                        return d.countryCode;
                      }))

    scaleY.domain([0,d3.max(loadData.map(function(d) {
                        return +d.totalPop;
                      }))])
          .nice();

  // Add the x Axis
  svg.append("g")
      .attr('transform','translate(0,400)')  //move the x axis from the top of the y axis to the bottom
      .call(d3.axisBottom(scaleX));

  // Add the y Axis
  svg.append("g")
      .attr("class", "yAxis")
      .call(d3.axisLeft(scaleY));

  svg.selectAll(".bars")
      .data(loadData)
      .enter()
      .append("rect")
      .attr("class", "bars")
      .attr("fill", "black")

    drawPoints(loadData);
});

//this function draws the actual data points as circles.
function drawPoints(pointData){

    scaleY.domain([0,d3.max(pointData.map(function(d) { return +d.totalPop; }) )])
          .nice();

    svg.selectAll('.bars')
        .data(pointData)
        .attr('x',function(d){ return scaleX(d.countryCode); })
        .attr('y',function(d){ return scaleY(d.totalPop); })
        .attr("width", scaleX.bandwidth())
        .attr("height", function(d) { return (400 - scaleY(d.totalPop)); });

    d3.selectAll(".yAxis")
      .call(d3.axisLeft(scaleY));

};


function updateData(selectedYear){
    return nestedData.filter(function(d){return d.key == selectedYear})[0].values;
}


//this function runs when the HTML slider is moved
function sliderMoved(value){

    newData = updateData(value);
    drawPoints(newData);

}
