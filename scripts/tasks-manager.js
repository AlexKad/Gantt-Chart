const editWnd = $('#editTaskWnd');
const editForm = $('#editForm');
const editStoryWnd = $('#editStoryWnd');
const editStoryForm = $('#editStoryForm');
const mask = $('.mask');
let stories = [];
let tasks = [];
let currentStoryId = null;
let currentTaskId = null;
let startSprintDate, endSprintDate;
let isDefaultSet = true;

//for quick testing purporse
 startSprintDate = new Date(2000, 1, 2);
 endSprintDate = new Date(2000, 1, 15);
 renderDefaultTasks();

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

function renderDefaultTasks(){
  let tasks = [
    { storyId: 1, name: 'Task 1', startDate: startSprintDate.getTime(), length: 1, assignTo: 'Jane A.'},
    { storyId: 2, name: 'Task 2', startDate: startSprintDate.getTime(), length: 2, assignTo: 'Brain D.' },
    { storyId: 3, name: 'Task 3', startDate: startSprintDate.getTime(), length: 3, assignTo: 'Richard R.'},
  ];
  let stories = [
    { id: 1, name: 'Story 1'}, { id:2, name: 'Story 2'}, { id:3, name: 'Story 3'}
  ]
  let dates = filterOutWeekends(startSprintDate, endSprintDate);
  renderChart(stories, tasks, dates, editTask, editStory);
}

function addStory(){
  if(stories.length>0){
    let sortedStories = stories.sort((a,b)=> a.id > b.id? -1:1);
    currentStoryId = sortedStories[0].id + 1;
  }
  else{
     currentStoryId = 1;
  }
  editStoryWnd.find('.modal-header h3').html('Add new story');
  openWnd(editStoryWnd, $('#storyName'));
}

function editStory(id){
  let story = stories.find(el=>el.id==id);
  if(!story || isDefaultSet) return;
  currentStoryId = id;
  editStoryWnd.find('.modal-header h3').html('Edit story');
  $("#storyName").val(story.name);
  if(tasks.length>0){
    let currentTasks = tasks.filter(el=> {return el.storyId == story.id});
    if(currentTasks.length > 0) renderTasksList(currentTasks, $('#tasksList'));
  }
  let currentStoryTasks = tasks.filter(el=> el.storyId == story.id);
  renderTasksList(currentStoryTasks, $('#tasksList'));
  openWnd(editStoryWnd, $('#storyName'));
}
function deleteStory(id){
  let story = stories.find(el=> el.id == id);
  if(!story) return;
  if(tasks.length>0){
    tasks = tasks.filter(el => { return el.storyId != id });
  }
  stories = stories.filter(el => { return el.id != id });
}
function addTask(){
  if(tasks.length>0){
    let sortedTasks = tasks.sort((a,b)=> a.id > b.id? -1:1);
    currentTaskId = sortedTasks[0].id + 1;
  }
  else{
    currentTaskId = 1;
  }
  editWnd.find('.modal-header h3').html('Add new task');
  openWnd(editWnd, $('taskName'));
}
function editTask(task){
  if(isDefaultSet) return;
  currentTaskId = task.id;
  editWnd.find('.modal-header h3').html('Edit task');
  $("#taskName").val(task.name);
  setInputDate(new Date(task.startDate), $("#startDate"));
  $("#count").val(task.length);
  $("countOpt").val(task.lengthOpt);
  openWnd(editWnd, $("#taskName"));
}
function deleteTask(id){
  tasks = tasks.filter(el => { return el.id != id });
}

function openWnd(wnd, focusInput){
  wnd.show();
  if(focusInput) focusInput.focus();
  mask.show();
}

function saveStory(){
  let name = $("#storyName").val();
  if(stories.find(el=> el.id === currentStoryId)){
    let story = stories.find(el=> el.id === currentStoryId)
    story.name = name;
  }
  else{
    stories.push({ id: currentStoryId, name });
  }
  isDefaultSet = false;
  closeWnd(editStoryWnd, editStoryForm);
  updateChartData();
  editStoryForm.trigger('reset');
  currentStoryId = null;
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
    tasks.push({ storyId: currentStoryId, id: currentTaskId, name, startDate, length: calcLengthInDays(count, countOpt), assignTo });
  }

  if(isDefaultSet){
    startSprintDate = new Date(start);
    endSprintDate = new Date( start.setDate(start.getDate() + 14));

    setInputDate(startSprintDate, $('input[name=startDate]'));
    setInputDate(endSprintDate, $('input[name=endDate]'));
    isDefaultSet = false;
    currentTaskId = null;
  }

  closeWnd(editWnd, editForm);
  if(!currentStoryId){
    updateChartData();
  }
  else{
    let currentStoryTasks = tasks.filter(el=> el.storyId == currentStoryId);
    renderTasksList(currentStoryTasks, $('#tasksList'));
  }
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
  updateChart(stories, tasks, dates, editTask, editStory);
  //renderTasksList(sortedTasks);
}
function renderTasksList(tasks, container){
  container.empty();
  let item, name;
  let df = $(document.createDocumentFragment());
   for(let i=0; i< tasks.length; i++){
     item = $('<div class="item"></div>');
     item = item.append('<div class="name">'+ tasks[i].name+'</div>');
     item = item.append('<div class="buttons"><i class="fa fa-pencil"><i class="fa fa-remove"></i></div>');
     df.append(item);
  }
   container.append(df);
}

function closeWnd(wnd, form){
  wnd.hide();
  if(form)form.trigger('reset');
  mask.hide();
}
