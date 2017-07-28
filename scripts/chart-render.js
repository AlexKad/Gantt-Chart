
const barHeight = 50;
const chartMargin = {top: 20, right: 20, bottom: 30, left: 40};

function renderDateAxis(g, width, height, minDate=0, maxDate=31){
  var x = d3.scaleLinear().rangeRound([55, width]);
  x.domain([minDate, maxDate]);

  var xAxis = d3.axisBottom(x).tickSize(height);

  g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(0,0)")
      .call(customXAxis);//d3.axisTop(x));

  function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("y", 4).attr("dx", 15);
  }
  return x;
}

function renderTaskAxis(g, width, data){
  var y = d3.scaleBand()
            .rangeRound([ 20, barHeight*data.length])
            .domain(data.map(function(d) { return d.name; }));
  var yAxis = d3.axisRight(y).tickSize(width);
  g.append("g")
      .attr("class", "axis axis-y")
      .attr("transform", "translate(0,0)")
      .call(customYAxis);//d3.axisLeft(y));

  function customYAxis(g) {
    g.call(yAxis);
    g.select(".domain").remove();
    g.selectAll(".tick:not(:last-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
  }
  return y;
}

function renderChart(data, minDate, maxDate){
  var svg = d3.select("svg"),
      width = +svg.attr("width") - chartMargin.left - chartMargin.right,
      height = +svg.attr("height") - chartMargin.top - chartMargin.bottom;

  var g = svg.append("g")
          .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

  var x = renderDateAxis(g, width, height, minDate, maxDate);
  var y = renderTaskAxis(g, width, data);


  g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.start); })
        .attr("y", function(d) { return y(d.name); })
        .attr("width", function(d) { return x(d.end)-x(d.start); })
        .attr("height", barHeight/2);
}
