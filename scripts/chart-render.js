const barHeight = 40;
const chartMargin = {top: 20, right: 20, bottom: 30, left: 40};

function renderDateScale(g, width, minDate=0, maxDate=31){
  var x = d3.scaleLinear().rangeRound([45, width]);
  x.domain([minDate, maxDate]);
  g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(0,0)")
      .call(d3.axisTop(x));
  return x;
}

function renderTaskScale(g, data){
  var y = d3.scaleBand().rangeRound([ barHeight*data.length, 0]);
  y.domain(data.map(function(d) { return d.name; }));
  g.append("g")
      .attr("class", "axis axis-y")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(y));
  return y;
}

function renderChart(data, minDate, maxDate){
  var svg = d3.select("svg"),
      width = +svg.attr("width") - chartMargin.left - chartMargin.right,
      height = +svg.attr("height") - chartMargin.top - chartMargin.bottom;

  var g = svg.append("g")
          .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

  var x = renderDateScale(g, width, minDate, maxDate);
  var y = renderTaskScale(g, data);

  g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.start); })
        .attr("y", function(d) { return y(d.name); })
        .attr("width", function(d) { return x(d.end)-x(d.start); })
        .attr("height", barHeight-5);
}
