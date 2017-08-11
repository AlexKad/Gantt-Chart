const editWnd = $('#editTaskWnd');
const editForm = $('#editForm');
const mask = $('.mask');
let tasks = [ ];
let currentTaskId = 1;

let startSprintDate, endSprintDate;

//var minDate = Math.min.apply(null, tasks.map(el => el.start));
//var maxDate = Math.max.apply(null, tasks.map(el => el.end));
//renderChart(tasks, minDate, maxDate, editTask);
let timeout;
function sprintDateChanged(el){
  if(timeout) {
        clearTimeout(timeout);
        timeout = null;
  }
  timeout = setTimeout(()=>{ setSprintDate(el.name, el.value)},1000);
}
function setSprintDate(name, value){
  let date = new Date(value);
  switch (name){
    case "startDate":
      if(endSprintDate && date>endSprintDate){
        alert('Start date should be earlier than end date.');
      }
      else startSprintDate = date;
      break;
    case "endDate":
      if(startSprintDate && date<startSprintDate){
        alert('End date should not be earlier than start date.');
      }
      endSprintDate = date;
      break;
  }
  if(startSprintDate && endSprintDate && tasks.length==0){
    renderDefaultTasks();
  }
}
function renderDefaultTasks(){
  
}
function addTask(id){
  if(tasks.length>0){
    let sortedTasks = tasks.sort((a,b)=> a.id > b.id? -1:1);
    currentTaskId = sortedTasks[0].id + 1;
  }
  editWnd.find('.modal-header h3').html('Add new task');
  openTaskWnd();
}

function editTask(task){
  currentTaskId = task.id;
  editWnd.find('.modal-header h3').html('Edit task');
  $("#taskName").val(task.name);
  $("#startDate").val(task.startDate);
  $("#endDate").val(task.endDate);
  openTaskWnd();
}

function openTaskWnd(){
  editWnd.show();
  $("#taskName").focus();
  mask.show();
}

function saveTask(){
  let name = $("#taskName").val();
  let startDate = $("#startDate").val();
  let endDate = $("#endDate").val();
  if(!validate(name, startDate, endDate)) return;
  let start = new Date(startDate).getUTCDate();
  let end = new Date(endDate).getUTCDate();
  if(tasks.find(el=> el.id === currentTaskId)){
    let task = tasks.find(el=> el.id === currentTaskId)
    task.name = name;
    task.startDate = startDate;
    task.endDate = endDate;
    task.start = start;
    task.end = end;
  }
  else{
    tasks.push({ id: currentTaskId, name, startDate, endDate, start, end});
  }
  closeEditWnd();
  updateChartData();
  editForm.trigger('reset');
}

function validate(name, startDate, endDate){
  if(startDate > endDate){
    alert("Start date should be earlier than end date.");
    return false;
  }
  if(tasks.find(el => el.name === name && el.id != currentTaskId)){
    alert("Task name should be unique.");
    return false;
  }
  return true;
}

function updateChartData(){
  let minDate = Math.min.apply(null, tasks.map(el => el.start));
  let maxDate = Math.max.apply(null, tasks.map(el => el.end));
  let sortedTasks = tasks.sort((a,b)=> a.start > b.start ? 1 : -1);
  updateChart(sortedTasks, minDate, maxDate, editTask);
  //renderChartList(sortedTasks);
}
function renderChartList(tasks){
  $('.task-list').empty();
  $('.task-list').show();
  let item, name;
  let df = $(document.createDocumentFragment());
   for(let i=0; i< tasks.length; i++){
     item = $('<div class="item"></div>');
     item = item.append('<div class="name">'+ tasks[i].name+'</div>');
     item = item.append('<div class="date">07/07 - 09/07</div>');
     item = item.append('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
     df.append(item);
  }
   $('.task-list').append(df);
}

function closeEditWnd(){
  editWnd.hide();
  mask.hide();
}
