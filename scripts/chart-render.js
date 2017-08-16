const barHeight = 120;
const paddingLeft = 100;
const paddingTop = barHeight/2;

function getTranslateValues(translate){
  return translate.substring(translate.indexOf("(")+1, translate.indexOf(")")).split(",");
}

function getDateScale(minDate, maxDate, width){
  var dates = [];
  //TODO: bug if last task end date == maxDate
  for(let i=minDate; i<=maxDate+1; i++){
    dates.push(i);
  }
  var scale = d3.scalePoint()
                .domain(dates)
                .range([0, width-paddingLeft]);
  return scale;
}

function renderDateAxis(scale, svg, height){
  var xAxis = d3.axisBottom()
                .scale(scale)
                .tickSize(height);
  var g = svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate("+ paddingLeft +"," + paddingTop + ")")
            .call(customXAxis);

  function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick text").attr("y", -paddingTop).attr("dx", 30);

    var lastLine = g.select(".tick:last-of-type");
    var translate = getTranslateValues(lastLine.attr('transform'));
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
                .tickSize(width - barHeight);
  svg.append("g")
     .attr("class", "axis y-axis")
     .attr("transform", "translate("+ paddingLeft +"," + paddingTop*2 + ")")
     .call(customYAxis);

   function customYAxis(g) {
     g.call(yAxis);
     g.select(".domain").remove();
     g.selectAll(".tick text")
          .attr("x", -paddingLeft)
          .attr("dy", -paddingTop+5);

    // let fObj = g.selectAll(".tick")
    //             .append('svg:foreignObject')
    //               .attr("x", -paddingLeft + 50)
    //               .attr("y", -barHeight + 15)
    //               .attr("width", 50)
    //               .attr("height", 20);
    // renderEditBtns(fObj, 'fa-pencil', ()=>{console.log('edit clicked!')});
    // renderEditBtns(fObj, 'fa-remove', ()=>{console.log('remove clicked!')});

     var lastLine = g.select(".tick:first-of-type");
     var translate = getTranslateValues(lastLine.attr('transform'));

     g.insert("g",":first-child")
      .attr('class', 'tick')
      .attr("transform", "translate(" + (+translate[0]) + "," + (+translate[1]-barHeight)+")")
      .append('line').attr("x2", width - barHeight);
   }
}

function renderEditBtns(fObj, icon, clickFn){
  let btns = fObj.append("xhtml:div")
                 .attr("class", 'btn');

  btns.html('<i class="fa '+ icon + '"></i>');
  btns.on('click', clickFn);
}

function renderChart(data, minDate, maxDate, clickFn){
  var svg = d3.select("svg");
  var g = svg.append("g");

  var dateAxisWidth =  barHeight*(maxDate+1-minDate) + barHeight;
  var nameAxisHeight = barHeight*data.length;

  svg.attr('width', dateAxisWidth + paddingLeft + 10)
     .attr('height', nameAxisHeight + paddingTop + 10);


  var dateScale = getDateScale(minDate, maxDate, dateAxisWidth);
  var nameScale = getNameScale(data);

  renderDateAxis(dateScale, svg, nameAxisHeight);
  renderNameAxis(nameScale, svg, dateAxisWidth);

  g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return dateScale(d.start)+paddingLeft; })
        .attr("y", function(d) { return nameScale(d.name)+paddingTop; })
        .attr("width", function(d) { return dateScale(d.end+1)-dateScale(d.start); })
        .attr("height", barHeight)
        .on("click", function(d,i) { clickFn(d);})
        .append("svg:title")
        .text('Click to edit');

}

function updateChart(data, minDate, maxDate, clickFn){
  var svg = d3.select("svg");
  svg.selectAll("*").remove();
  renderChart(data, minDate, maxDate, clickFn);
}
