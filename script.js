let projects = JSON.parse(localStorage.getItem("projects")) || [];
let selectedProjectIndex = null;

const projectList = document.getElementById("projectList");
const projectTitle = document.getElementById("projectTitle");
const projectBudget = document.getElementById("projectBudget")
const taskList = document.getElementById("taskList");
const projectDetails = document.getElementById("projectDetails");

// Modal functions
function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

// Create Project
document.getElementById("newProjectBtn").onclick = () => openModal("projectModal");

document.getElementById("saveProject").onclick = () => {
    const name = document.getElementById("projectName").value.trim();
    const budget = parseFloat(document.getElementById("projectBudgetInput").value) || 0;
    if (name) {
        projects.push({ name, budget, tasks: [] });
        saveProjects();
        renderProjects();
        closeModal("projectModal");
        document.getElementById("projectName").value = "";
        document.getElementById("projectBudgetInput").value = "";
    }
};

// Render Projects
function renderProjects() {
    projectList.innerHTML = "";
    projects.forEach((project, index) => {
        const li = document.createElement("li");
        li.textContent = project.name;
        li.onclick = () => selectProject(index);
        projectList.appendChild(li);
    });
}

// Select Project
function selectProject(index) {
    selectedProjectIndex = index;
    const project = projects[index];
    projectTitle.textContent = project.name;
    projectBudget.textContent = project.budget.toFixed(2);
    renderTasks(project.tasks);
    projectDetails.classList.remove("hidden");
}

// Render Tasks
function renderTasks(tasks) {
    taskList.innerHTML = "";
    tasks.forEach((task, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${task.name}</strong> [${task.priority}]
            <br/>Reminder: ${task.reminder || "None"}
            ${task.photo ? `</br><img src="${task.photo}" width="100" />` : ""}
            <br/>
            <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${i})" />
            <button onclick="deleteTask(${i})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Add Task
document.getElementById("addTaskBtn").onclick = () => openModal("taskModal");

document.getElementById("saveTask").onclick = () => {
    const name = document.getElementById("taskName").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const reminder = document.getElementById("taskReminder").value;
    const photoInput = document.getElementById("taskPhoto");
    const reader = new FileReader();
    if (name && selectedProjectIndex !== null) {
        const task = { name, priority, reminder, completed: false };
        if (photoInput.files[0]) {
            reader.onload = function (e) {
                task.photo = e.target.result;
                addTask(task);
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
        else {
            addTask(task);
        }
    }
};

function addTask(task) {
    projects[selectedProjectIndex].tasks.push(task);
    saveProjects();
    renderTasks(projects[selectedProjectIndex].tasks);
    closeModal("taskModal");
    document.getElementById("taskName").value = "";
    document.getElementById("taskReminder").value = "";
    document.getElementById("taskPhoto").value = "";
}

// Delete Task
function deleteTask(index) {
    projects[selectedProjectIndex].tasks.splice(index, 1);
    saveProjects();
    renderTasks(projects[selectedProjectIndex].tasks);
}

// Toggle Completion
function toggleTask(index) {
    const task = projects[selectedProjectIndex].tasks[index];
    task.completed = !task.completed;
    saveProjects();
}

// Save to localStorage
function saveProjects() {
    localStorage.setItem("projects", JSON.stringify(projects));
}

// Initial render
renderProjects();