// Seleciona elementos do DOM
const taskInput = document.querySelector(".task-input input"),
  filters = document.querySelectorAll(".filters span"),
  clearAll = document.querySelector(".clear-btn"),
  taskBox = document.querySelector(".task-box");
feedbackMessage = document.querySelector(".feedback-message");

// Variáveis auxiliares
let editId,
  isEditTask = false,
  todos = JSON.parse(localStorage.getItem("todo-list")); // Obtém a lista de tarefas do localStorage

// Função para exibir feedback
function showFeedback(message, emoji) {
  feedbackMessage.innerHTML = `${emoji} ${message}`;
  feedbackMessage.classList.add("show"); // Exibe a mensagem
  setTimeout(() => feedbackMessage.classList.remove("show"), 2000); // Oculta após 2s
}

// Adiciona evento de clique para cada botão de filtro
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("span.active").classList.remove("active"); // Remove a classe ativa do botão anterior
    btn.classList.add("active"); // Adiciona classe ativa ao botão clicado
    showTodo(btn.id); // Mostra as tarefas filtradas
  });
});

// Função para exibir tarefas filtradas
function showTodo(filter) {
  let liTag = "";
  if (todos) {
    todos.forEach((todo, id) => {
      let completed = todo.status == "completed" ? "checked" : ""; // Verifica se a tarefa está concluída
      if (filter == todo.status || filter == "all") {
        liTag += `<li class="task">
                            <label for="${id}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                                <p class="${completed}">${todo.name}</p>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="task-menu">
                                    <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i></li>
                                    <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i></li>
                                </ul>
                            </div>
                        </li>`;
      }
    });
  }
  taskBox.innerHTML = liTag || `<span>Você não tem nenhuma tarefa aqui!</span>`; // Exibe mensagem caso não haja tarefas
  let checkTask = taskBox.querySelectorAll(".task");
  !checkTask.length
    ? clearAll.classList.remove("active") // Oculta o botão "Limpar tudo" se não houver tarefas
    : clearAll.classList.add("active"); // Exibe o botão se houver tarefas
  taskBox.offsetHeight >= 300
    ? taskBox.classList.add("overflow") // Adiciona classe de rolagem se a lista for muito grande
    : taskBox.classList.remove("overflow");
}
showTodo("all"); // Mostra todas as tarefas ao carregar a página

// Função para exibir o menu de opções de uma tarefa
function showMenu(selectedTask) {
  let menuDiv = selectedTask.parentElement.lastElementChild;
  menuDiv.classList.add("show"); // Exibe o menu
  document.addEventListener("click", (e) => {
    if (e.target.tagName != "I" || e.target != selectedTask) {
      menuDiv.classList.remove("show"); // Esconde o menu se clicar fora dele
    }
  });
}

// Função para atualizar o status da tarefa
function updateStatus(selectedTask) {
  let taskName = selectedTask.parentElement.lastElementChild;
  if (selectedTask.checked) {
    taskName.classList.add("checked");
    todos[selectedTask.id].status = "completed"; // Marca a tarefa como concluída
    showFeedback("Tarefa concluída!", "🎉");
  } else {
    taskName.classList.remove("checked");
    todos[selectedTask.id].status = "pending"; // Define a tarefa como pendente
  }
  localStorage.setItem("todo-list", JSON.stringify(todos)); // Atualiza o localStorage
}

// Função para editar uma tarefa
function editTask(taskId, textName) {
  editId = taskId;
  isEditTask = true;
  taskInput.value = textName; // Preenche o campo de entrada com o nome da tarefa
  taskInput.focus(); // Define o foco no campo de entrada
  taskInput.classList.add("active");
}

// Função para excluir uma tarefa
function deleteTask(deleteId, filter) {
  isEditTask = false;
  todos.splice(deleteId, 1); // Remove a tarefa do array
  localStorage.setItem("todo-list", JSON.stringify(todos)); // Atualiza o localStorage
  showTodo(filter); // Atualiza a exibição das tarefas
  showFeedbacsk("Tarefa removida!", "🗑️");
}

// Função para apagar uma tarefa
function deleteTask(taskId) {
  let confirmation = confirm("Tem a certeza que deseja apagar esta tarefa?");

  if (confirmation) {
    todos.splice(taskId, 1); // Remove a tarefa do array
    localStorage.setItem("todo-list", JSON.stringify(todos)); // Atualiza o armazenamento
    showTodo(document.querySelector("span.active").id); // Atualiza a lista

    showFeedback("Tarefa apagada com sucesso!", "🗑️"); // Exibe feedback
  } else {
    showFeedback("Ação cancelada! A tarefa não foi apagada.", "❌"); // Feedback de cancelamento
  }
}

// Evento para limpar todas as tarefas
clearAll.addEventListener("click", () => {
  let confirmation = confirm(
    "Tem a certeza que deseja apagar todas as tarefas?"
  );

  if (confirmation) {
    todos = []; // Esvazia o array de tarefas
    localStorage.setItem("todo-list", JSON.stringify(todos)); // Atualiza o armazenamento
    showTodo("all"); // Atualiza a exibição das tarefas

    showFeedback("Todas as tarefas foram apagadas!", "🗑️"); // Feedback de sucesso
  } else {
    showFeedback("Ação cancelada! Nenhuma tarefa foi apagada.", "❌"); // Feedback de cancelamento
  }
});

// Evento para adicionar uma nova tarefa ao pressionar Enter
taskInput.addEventListener("keyup", (e) => {
  let userTask = taskInput.value.trim();
  if (e.key == "Enter") {
    if (!userTask) {
      showFeedback("Por favor, insira uma tarefa válida.", "⚠️"); // Feedback para entrada vazia
      return;
    }

    if (todos && todos.some((task) => task.name === userTask)) {
      showFeedback("Essa tarefa já existe!", "❌"); // Feedback para tarefa duplicada
      return;
    }

    if (!isEditTask) {
      todos = !todos ? [] : todos;
      let taskInfo = { name: userTask, status: "pending" };
      todos.push(taskInfo); // Adiciona nova tarefa
      showFeedback("Tarefa adicionada com sucesso!", "✅");
    } else {
      isEditTask = false;
      todos[editId].name = userTask; // Atualiza tarefa existente
      showFeedback("Tarefa editada com sucesso!", "✏️");
    }
    taskInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos)); // Atualiza o localStorage
    showTodo(document.querySelector("span.active").id); // Atualiza a exibição das tarefas
  }
});

// Evento para alternar entre os modos claro e escuro
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleButton = document.getElementById("toggle-theme");
  const body = document.body;

  // Verifica se o usuário já escolheu um tema antes
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode"); // Aplica o modo escuro
    themeToggleButton.textContent = "☀️ Modo Light";
  } else {
    themeToggleButton.textContent = "🌙 Modo Dark";
  }

  // Evento de clique para alternar o tema
  themeToggleButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    // Salva a escolha do usuário no localStorage
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      themeToggleButton.textContent = "☀️ Modo Light";
    } else {
      localStorage.setItem("theme", "light");
      themeToggleButton.textContent = "🌙 Modo Dark";
    }
  });
});
