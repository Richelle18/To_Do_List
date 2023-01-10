const listsContainer = document.querySelector('[data-lists]');
const listsFilterContainer = document.querySelector('[data-lists-filter]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteAllTaskButton = document.querySelector('[data-clear-all-tasks-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const listCompletedCountElement = document.querySelector('[data-list-completed-count]');
const listCountAllElement = document.querySelector('[data-list-count-all]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]');
const searchInput = document.querySelector('[data-search-input]');
const searchItem = document.querySelector('[data-search-item]');
const searchIcon= document.querySelector('[data-search-icon]');
const userName = document.querySelector('[data-input-name]');
const formHeader = document.querySelector('[data-form-header]');
const spanCollapse = document.querySelector('[data-span-collapse]');


let selectedFilterName = null;
let searchLists = [];

/*-----------------------------keys-----------------------------*/
const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
const LOCAL_STORAGE_SELECTED_TASK_LI_ID_KEY = 'task.selectedTaskLiId';
const LOCAL_STORAGE_SELECTED_TASK_SPAN_ID_KEY = 'task.selectedTaskSpanId';
const LOCAL_STORAGE_USERNAME_KEY = 'task.selectedUserName';


/*-----------------------------lists-----------------------------*/
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
let selectedTaskLiId = localStorage.getItem(LOCAL_STORAGE_SELECTED_TASK_LI_ID_KEY);
let selectedTaskSpanId = localStorage.getItem(LOCAL_STORAGE_SELECTED_TASK_SPAN_ID_KEY);
let selectedUserName = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);


/*-----------------------------eventListener-----------------------------*/
newListForm.addEventListener('submit', e =>{
    e.preventDefault();
    const listName = newListInput.value;
    if (listName == null || listName === '') return;
    const list = createList(listName);
    newListInput.value = null;
    lists.push(list);
    saveAndRender();
});


listsContainer.addEventListener('click', e =>{
    
    if(e.target.tagName.toLowerCase() === 'li'){
        selectedListId = e.target.dataset.listId;
        saveAndRender();
    }
});


tasksContainer.addEventListener('click', e =>{
    selectedTaskLiId = e.target.dataset.taskLiId;
    selectedTaskSpanId = e.target.dataset.taskSpanId;
    const targetElement = e.target;
    const  selectedList = lists.find(list => list.id === selectedListId);
    const selectedTask =  selectedList.tasks.find(task => task.id === selectedTaskLiId);
    if(e.target.tagName.toLowerCase() === 'li'){
        e.target.parentElement.classList.toggle('active');
        e.target.firstChild.classList.toggle('fa-solid'); 
      
        if(selectedTask.complete === false){
            selectedTask.complete = true;
        } else{
            selectedTask.complete = false;
        }
    }else if(e.target.tagName.toLowerCase() === 'span'){
    //    const targetDeleteElementText = targetElement.previousElementSibling.innerText;
    //    const selectedTask =  selectedList.tasks.find(task => task.name === targetDeleteElementText);
    //    e.target.parentElement.remove();
       selectedList.tasks = selectedList.tasks.filter(list => list.id !== selectedTaskSpanId);
    }
    // selectedTaskLiId = null;
    // selectedTaskSpanId = null;

    saveAndRender();
});


newTaskForm.addEventListener('submit', e =>{
    e.preventDefault();
    const taskName = newTaskInput.value;
    if (taskName == null || taskName === '') return;
    const task = createTask(taskName);
    newTaskInput.value = null;
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks.push(task);
    saveAndRender();
});


clearCompleteTasksButton.addEventListener('click', e =>{
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveAndRender();
});


deleteAllTaskButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId);
    if(selectedFilterName ==='Tasks Remaining'){
        selectedList.tasks = selectedList.tasks.filter(task => task.complete);
    }else if (selectedFilterName ==='Completed'){
        selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    }else{
        selectedList.tasks = [];
    }
    saveAndRender();
});


