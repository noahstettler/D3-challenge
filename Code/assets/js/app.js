let width = parseInt(d3.select("#scatter").style("width"))
let height = width - width / 3.9
let margin = 20
let labelArea = 110
let textPadding = 40

const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart")

let getRadius = () => (width <= 530 ? 5 : 10)
radius = getRadius()

svg.append("g").attr("class", "xText")

let xText = d3.select(".xText")

function xLabelRender() {
  xText.attr(
    "transform",
    `translate(${(width - labelArea) / 2 + labelArea}, 
               ${height - margin - textPadding})`
  )
}

xLabelRender()

// Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)")

// Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)")

// Income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)")

let leftTextX = margin + textPadding
let leftTextY = (height + labelArea) / 2 - labelArea

// We add a second label group, this time for the y axis left of the chart.
svg.append("g").attr("class", "yText")

let yText = d3.select(".yText")

function yLabelRender() {
  yText.attr(
    "transform",
    `translate(${leftTextX}, ${leftTextY}) rotate(-90)`
  )
}
yLabelRender()

// Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)")

// Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)")

// Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)")

d3.csv("assets/data/data.csv")
  .then((data) => visualize(data))
  .catch((err) => console.log(err))

function visualize(theData) {
  let xData = "poverty"
  let yData = "obesity"

  const min = {
    x: 0,
    y: 0,
  }
  const max = {
    x: 0,
    y: 0,
  }

  // This function allows us to set up tooltip rules (see d3-tip.js).
  let toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(d => {
      let xLabel
      let stateLabel = `<div>${d.state}</div>`
      let yLabel = `<div>${yData}: ${d[yData]}%</div>`

      if (xData === 'poverty')
        xLabel = `<div>${xData}: ${d[xData]}%</div>`
      else
        xLabel = `<div>${xData}: ${parseFloat(d[xData]).toLocaleString('en')}</div>`

      return stateLabel + xLabel + yLabel
    })
  // Call the toolTip function.
  svg.call(toolTip)

  // Range setters
  function setXRange() {
    min.x = d3.min(theData, d => parseFloat(d[xData]) * 0.9)
    max.x = d3.max(theData, d => parseFloat(d[xData]) * 1.1)
  }

  function setYRange() {
    min.y = d3.min(theData, d => parseFloat(d[yData]) * 0.9)
    max.y = d3.max(theData, d => parseFloat(d[yData]) * 1.1)
  }

  // c. change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    d3.selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true)

    clickedText.classed("inactive", false).classed("active", true)
  }

  // Part 3: Instantiate the Scatter Plot
  // ====================================
  // This will add the first placement of our data and axes to the scatter plot.

  // First grab the min and max values of x and y.
  setXRange()
  setYRange()

  let xScale = d3
    .scaleLinear()
    .domain([min.x, max.x])
    .range([margin + labelArea, width - margin])
  let yScale = d3
    .scaleLinear()
    .domain([min.y, max.y])
    .range([height - margin - labelArea, margin])

  let xAxis = d3.axisBottom(xScale)
  let yAxis = d3.axisLeft(yScale)

  // Determine x and y tick counts.
  // Note: Saved as a function for easy mobile updates.
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5)
      yAxis.ticks(5)
    } else {
      xAxis.ticks(10)
      yAxis.ticks(10)
    }
  }
  tickCount()

  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")")
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)")

  // Now let's make a grouping for our dots and their labels.
  let theCircles = svg.selectAll("g theCircles").data(theData).enter()

  // We append the circles for each row of data (or each state, in this case).
  theCircles
    .append("circle")
    .attr("cx", d => xScale(d[xData]))
    .attr("cy", d => yScale(d[yData]))
    .attr("r", radius)
    .attr("class", d => `stateCircle ${d.abbr}`)
    .on("mouseover", function(d) {
      toolTip.show(d, this)
      d3.select(this).style("stroke", "#323232")
    })
    .on("mouseout", function (d) {
      toolTip.hide(d)
      d3.select(this).style("stroke", "#e3e3e3")
    })

  // With the circles on our graph, we need matching labels.
  // Let's grab the state abbreviations from our data
  // and place them in the center of our dots.
  theCircles
    .append("text")
    .text(d => d.abbr)
    .attr("dx", d => xScale(d[xData]))
    .attr("dy", d => yScale(d[yData]) + radius / 2.5)
    .attr("font-size", radius)
    .attr("class", "stateText")
    .on("mouseover", d => {
      toolTip.show(d)
      d3.select(`. ${d.abbr}`).style("stroke", "#323232")
    })
    .on("mouseout", d => {
      toolTip.hide(d)
      d3.select(`. ${d.abbr}`).style("stroke", "#e3e3e3")
    })

  // Part 4: Make the Graph Dynamic
  // ==========================
  // This section will allow the user to click on any label
  // and display the data it references.

  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function () {
    let self = d3.select(this)

    if (self.classed("inactive")) {
      // Grab the name and axis saved in label.
      let axis = self.attr("data-axis")
      let name = self.attr("data-name")

      // When x is the saved axis, execute this:
      if (axis === "x") {
        xData = name
        setXRange()
        xScale.domain([min.x, max.x])

        svg.select(".xAxis").transition().duration(300).call(xAxis)

        d3.selectAll("circle").each(function () {
          d3.select(this)
            .transition()
            .attr("cx", d => xScale(d[xData]))
            .duration(300)
        })

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function () {
          d3.select(this)
            .transition()
            .attr("dx", d => xScale(d[xData]))
            .duration(300)
        })

        labelChange(axis, self)
      } else {
        yData = name
        setYRange()
        yScale.domain([min.y, max.y])

        svg.select(".yAxis")
          .transition()
          .duration(300)
          .call(yAxis)

        d3.selectAll("circle").each(function () {
          d3.select(this)
            .transition()
            .attr("cy", d => yScale(d[yData]))
            .duration(300)
        })

        d3.selectAll(".stateText").each(function () {
          d3.select(this)
            .transition()
            .attr("dy", d => yScale(d[yData]) + radius / 3)
            .duration(300)
        })

        labelChange(axis, self)
      }
    }
  })

  // Part 5: Mobile Responsive
  // =========================
  // With d3, we can call a resize function whenever the window dimensions change.
  // This make's it possible to add true mobile-responsiveness to our charts.
  d3.select(window).on("resize", resize)

  function resize() {
    width = parseInt(d3.select("#scatter").style("width"))
    height = width - width / 3.9
    leftTextY = (height + labelArea) / 2 - labelArea

    svg.attr("width", width).attr("height", height)

    xScale.range([margin + labelArea, width - margin])
    yScale.range([height - margin - labelArea, margin])

    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")")

    svg.select(".yAxis").call(yAxis)

    // Update functions
    tickCount()
    xLabelRender()
    yLabelRender()
    getRadius()

    // With the axis changed, let's update the location and radius of the state circles.
    d3.selectAll("circle")
      .attr("cy", d => yScale(d[yData]))
      .attr("cx", d => xScale(d[xData]))
      .attr("r", radius)

    // We need change the location and size of the state texts, too.
    d3.selectAll(".stateText")
      .attr("dy", d => yScale(d[yData]) + radius / 3)
      .attr("dx", d => xScale(d[xData]))
      .attr("r", radius / 3)
  }
}
