let projects = JSON.parse(localStorage.getItem("projects")) || [];
let selectedProjectIndex = null;

const projectList = document.getElementById("projectList");
const projectTitle = document.getElementById("projectTitle");
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
    if (name) {
        projects.push({ name, tasks: [] });
        saveProjects();
        renderProjects();
        closeModal("projectModal");
        document.getElementById("projectName").value = "";
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
    if (name && selectedProjectIndex !== null) {
        const task = { name, priority, completed: false };
        projects[selectedProjectIndex].tasks.push(task);
        saveProjects();
        renderTasks(projects[selectedProjectIndex].tasks);
        closeModal("taskModal");
        document.getElementById("taskName").value = "";
    }
};

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