listsFilterContainer.addEventListener('click', e => {
    clearCompleteTasksButton.style.display = '';
    
    if(e.target.tagName.toLowerCase() === 'li'){
        selectedFilterName = e.target.innerText;
        for(let i =0; i <e.target.parentElement.parentElement.children.length; i++ ){
            e.target.parentElement.parentElement.children[i].classList.remove('active');
            if (e.target){
                e.target.parentElement.classList.add('active');
            }
        }

    }else if(e.target.tagName.toLowerCase() === 'span'){
        selectedFilterName = e.target.previousElementSibling.innerText;
    }
   render();
});

searchInput.addEventListener('keypress', e =>{
   
    if (e.key === 'Enter') {
        const newSearchInput = e.target.value;
        searchRenderList(newSearchInput);
      }
});

searchIcon.addEventListener('click', e =>{
    const newSearchInput =  searchInput.value;
    searchRenderList(newSearchInput);
});

formHeader.addEventListener('submit', e =>{
    e.preventDefault();
    newUserName =  userName.value;
    selectedUserName = newUserName.charAt(0).toUpperCase() + newUserName.slice(1);
    saveAndRender();
});

spanCollapse.addEventListener('click', e =>{
    e.target.classList.toggle('active');
    if(listsContainer.style.display === ''){
        listsContainer.style.display = 'none';
        listDisplayContainer.style.display = 'none';
    }else{
       listsContainer.style.display = '';
       if(selectedListId === null || selectedListId === 'null'){
        listDisplayContainer.style.display = 'none';
       }else{
        listDisplayContainer.style.display = '';
       }
     
    }
    
});

window.addEventListener('resize', e =>{
    listTitleElmentWidth();
    listTitleElmentHeight();
});
/*-----------------------------function-----------------------------*/
function createList(name){
  return  {id: Date.now().toString(), name: name, tasks: []};
}

function createTask(name){
    return  {id: Date.now().toString(), name: name, complete:false};
}

function saveAndRender(){
    save();
    render();
}

function save(){
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
    localStorage.setItem(LOCAL_STORAGE_SELECTED_TASK_LI_ID_KEY, selectedTaskLiId);
    localStorage.setItem(LOCAL_STORAGE_SELECTED_TASK_SPAN_ID_KEY, selectedTaskSpanId);
    localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, selectedUserName);
}

function render(){
    clearElement(listsContainer);
    renderLists();
    removeFoundItem();
    listTitleElmentWidth();
    listTitleElmentHeight();
    if(selectedUserName === 'null' || selectedUserName === null){
      localStorage.removeItem('task.selectedUserName');
    }
    userName.value = selectedUserName;
    const selectedList = lists.find(list => list.id === selectedListId);
    if(selectedListId == null || selectedListId == 'null'){
        listDisplayContainer.style.display = 'none';
    }else {
        listDisplayContainer.style.display = '';
      
        if(selectedList.tasks.length === 0){
            deleteAllTaskButton.style.display = 'none';
            clearCompleteTasksButton.style.display = 'none';
            
        }else{
            deleteAllTaskButton.style.display = '';
            clearCompleteTasksButton.style.display = '';
        }
     
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        renderCompletedCount(selectedList);
        renderCountAll(selectedList);
        clearElement(tasksContainer);
        
        if(selectedFilterName !== null && selectedFilterName !== 'All' && searchLists.length === 0){
            filterTasks(selectedList);
        
        }else if(searchLists.length !== 0){
                newSelectedList(searchLists); 
        }else{
            renderTasks(selectedList);
        }

        
    }
}

function renderTasks(selectedList){
    selectedList =  selectedList.tasks.filter(task => task);
    if(searchLists.length !== 0){
        return selectedList;
    }
    newSelectedList(selectedList);
}

function renderTaskCount(selectedList){
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    // const taskString = incompleteTaskCount === 1 ? 'Task' : 'Tasks';
    listCountElement.innerText = incompleteTaskCount;
}

