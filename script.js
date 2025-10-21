let tasks = [];

const header = document.createElement('header');
document.body.append(header);

const title = document.createElement('h1');
title.textContent = 'Список задач';
header.append(title);

const form = document.createElement('form');
form.className = 'task-form';
header.append(form);

const inputText = document.createElement('input');
inputText.type = 'text';
inputText.placeholder = 'Название задачи';
inputText.required = true;
form.append(inputText);

const inputDate = document.createElement('input');
inputDate.type = 'date';
inputDate.required = true;
form.append(inputDate);

const addBtn = document.createElement('button');
addBtn.textContent = 'Добавить';
form.append(addBtn);

const filterBar = document.createElement('div');
filterBar.className = 'filter-bar';
header.append(filterBar);

const selectStatus = document.createElement('select');
const optAll = new Option('Все', 'all');
const optDone = new Option('Выполненные', 'done');
const optTodo = new Option('Невыполненные', 'todo');
selectStatus.add(optAll);
selectStatus.add(optDone);
selectStatus.add(optTodo);
filterBar.append(selectStatus);

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Поиск по названию';
filterBar.append(searchInput);

const sortButton = document.createElement('button');
sortButton.textContent = 'Сортировать по дате';
filterBar.append(sortButton);

const taskList = document.createElement('ul');
taskList.className = 'task-list';
document.body.append(taskList);

function loadTasks() {
  const data = localStorage.getItem('tasks');
  if (data) tasks = JSON.parse(data);
  else tasks = [];
}
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  let filtered = tasks;

  if (selectStatus.value === 'done') {
    filtered = filtered.filter(t => t.done);
  } else if (selectStatus.value === 'todo') {
    filtered = filtered.filter(t => !t.done);
  }
  const query = searchInput.value.trim().toLowerCase();
  if (query !== '') {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(query));
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.done) li.classList.add('completed');
    li.draggable = true; // для drag-and-drop

    const doneCheckbox = document.createElement('input');
    doneCheckbox.type = 'checkbox';
    doneCheckbox.checked = task.done;
    doneCheckbox.addEventListener('change', () => {
      task.done = doneCheckbox.checked;
      saveTasks();
      renderTasks();
    });
    li.append(doneCheckbox);

    const span = document.createElement('span');
    span.className = 'task-title';
    span.textContent = task.title + ' (' + task.date + ')';
    li.append(span);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Редактировать';
    editBtn.addEventListener('click', () => {
      const newTitle = prompt('Новое название задачи:', task.title);
      const newDate = prompt('Новая дата (ГГГГ-ММ-ДД):', task.date);
      if (newTitle !== null && newTitle.trim() !== '') {
        task.title = newTitle.trim();
      }
      if (newDate !== null && newDate !== '') {
        task.date = newDate;
      }
      saveTasks();
      renderTasks();
    });
    li.append(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });
    li.append(deleteBtn);

    li.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', task.id);
    });
    li.addEventListener('dragover', e => e.preventDefault());
    li.addEventListener('drop', e => {
      e.preventDefault();
      const draggedId = +e.dataTransfer.getData('text/plain');
      const targetId = task.id;
      const fromIndex = tasks.findIndex(t => t.id === draggedId);
      const toIndex = tasks.findIndex(t => t.id === targetId);
      const [movedTask] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, movedTask);
      saveTasks();
      renderTasks();
    });

    taskList.append(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = inputText.value.trim();
  const dateVal = inputDate.value;
  if (!text || !dateVal) return;
  const newTask = {
    id: Date.now(),
    title: text,
    date: dateVal,
    done: false
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  form.reset();
});
selectStatus.addEventListener('change', renderTasks);
searchInput.addEventListener('input', renderTasks);
sortButton.addEventListener('click', () => {
  tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveTasks();
  renderTasks();
});

loadTasks();
renderTasks();
