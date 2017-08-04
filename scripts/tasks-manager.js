const editWnd = $('#editTaskWnd');
const editForm = $('#editForm');
const mask = $('.mask');
let tasks = [ { id:1, name: 'task 1', start: 1, end: 4 },
              { id:2, name: 'task 2', start: 2, end: 7 },
              { id:3, name: 'task 3', start: 5, end: 12} ,
              { id:4, name: 'taks 4', start: 6, end: 15}];
let currentTaskId;


var minDate = Math.min.apply(null, tasks.map(el => el.start));
var maxDate = Math.max.apply(null, tasks.map(el => el.end));

renderChart(tasks, minDate, maxDate, editTask);

function addTask(id){
  let sortedTasks = tasks.sort((a,b)=> a.id > b.id? -1:1);
  currentTaskId = sortedTasks[0].id + 1;
  editWnd.find('.modal-header h3').html('Add new task');
  openTaskWnd();
}
function editTask(task){
  currentTaskId = task.id;
  editWnd.find('.modal-header h3').html('Edit task');
  $("#taskName").val(task.name);
  $("#startDate").val(task.start);
  $("#endDate").val(task.end);
  openTaskWnd();
}
function openTaskWnd(){
  editWnd.show();
  mask.show();
}

function saveTask(){
  var name = $("#taskName").val();
  var startDate = $("#startDate").val();
  var endDate = $("#endDate").val();

  var start  = new Date(startDate).getUTCDate();
  var end = new Date(endDate).getUTCDate();
  if(tasks.find(el=> el.id === currentTaskId)){
    let task = tasks.find(el=> el.id === currentTaskId)
    task.name = name;
    task.startDate = startDate;
    task.endDate = endDate;
  }
  else{
    tasks.push({ id: currentTaskId, name, start, end});
  }
  closeEditWnd();
  updateChartData();
  editForm.trigger('reset');
}

function updateChartData(){
  var minDate = Math.min.apply(null, tasks.map(el => el.start));
  var maxDate = Math.max.apply(null, tasks.map(el => el.end));

  let sortedTasks = tasks.sort((a,b)=> a.start > b.start ? 1:-1);

  updateChart(sortedTasks, minDate, maxDate, editTask);
}

function closeEditWnd(){
  editWnd.hide();
  mask.hide();
}
