
var tasks = [ { name: 'task 1', start: 1, end: 4 },
              { name: 'task 2', start: 2, end: 7 },
              { name: 'task 3', start: 5, end: 12} ];


var minDate = Math.min.apply(null, tasks.map(el => el.start));
var maxDate = Math.max.apply(null, tasks.map(el => el.end));

renderChart(tasks, minDate, maxDate);
