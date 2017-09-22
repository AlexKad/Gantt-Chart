const barHeight = 100;
const paddingLeft = 100;
const paddingTop = barHeight/2;
const workingDayInHours = 8;
const barColors = ['#26a526', '#20b2aa', '#3d61ce', '#4ea2a5'];
const defaultColor = '#26a526';

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
  let day = date.getDate();
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
                .domain(data.map(function(d) { return d.id; }))
                .range([ 0, barHeight*data.length]);
  return scale;
}
function getStoryNameById(stories, id){
  let story = stories.filter(el=> el.id == id);
  if(story)return story[0].name;
  else return '';
}
function renderNameAxis(stories, scale, svg, width, clickStoryFn, removeStoryFn){
  var yAxis = d3.axisRight()
                .scale(scale)
                .tickSize(width-paddingLeft)
                .tickFormat(function(d){ return getStoryNameById(stories, d) });
  svg.append("g")
     .attr("class", "axis y-axis")
     .attr("transform", "translate("+ paddingLeft + "," + paddingTop*2 + ")")
     .call(customYAxis);

   function customYAxis(g) {
     g.call(yAxis);
     g.select(".domain").remove();
     g.selectAll(".tick text")
          .attr("x", -paddingLeft)
          .attr("dy", -paddingTop+5);
          //.on("click", function(d,i) { clickStoryFn(d);});

    let fObj = g.selectAll(".tick")
                .append('svg:foreignObject')
                  .attr("x", -paddingLeft + 50)
                  .attr("y", -barHeight + 60 )
                  .attr("width", 50)
                  .attr("height", 20);
    renderEditBtns(fObj, 'fa-pencil', clickStoryFn);
    renderEditBtns(fObj, 'fa-remove', removeStoryFn);

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
  btns.on('click', function(d,i){ clickFn(d);});
}

function renderChart(stories, tasks, dates, clickBarFn, clickStoryFn, removeStoryFn){
  var svg = d3.select("svg");
  var g = svg.append("g");

  var dateAxisWidth =  barHeight*dates.length + barHeight;
  var nameAxisHeight = barHeight*stories.length;

  svg.attr('width', dateAxisWidth + paddingLeft + 10)
     .attr('height', nameAxisHeight + paddingTop + 10);


  var dateScale = getDateScale(dates, dateAxisWidth);
  var nameScale = getNameScale(stories);

  renderDateAxis(dateScale, svg, nameAxisHeight);
  renderNameAxis(stories, nameScale, svg, dateAxisWidth, clickStoryFn, removeStoryFn);
  renderBars(g, dateScale, nameScale, tasks, clickBarFn);
}

function renderBars(g, dateScale, nameScale, tasks, clickFn){
  var bar = g.selectAll("g")
             .data(tasks)
             .enter().append("g").attr("class", "bar-task");

      bar.append("rect")
         .attr("class", "bar")
         .attr("x", function(d) { return dateScale(d.startDate)+paddingLeft; })
         .attr("y", function(d) { return calcTopPosition(d, nameScale, paddingTop); })
         .attr("width", function(d) { return d.length*barHeight })
         .attr("height", function(d) { if(d.height) return d.height*barHeight; else return barHeight })
         .attr("fill", function(d) { return getColor(d) })
         .on("click", function(d,i) { clickFn(d.id);})
         .append("svg:title")
         .text('Click to edit');

      bar.append("text")
          .attr("x", function(d) { return dateScale(d.startDate)+paddingLeft + (d.length*barHeight)/2; })
          .attr("y", function(d) { return calcTopPosition(d, nameScale, paddingTop); })
          .attr("dy", 20)
          .attr("text-anchor", "middle")
          .text(function(d) { return getText(d); })
          .call(wrap);
}
function calcTopPosition(d, nameScale, paddingTop){
  let top = nameScale(d.storyId) + paddingTop;
  if(d.top) top+=d.top*barHeight;
  return top;
}
function getText(d){
  let text = d.name;
  if(d.assignTo){
    if(!d.height) text+= ' <br/>';
    text = text + ' ' + d.assignTo;
  }
  return text;
}
function getColor(d){
  if(d.top && d.top>0 && d.height){
    let items = Math.ceil(1/d.height);
    return barColors[Math.ceil(d.top*items)];
  }else{
    return defaultColor;
  }
}

function wrap(text) {
  text.each(function() {
    let text = d3.select(this),
        bar = d3.select(this.parentNode).selectAll("rect"),
        width = bar.attr("width"),
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
      if (tspan.node().getComputedTextLength() > width || word == '<br/>') {
        line.pop();
        tspan.text(line.join(" "));
        line = word == '<br/>'? [] : [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy ).text(word);
      }
    }
  });
}

function updateChart(stories, data, dates, clickBarFn, clickStoryFn, removeStoryFn){
  var svg = d3.select("svg");
  svg.selectAll("*").remove();
  renderChart(stories, data, dates, clickBarFn, clickStoryFn, removeStoryFn);
}
