let tasks = [];

const header = document.createElement('header');
document.body.appendChild(header);

const title = document.createElement('h1');
title.textContent = 'Список задач';
header.appendChild(title);

const form = document.createElement('form');
form.className = 'task-form';
header.appendChild(form);

const inputText = document.createElement('input');
inputText.type = 'text';
inputText.placeholder = 'Название задачи';
inputText.required = true;
form.appendChild(inputText);

const inputDate = document.createElement('input');
inputDate.type = 'date';
inputDate.required = true;
form.appendChild(inputDate);

const addBtn = document.createElement('button');
addBtn.type = 'submit';
addBtn.textContent = 'Добавить';
form.appendChild(addBtn);

const filterBar = document.createElement('div');
filterBar.className = 'filter-bar';
header.appendChild(filterBar);

const selectStatus = document.createElement('select');
const optAll = document.createElement('option');
optAll.value = 'all';
optAll.textContent = 'Все';
selectStatus.appendChild(optAll);

const optDone = document.createElement('option');
optDone.value = 'done';
optDone.textContent = 'Выполненные';
selectStatus.appendChild(optDone);

const optTodo = document.createElement('option');
optTodo.value = 'todo';
optTodo.textContent = 'Невыполненные';
selectStatus.appendChild(optTodo);

filterBar.appendChild(selectStatus);

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Поиск по названию';
filterBar.appendChild(searchInput);

const sortButton = document.createElement('button');
sortButton.type = 'button';
sortButton.textContent = 'Сортировать по дате';
filterBar.appendChild(sortButton);

const taskList = document.createElement('ul');
taskList.className = 'task-list';
document.body.appendChild(taskList);

function loadTasks() {
  const data = localStorage.getItem('tasks');
  if (data) tasks = JSON.parse(data);
  else tasks = [];
}
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function clearElement(el) {
  // полностью удаляем все дочерние узлы (без innerHTML)
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function renderTasks() {
  // очищаем список
  clearElement(taskList);

  let filtered = tasks.slice();

  if (selectStatus.value === 'done') {
    filtered = filtered.filter(t => t.done);
  } else if (selectStatus.value === 'todo') {
    filtered = filtered.filter(t => !t.done);
  }

  const query = searchInput.value.trim().toLowerCase();
  if (query !== '') {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(query));
  }

  // используем фрагмент для минимизации перерисовок
  const frag = document.createDocumentFragment();

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
    li.appendChild(doneCheckbox);

    const span = document.createElement('span');
    span.className = 'task-title';
    span.textContent = task.title + ' (' + task.date + ')';
    li.appendChild(span);

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
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
    li.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });
    li.appendChild(deleteBtn);

    li.addEventListener('dragstart', e => {
      // переносим id задачи как текст
      e.dataTransfer.setData('text/plain', String(task.id));
    });
    li.addEventListener('dragover', e => e.preventDefault());
    li.addEventListener('drop', e => {
      e.preventDefault();
      const draggedId = Number(e.dataTransfer.getData('text/plain'));
      const targetId = task.id;
      const fromIndex = tasks.findIndex(t => t.id === draggedId);
      const toIndex = tasks.findIndex(t => t.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      const [movedTask] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, movedTask);
      saveTasks();
      renderTasks();
    });

    frag.appendChild(li);
  });

  taskList.appendChild(frag);
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
