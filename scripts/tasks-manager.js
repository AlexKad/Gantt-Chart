const editWnd = $('#editTaskWnd');
const editForm = $('#editForm');
const mask = $('.mask');
var tasks = [ { name: 'task 1', start: 1, end: 4 },
              { name: 'task 2', start: 2, end: 7 },
              { name: 'task 3', start: 5, end: 12} ,
              { name: 'taks 4', start: 6, end: 15}];


var minDate = Math.min.apply(null, tasks.map(el => el.start));
var maxDate = Math.max.apply(null, tasks.map(el => el.end));

renderChart(tasks, minDate, maxDate);

function showAddTaskWnd(){
  editWnd.show();
  mask.show();
}

function addTask(){
  var name = $("#taskName").val();
  var startDate = $("#startDate").val();
  var endDate = $("#endDate").val();

console.log(startDate);
  var start  = new Date(startDate).getUTCDate();
  var end = new Date(endDate).getUTCDate();
  tasks.push({ name, start, end});

  console.log(start, end);

  closeEditWnd();
  updateChartData();
  editForm.trigger('reset');
}

function updateChartData(){
  var minDate = Math.min.apply(null, tasks.map(el => el.start));
  var maxDate = Math.max.apply(null, tasks.map(el => el.end));

  updateChart(tasks, minDate, maxDate);
}

function closeEditWnd(){
  editWnd.hide();
  mask.hide();
}
