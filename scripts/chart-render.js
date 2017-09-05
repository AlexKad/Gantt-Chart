const barHeight = 100;
const paddingLeft = 100;
const paddingTop = barHeight/2;
const workingDayInHours = 8;

function getTranslateValues(translate){
  return translate.substring(translate.indexOf("(")+1, translate.indexOf(")")).split(",");
}

function getDateScale(dates, width){
  //TODO: bug if last task end date == maxDate
  var scale = d3.scaleBand()
                .domain(dates)
                .range([0, barHeight*dates.length]);
  return scale;
}

function displayDate(ms){
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fr', 'Sat'];
  let date = new Date(ms);
  let month = date.getMonth()+1;
  let day = date.getDate()+1;
  let dayOfTheWeek = weekDays[date.getDay()];
  return dayOfTheWeek+ ' ' + month +'/' + day;
}

function renderDateAxis(scale, svg, height){
  var xAxis = d3.axisBottom()
                .scale(scale)
                .tickSize(height)
                .tickFormat(displayDate);

  var g = svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate("+ paddingLeft/2 +"," + paddingTop + ")")
            .call(customXAxis);

  function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick text").attr("y", -paddingTop).attr("dx", 50);

    var lastLine = g.select(".tick:last-of-type");
    var translate = getTranslateValues(lastLine.attr('transform'));
    g.append("g")
     .attr('class', 'tick')
     .attr("transform", "translate(" + (+translate[0]+ paddingLeft) + "," + (+translate[1])+")")
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
                .tickSize(width-paddingLeft);
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
      .append('line').attr("x2", width-paddingLeft);
   }
}

function renderEditBtns(fObj, icon, clickFn){
  let btns = fObj.append("xhtml:div")
                 .attr("class", 'btn');

  btns.html('<i class="fa '+ icon + '"></i>');
  btns.on('click', clickFn);
}

function renderChart(data, dates, clickFn){
  var svg = d3.select("svg");
  var g = svg.append("g");

  var dateAxisWidth =  barHeight*dates.length + barHeight;
  var nameAxisHeight = barHeight*data.length;

  svg.attr('width', dateAxisWidth + paddingLeft + 10)
     .attr('height', nameAxisHeight + paddingTop + 10);


  var dateScale = getDateScale(dates, dateAxisWidth);
  var nameScale = getNameScale(data);

  renderDateAxis(dateScale, svg, nameAxisHeight);
  renderNameAxis(nameScale, svg, dateAxisWidth);
  renderBars(g, dateScale, nameScale, data, clickFn);
}

function renderBars(g, dateScale, nameScale,data, clickFn){
  var bar = g.selectAll("g")
             .data(data)
             .enter().append("g");

      bar.append("rect")
         .attr("class", "bar")
         .attr("x", function(d) { return dateScale(d.startDate)+paddingLeft; })
         .attr("y", function(d) { return nameScale(d.name)+paddingTop; })
         .attr("width", function(d) { return d.length*barHeight })
         .attr("height", barHeight)
         .on("click", function(d,i) { clickFn(d);})
         .append("svg:title")
         .text('Click to edit');

      bar.append("text")
          .attr("x", function(d) { return dateScale(d.startDate)+paddingLeft + (d.length*barHeight)/2; })
          .attr("y", function(d) { return nameScale(d.name)+paddingTop; })
          .attr("dy", barHeight/2-10)
          .attr("text-anchor", "middle")
          .text(function(d) { return d.name + (d.assignTo? ' ' + d.assignTo : ''); })
          .call(wrap, barHeight);

      // bar.append("text")
      //         .attr("x", function(d) { return dateScale(d.startDate)+paddingLeft + (d.length*barHeight)/2; })
      //         .attr("y", function(d) { return nameScale(d.name)+paddingTop; })
      //         .attr("dy", barHeight/2+10)
      //         .attr("text-anchor", "middle")
      //         .text(function(d) { return d.assignTo; });
}

function wrap(text, width) {
  text.each(function() {
    let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 20, // px
        x = text.attr("x")
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy );

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy ).text(word);
      }
    }
  });
}

function updateChart(data, dates, clickFn){
  var svg = d3.select("svg");
  svg.selectAll("*").remove();
  renderChart(data, dates, clickFn);
}