function renderCompletedCount(selectedList){
    const completeTaskCount = selectedList.tasks.filter(task => task.complete).length;
    
    listCompletedCountElement.innerText = completeTaskCount;
}

function renderCountAll(selectedList){
    const countAll = selectedList.tasks.filter(task => task).length;
    listCountAllElement.innerText = countAll;
}

function renderLists(){
    lists.forEach(list => {
        const divElement = document.createElement('div');
        const listElement = document.createElement('li'); 
        listElement.innerText = list.name;
        listElement.dataset.listId = list.id;
        const iconElement1 = document.createElement('i'); 
        iconElement1.classList.add('fa-regular', 'fa-file-lines');
         listElement.insertBefore(iconElement1, listElement.firstChild);
        const spanElement = document.createElement('span');
        const iconElement2 = document.createElement('i');  
        iconElement2.classList.add('fa-regular','fa-trash-can');
        spanElement.appendChild(iconElement2);
        spanElement.dataset.deleteListButton;
        spanElement.addEventListener('click', e =>{
            selectedListId= list.id;
            lists = lists.filter(list => list.id !== selectedListId);
            selectedListId = null;
            saveAndRender();
            window.location.reload();
        });
        divElement.append(listElement, spanElement);
        if(list.id === selectedListId){
            listElement.parentNode.classList.add('active');
        }
        listsContainer.appendChild(divElement);
    });
}

function filterTasks(selectedList){
  
    if(selectedFilterName === 'Tasks Remaining'){
        selectedList = selectedList.tasks.filter(task => task.complete === false);
        clearCompleteTasksButton.style.display = 'none';
       
    }else if(selectedFilterName === 'Completed'){
        selectedList= selectedList.tasks.filter(task => task.complete === true);
    }
  
    if(searchLists.length !== 0){
        return selectedList;
    }
  newSelectedList(selectedList);  
}

function searchRenderList(newSearchInput){
    //for checking of searchLists
    searchLists.push(1);
    let selectedList = lists.find(list => list.id === selectedListId);
  if(newSearchInput !== null  && selectedFilterName !== 'All' && selectedFilterName !== null){
    selectedList = filterTasks(selectedList);
  }else if(newSearchInput !== null  || selectedFilterName === 'All' || selectedFilterName === null){
    selectedList = renderTasks(selectedList);

  }
   //cleaning of  searchLists
  searchLists.shift();
  selectedList.filter(task =>{
       if(task.name.toLowerCase().includes(newSearchInput.toLowerCase())){
           searchLists.push(task)
       }
       render();
  });

  if(searchLists.length === 0){
    clearElement(tasksContainer);
  }
   searchItem.style.display = 'flex';
   searchItem.firstElementChild.firstElementChild.textContent = `${searchLists.length}`; 
   searchInput.value = null;
   searchLists = [];
}

//filterTasks and renderTask function
function newSelectedList(selectedList){
    selectedList.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const templateDivElement = taskElement.querySelector('div');
        const liElement = taskElement.querySelector('li');
        liElement.dataset.taskLiId = task.id;
        liElement.append(task.name);
        const iconElement = taskElement.querySelector('i.fa-circle');
        const newSpanElement = taskElement.querySelector('span');
        newSpanElement.dataset.taskSpanId = task.id;
        if(task.complete  === true) {
            templateDivElement.classList.add('active');
            iconElement.classList.add('fa-solid');
        }
        tasksContainer.appendChild(taskElement);
    });
    
}
function listTitleElmentWidth(){
    let newWidth = 0;
    newWidth = window.outerWidth;
    newWidth = newWidth - 500;
    listTitleElement.style.inlineSize = `${newWidth}px`
}
function listTitleElmentHeight(){
    let newHeight = 0;
    newHeight = window.outerHeight;
    newHeight = newHeight - 450;
    listsContainer.style.height = `${newHeight}px`;
}

    
//remove found items display
function removeFoundItem(){
    searchItem.style.display = 'none';
}


//function delete element on lists
function clearElement(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);    
    }
}

render();