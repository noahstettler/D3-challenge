const svgWidth = 960
const svgHeight = 500
​
let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
}
​
let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom
​
let svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
​
let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
​
// View selection - changing this triggers transition
let currentSelection = "poverty"
​
​
// ========================= UPDATE FUNCTIONS =========================
// Write a function to update the linear scale of the x axis using the following format
function xScale(povData, currentSelection) {
  let xLinearScale = d3.scaleLinear()
    .domain([
      d3.min(povData, d => d[currentSelection]) * 0.8,
      d3.max(povData, d => d[currentSelection]) * 1.2
    ])
    .range([0, width])
​
  return xLinearScale
}
​
// Write a function to trigger the transition on the X axis
function renderAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale)
​
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis)
​
  return xAxis
}
​
// Write a function to trigger the transition on the circlesGroup
function renderCircles(circlesGroup, newXScale, currentSelection) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[currentSelection]))
​
  return circlesGroup
}
​
/*********** START HERE ***********/
// Initialize the chart
function initChart() {
  d3.csv("..", "data", "data.csv").then(povData => {
    // parse data
    povData.forEach(function(data) {
      data.poverty = +data.poverty
      data.healthcare = +data.healthcare
    })
​
    // Initialize X and Y linear scales
    let xLinearScale = xScale(povData, currentSelection)
    let yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(povData, d => d.healthcare)])
      .range([height, 0])
​
    // Initialize the left and bottom axes
    let bottomAxis = d3.axisBottom(xLinearScale)
    let leftAxis = d3.axisLeft(yLinearScale)
​
    // Append the X axis to the chartGroup and translate its position
    let xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)
​
    // Append the left axis to the chart group
    chartGroup.append("g").call(leftAxis)
​
    // Add the data points to the chart
    let circlesGroup = chartGroup.selectAll("circle")
      .data(povData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[currentSelection]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".5")
​
    // Create a group element for the labels and append it to the chart group
    let labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)
    

    /** For the labels, use the 'y' attribute to position them */
    // Append text to the labels group for the poverty label
    labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Citizens who are in Poverty(%)")
​
    // Append the Y axis label to the chart group
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Citizens who Lacks Healthcare(%)")
​
    // Crate an event listener to call the update functions when a label is clicked
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value")
        if (value !== currentSelection) {
          // replaces currentSelection with value
          
          currentSelection = value
          xLinearScale = xScale(povData, currentSelection)
          xAxis = renderAxes(xLinearScale, xAxis)
          circlesGroup = renderCircles(circlesGroup, xLinearScale, currentSelection)
        }
      })
  })
}
​
initChart()