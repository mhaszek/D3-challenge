// @TODO: YOUR CODE HERE!
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = window.innerWidth*0.8;
  var svgHeight = window.innerWidth*0.5;

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


///      FUNCTIONS TO MAKE THE AXIS AND CIRCLES RESPONSIVE   ///////////////

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8, d3.max(censusData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating x-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8, d3.max(censusData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;

}


// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;

}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;

}



// function used for updating circles group with a transition to
// new circles
function renderCircles(testgs, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  testgs.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cx", d => newXScale(d[chosenYAxis]))
    .attr("x", data => xLinearScale(data[chosenXAxis]))
    .attr("y", data => yLinearScale(data[chosenYAxis]+4));

  return testgs;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, testgs) {

  var xlabel;
  var xsuffix;

  switch(chosenXAxis) {
    case "poverty":
      xlabel = "Poverty: ";
      xsuffix = '(%)';
      break;
    case "age":
      xlabel = "Age: ";
      xsuffix = '';
      break;
    case "income":
      cxlabel = "Income: ";
      xsuffix = '$';
      break;
  }

  var ylabel;
  var ysuffix = '(%)';

  switch(chosenYAxis) {
    case "healthcare":
      ylabel = "Healthcare: ";
      break;
    case "obesity":
      ylabel = "Obesity: ";
      break;
    case "smokes":
      ylabel = "Smokers: ";
      break;
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state} <br> ${xlabel} ${d[chosenXAxis]} ${xsuffix} <br> ${ylabel} ${d[chosenYAxis]} ${ysuffix}`);
    });

  chartGroup.call(toolTip);

  testgs.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return testgs;
}


///////////////////////////////////////////////////////////////////////////

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
      var xLinearScale = xScale(censusData, chosenXAxis);

      var yLinearScale = yScale(censusData, chosenYAxis);

     // append initial circles
      var testgs = chartGroup.selectAll("g")
        .data(censusData)
        .enter()
        .append("g");
      
      testgs.append("circle")
        .attr("cx", data => xLinearScale(data[chosenXAxis]))
        .attr("cy", data => yLinearScale(data[chosenYAxis]))
        .attr("r", width*0.02)
        .classed("stateCircle", true);

      testgs.append("text")
        .attr("x", data => xLinearScale(data[chosenYAxis]))
        .attr("y", data => yLinearScale(data[chosenYAxis])+4)
        .text(data => data.abbr)
        .classed("stateText", true)
        .style("font-size", width*0.02+1 + "px");  
        
      testgs.exit().remove();
      
      var testgs = updateToolTip(chosenXAxis, chosenYAxis, testgs);

      // Create axis functions
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // Append Axes to the chart
      var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

      chartGroup.append("g")
        .call(leftAxis); 

      // Create group for three x-axis labels

      var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + margin.top })`);

      var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In poverty (%)");

      var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

      var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

      // Create group for three y-axis labels

      var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

      var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 70)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks healthcare (%)");

      var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

      var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesee (%)");

      // x axis labels event listener
      xlabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);


            // updates circles with new x values
            testgs = renderCircles(testgs, newXScale, chosenXAxis, newYScale, chosenYAxis);

            // updates tooltips with new info
            testgs = updateToolTip(chosenXAxis, chosenYAxis, testgs);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });


  }).catch(function(error) {
    console.log(error);
  });



}

makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
