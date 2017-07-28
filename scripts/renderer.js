const barHeight = 90;
const chartMargin = {top: 40, right: 20, bottom: 20, left: 40};
const leftPadding = 60;

function getDateScale(minDate, maxDate, width){
  var scale = d3.scaleLinear()
                .domain([minDate, maxDate])
                .range([0, width-leftPadding]);
  return scale;
}
function renderDateAxis(scale, svg, height){
  var xAxis = d3.axisBottom()
                .scale(scale)
                .tickSize(height);
  var g = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+ leftPadding +", 20)")
            .call(customXAxis);

  function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("y", -15).attr("dx", 35);
  }
}
function getNameScale(data, height){
  var scale = d3.scaleBand()
                .domain(data.map(function(d) { return d.name; }))
                .range([ 0, barHeight*data.length]);
  return scale;
}
function renderNameAxis(scale, svg, width){
  var yAxis = d3.axisRight()
                .scale(scale)
                .tickSize(width);
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate("+ leftPadding +", 40)")
     .call(customYAxis);

   function customYAxis(g) {
     g.call(yAxis);
     g.select(".domain").remove();
     g.selectAll(".tick:not(:last-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
     g.selectAll(".tick text").attr("x", -40).attr("dy", -20);
   }
}

function renderChart(data, minDate, maxDate){
  var svg = d3.select("svg"),
      width = +svg.attr("width") - chartMargin.left - chartMargin.right,
      height = +svg.attr("height") - chartMargin.top - chartMargin.bottom;

  var g = svg.append("g")
          .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

  var dateScale = getDateScale(minDate, maxDate, width);
  var nameScale = getNameScale(data, height);

  renderDateAxis(dateScale, svg, height);
  renderNameAxis(nameScale, svg, width);

}
