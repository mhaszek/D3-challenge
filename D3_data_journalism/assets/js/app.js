// @TODO: YOUR CODE HERE!

// Set initial params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Define function which loads the page at the start and on the window size change
function makeResponsive() {

  // Select svg area
  var svgArea = d3.select("body").select("svg");

  // Remove the svg area if it isn't empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // Select svg area parent div and assign it's width into a variable
  var parentDiv = d3.select('#scatter').node();
  var parentDivSize = parentDiv.getBoundingClientRect().width; 

  // Set svg area width and height based on the parent div's size
  var svgWidth = parentDivSize;
  var svgHeight = parentDivSize*0.7;

  // Define svg area margins
  var margin = {
    top: 20,
    right: 10 + svgWidth*0.1,
    bottom: 40 + svgHeight*0.1,
    left: 30 + svgWidth*0.1
  };

  // Define chart size
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Append svg area, set width and height
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append chart to the svg area
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


  // DEFINE FUNCTIONS //

  // Define function which updates x-scale
  function xScale(censusData, chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9, d3.max(censusData, d => d[chosenXAxis]) * 1.1])
      .range([0, width]);

    return xLinearScale;
  }

  // Define function which updates x-axis
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(500)
      .call(bottomAxis);

    return xAxis;
  }

  /// Define function which updates y-scale
  function yScale(censusData, chosenYAxis) {
 
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.9, d3.max(censusData, d => d[chosenYAxis]) * 1.1])
      .range([height, 0]);

    return yLinearScale;
  }

  // Define function which updates y-axis
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(500)
      .call(leftAxis);

    return yAxis;
  }

  // Define function which updates circles group
  function renderCircles(circlesArea, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesArea.selectAll("circle")
      .transition()
      .duration(500)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    circlesArea.selectAll("text")
      .transition()
      .duration(500)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", data => newYScale(data[chosenYAxis]));

    return circlesArea;
  }

  // Define function which updates tooltips
  function updateToolTip(chosenXAxis, chosenYAxis, circlesArea) {
    
    // Select tooltip
    var toolTipArea = d3.select("body").select(".tooltip");
    
    // Remove existing tooltip before rendering a new one
    if (!toolTipArea.empty()) {
      toolTipArea.remove();
    }

    // Create different suffixes and labels for tooltips for x and y axes
    var xlabel;
    var xsuffix;

    switch(chosenXAxis) {
      case "poverty":
        xlabel = "Poverty: ";
        xsuffix = '%';
        break;
      case "age":
        xlabel = "Age: ";
        xsuffix = '';
        break;
      case "income":
        xlabel = "Income: ";
        xsuffix = '$';
        break;
    }

    var ylabel;
    var ysuffix = '%';

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

    // Define tooltip
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state} <br> ${xlabel} ${d[chosenXAxis]}${xsuffix} <br> ${ylabel} ${d[chosenYAxis]}${ysuffix}`);
      });

    // Call tooltip
    chartGroup.call(toolTip);

    // Define behaviour of the circles during mouse hover 
    circlesArea.on("mouseover", function(data) {
      toolTip.show(data);
      d3.select(this).select("circle").style("stroke", "#000");

    }).on("mouseout", function(data) {
        toolTip.hide(data);
        d3.select(this).select("circle").style("stroke", "#e3e3e3");
      });
      
    return circlesArea;
  }

  // GET DATA AND CREATE A CHART //

  // Retrieve data from the CSV file
  d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    // Parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    // Create scale functions
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Append initial circles areas
    var circlesArea = chartGroup.selectAll("g")
      .data(censusData)
      .enter()
      .append("g");
    
    // Append the circles 
    circlesArea.append("circle")
      .attr("cx", data => xLinearScale(data[chosenXAxis]))
      .attr("cy", data => yLinearScale(data[chosenYAxis]))
      .attr("r", width*0.015)
      .classed("stateCircle", true);

    // Append the text inside circles
    circlesArea.append("text")
      .attr("x", data => xLinearScale(data[chosenXAxis]))
      .attr("y", data => yLinearScale(data[chosenYAxis]))
      .attr("alignment-baseline", "central")
      .text(data => data.abbr)
      .classed("stateText", true)
      .style("font-size", width*0.015+1 + "px");  

    // Create tooltips for circles   
    var circlesArea = updateToolTip(chosenXAxis, chosenYAxis, circlesArea);

    // Create axis functions + define number of ticks depending on the window size
    var bottomAxis = d3.axisBottom(xLinearScale).ticks(width/70);
    var leftAxis = d3.axisLeft(yLinearScale).ticks(height/50);

    // Append Axes to the chart
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .call(leftAxis); 

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + margin.top })`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", width*0.02+10)
      .attr("value", "poverty") 
      .text("In poverty (%)")
      .style("font-size", width*0.02+5 + "px");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", width*0.04+20)
      .attr("value", "age") 
      .text("Age (Median)")
      .style("font-size", width*0.02+5 + "px"); 

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", width*0.06+30)
      .attr("value", "income") 
      .text("Household Income (Median)")
      .style("font-size", width*0.02+5 + "px"); 

    // Select the labels' class depending on the selected x-axis
    xlabelsGroup.selectAll('text').each(function(d,i) { 

      if (d3.select(this).attr("value") === chosenXAxis){
        d3.select(this).classed("active", true);
      } else {
        d3.select(this).classed("inactive", true);
      }; 
              
    });

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left*0.4)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare")
      .text("Lacks healthcare (%)")
      .style("font-size", width*0.02+5 + "px"); 

    var smokesLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left*0.6)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes")
      .text("Smokes (%)")
      .style("font-size", width*0.02+5 + "px"); 

    var obesityLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left*0.8)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity")
      .text("Obesee (%)")
      .style("font-size", width*0.02+5 + "px"); 

    // Select the labels' class depending on the selected x-axis
    ylabelsGroup.selectAll('text').each(function(d,i) { 

      if (d3.select(this).attr("value") === chosenYAxis){
        d3.select(this).classed("active", true);
      } else {
        d3.select(this).classed("inactive", true);
      }; 

    });

    // Create x-axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // Get current axis value
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // Update chosenXAxis with value
          chosenXAxis = value;

          // Update x-scale
          xLinearScale = xScale(censusData, chosenXAxis);

          // Update x-axis
          xAxis = renderXAxes(xLinearScale, xAxis);

          // Update circles
          circlesArea = renderCircles(circlesArea, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Update tooltips
          circlesArea = updateToolTip(chosenXAxis, chosenYAxis, circlesArea);

          // Change the labels' class depending on the selected x-axis
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

    // Create y axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function() {
        // Get current axis value
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // Update chosenYAxis with value
          chosenYAxis = value;

          // Update y scale 
          yLinearScale = yScale(censusData, chosenYAxis);

          // Update y axis 
          yAxis = renderYAxes(yLinearScale, yAxis);

          // Update circles 
          circlesArea = renderCircles(circlesArea, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Update tooltips 
          circlesArea = updateToolTip(chosenXAxis, chosenYAxis, circlesArea);

          // Change the labels' class depending on the selected y-axis
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

  }).catch(function(error) {
    console.log(error);
  });

}

// Call the function in order to load the chart upon page load
makeResponsive();

// Create event listener for window resize
d3.select(window).on("resize", makeResponsive);