// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  console.log(censusData);

  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

    //Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d.poverty)*0.9, d3.max(censusData, d => d.poverty)*1.1])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d.healthcare)*0.9, d3.max(censusData, d => d.healthcare)*1.1])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "11")
    .classed("stateCircle", true);

    var textGroup = chartGroup.selectAll("text")
    .data(censusData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d.poverty))
    .attr("y", d => yLinearScale(d.healthcare)+4)
    .classed("stateText", true)
    .html(d => d.abbr);

    // Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state} <br> Poverty: ${d.poverty}% <br> Healthcare: ${d.healthcare}%`);
        });

    // Create tooltip in the chart
    chartGroup.call(toolTip);

    // Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });


    // Create axes labels
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "active")
    .text("Lacks healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "active")
      .text("In poverty (%)");


}).catch(function(error) {
  console.log(error);
});