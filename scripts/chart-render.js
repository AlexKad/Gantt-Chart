const barHeight = 50;
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
            .attr("class", "axis x-axis")
            .attr("transform", "translate("+ leftPadding +", 15)")
            .call(customXAxis);

  function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick text").attr("y", -15).attr("dx", 30);

    var lastLine = g.select(".tick:last-of-type");
    var t = lastLine.attr('transform');
    var translate = t.substring(t.indexOf("(")+1, t.indexOf(")")).split(",");
    g.append("g")
     .attr('class', 'tick')
     .attr("transform", "translate(" + (+translate[0]+ barHeight) + "," + (+translate[1])+")")
     .append('line').attr("y2", height);
  }
}
function getNameScale(data){
  var scale = d3.scaleBand()
                .domain(data.map(function(d) { return d.name; }))
                .range([ 0, barHeight*data.length]);
  return scale;
}
function renderNameAxis(scale, svg, width){
  var yAxis = d3.axisRight()
                .scale(scale)
                .tickSize(width-10);
  svg.append("g")
     .attr("class", "axis y-axis")
     .attr("transform", "translate("+ leftPadding +", 40)")
     .call(customYAxis);

   function customYAxis(g) {
     g.call(yAxis);
     g.select(".domain").remove();
     g.selectAll(".tick text").attr("x", -45).attr("dy", -20);

     var lastLine = g.select(".tick:first-of-type");
     var t = lastLine.attr('transform');
     var translate = t.substring(t.indexOf("(")+1, t.indexOf(")")).split(",");
     g.insert("g",":first-child")
      .attr('class', 'tick')
      .attr("transform", "translate(" + (+translate[0]) + "," + (+translate[1]-barHeight)+")")
      .append('line').attr("x2", width-10);
   }
}

function renderChart(data, minDate, maxDate){
  var svg = d3.select("svg"),
      width = +svg.attr("width") - chartMargin.left - chartMargin.right,
      height = +svg.attr("height") - chartMargin.top - chartMargin.bottom;

  var g = svg.append("g")
          .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

  var dateAxisWidth = barHeight*(maxDate-minDate) + barHeight;
  var nameAxisHeight = barHeight*data.length;

  var dateScale = getDateScale(minDate, maxDate, dateAxisWidth);
  var nameScale = getNameScale(data);

  renderDateAxis(dateScale, svg, nameAxisHeight);
  renderNameAxis(nameScale, svg, dateAxisWidth);

  g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return dateScale(d.start)+20; })
        .attr("y", function(d) { return nameScale(d.name)-25; })
        .attr("width", function(d) { return dateScale(d.end+1)-dateScale(d.start); })
        .attr("height", barHeight);
}
