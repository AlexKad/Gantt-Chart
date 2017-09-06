const editWnd = $('#editTaskWnd');
const editForm = $('#editForm');
const mask = $('.mask');
let tasks = [ ];
let currentTaskId = 1;
let startSprintDate, endSprintDate;
let isDefaultSet = true;

//for quick testing purporse
 startSprintDate = new Date(2000, 1, 2);
 endSprintDate = new Date(2000, 1, 15);
 renderDefaultTasks();

//console.log(filterOutWeekends(startSprintDate, endSprintDate));

function filterOutWeekends(startDate, endDate){
  let filteredDates = [];
   let date = new Date(startDate);
   let eDate = new Date(endDate);
   eDate.setDate(eDate.getDate()+1);

   while(date.getTime() != eDate.getTime()){
     if(date.getUTCDay() != 0 && date.getUTCDay() != 6){
       filteredDates.push((new Date(date)).getTime());
     }
     date.setDate(date.getDate()+1);
   }
   return filteredDates;
}

let timeout;
function sprintDateChanged(el){
  if(timeout) {
        clearTimeout(timeout);
        timeout = null;
  }
  timeout = setTimeout(()=>{ setSprintDate(el.name, el.value)},1500);
}
function setSprintDate(name, value){
  let date = new Date(value);
  date.setDate(date.getUTCDate());
  switch (name){
    case "startDate":
      if(endSprintDate && date > endSprintDate){
        alert('Start date should be earlier than end date. Sprint should be at least 5 days long.');
      } else if(endSprintDate && !isValidSprintLength(date, endSprintDate)){
        alert('Sprint should be at least 5 days long.');
      }
      else startSprintDate = date;
      break;
    case "endDate":
      if(startSprintDate && date < startSprintDate){
        alert('End date should not be earlier than start date. Sprint should be at least 5 days long.');
      } else if(startSprintDate && !isValidSprintLength(startSprintDate, date)){
        alert('Sprint should be at least 5 days long.');
      }
      else endSprintDate = date;
      break;
  }
  if(startSprintDate && endSprintDate && tasks.length == 0){
    renderDefaultTasks();
  }
}
function isValidSprintLength(start, end){
  let endDate = new Date(end);
  endDate = endDate.setDate(endDate.getDate()-4);
  return start < endDate;
}
function renderDefaultTasks(){
  let tasks = [
    { story: 'Story 1', name: 'Task 1', startDate: startSprintDate.getTime(), length: 1, assignTo: 'Jane A.'},
    { story: 'Story 2', name: 'Task 2', startDate: startSprintDate.getTime(), length: 2, assignTo: 'Brain D.' },
    { story: 'Story 3', name: 'Task 3', startDate: startSprintDate.getTime(), length: 3, assignTo: 'Richard R.'},
  ];
  let stories = [
    { name: 'Story 1'}, { name: 'Story 2'}, { name: 'Story 3'}
  ]
  let dates = filterOutWeekends(startSprintDate, endSprintDate);
  renderChart(stories, tasks, dates, editTask);
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
  setInputDate(new Date(task.startDate), $("#startDate"));
  $("#count").val(task.length);
  $("countOpt").val(task.lengthOpt);
  openTaskWnd();
}

function openTaskWnd(){
  editWnd.show();
  $("#taskName").focus();
  mask.show();
}

function saveTask(){
  let name = $("#taskName").val();
  let startDateStr = $("#startDate").val();
  let start = new Date(startDateStr);
  let count = parseInt($("#count").val());
  let countOpt = $("#countOpt").val();
  let assignTo = $("#assignTo").val() || '';

  if(!validate(name, start, count)) return;
  startDate = start.getTime();

  if(tasks.find(el=> el.id === currentTaskId)){
    let task = tasks.find(el=> el.id === currentTaskId)
    task.name = name;
    task.startDate = startDate;
    task.length = calcLengthInDays(count, countOpt);
    task.assignTo = assignTo;
  }
  else{
    tasks.push({ id: currentTaskId, name, startDate, length: calcLengthInDays(count, countOpt), assignTo });
    currentTaskId++;
  }
  if(isDefaultSet){
    startSprintDate = new Date(start);
    endSprintDate = new Date( start.setDate(start.getDate() + 14));

    setInputDate(startSprintDate, $('input[name=startDate]'));
    setInputDate(endSprintDate, $('input[name=endDate]'));
    isDefaultSet = false;
  }

  closeEditWnd();
  updateChartData();
  editForm.trigger('reset');
}
function calcLengthInDays(length, opt){
  if(opt == 'hours'){
      length = length/workingDayInHours;
  }
  return length;
}

function setInputDate(date, input){
  let sYear = date.getFullYear();
  let month = date.getMonth()+1;
  let sMonth = month>10? month : '0' + month;
  let day = date.getDate()+1;
  let sDay= day>10? day: '0' + day;

  input.val([sYear,sMonth, sDay].join('-'));
}

function validate(name, startDate, count){
  if(tasks.find(el => el.name === name && el.id != currentTaskId)){
    alert("Sorry, your task name should be unique.");
    return false;
  }
  let day = startDate.getUTCDay();
  if(day == 0 || day == 6){
    alert("Sorry, weekend is not allowed as a task start date.");
    return false;
  }
  if(count<0 || count>50){
    alert("Sorry, your task length is incorrect.");
    return false;
  }
  return true;
}

function updateChartData(){
  //let sortedTasks = tasks.sort((a,b)=> a.startDate > b.startDate ? 1 : -1);
  let dates = filterOutWeekends(startSprintDate, endSprintDate);
  updateChart(tasks, dates, editTask);
  //renderTasksList(sortedTasks);
}
function renderTasksList(tasks){
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
  editForm.trigger('reset');
  mask.hide();
}
