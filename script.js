let projects = JSON.parse(localStorage.getItem("projects")) || [];
let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let contractors = JSON.parse(localStorage.getItem("contractors")) || [];
let selectedProjectIndex = null;

function saveData() {
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("contractors", JSON.stringify(contractors));
}

// Modal functions
function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function showSection(id) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

//Projects
const projectList = document.getElementById("projectList");
const projectTitle = document.getElementById("projectTitle");
const projectBudget = document.getElementById("projectBudget");
const taskList = document.getElementById("taskList");

document.getElementById("newProjectBtn").onclick = () => openModal("projectModal");
document.getElementById("saveProject").onclick = () => {
    const name = document.getElementById("projectName").value.trim();
    const budget = parseFloat(document.getElementById("projectBudgetInput").value) || 0;
    if (name) {
        projects.push({ name, budget, collaborator, tasks: [] });
        saveData();
        renderProjects();
        closeModal("projectModal");
    }
};


// Render Projects
function renderProjects() {
    projectList.innerHTML = "";
    projects.forEach((p, i) => {
        const li = document.createElement("li");
        li.textContent = p.name;
        li.onclick = () => selectProject(i);
        projectList.appendChild(li);
    });
}

// Select Project
function selectProject(i) {
    selectedProjectIndex = i;
    const p = projects[i];
    projectTitle.textContent = p.name;
    projectBudget.textContent = p.budget.toFixed(2);
    renderTasks(p.tasks);
    document.getElementById("projectDetails").classList.remove("hidden");
}

// Render Tasks
function renderTasks(tasks) {
    taskList.innerHTML = "";
    tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${t.name}</strong> [${t.priority}] - collaborator: ${t.collaborator || "N/A"}</br>
            Reminder: ${t.reminder || "None"}
            ${t.photo ? `</br><img src="${t.photo}" width="100" />` : ""}
            <br/>
            <input type="checkbox" ${t.completed ? "checked" : ""} onchange="toggleTask(${i})" />
            <button onclick="deleteTask(${i})">🗑</button>
        `;
        taskList.appendChild(li);
    });
}

// Add Task
document.getElementById("addTaskBtn").onclick = () => openModal("taskModal");
document.getElementById("saveTask").onclick = () => {
    const name = document.getElementById("taskName").value.trim();
    const collaborator = document.getElementById("taskCollaborators").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const reminder = document.getElementById("taskReminder").value;
    const photoInput = document.getElementById("taskPhoto").files[0];
    if (!name || selectedProjectIndex === null) return;
    const task = { name, priority, reminder, completed: false };
    if (photoInput) {
        const reader = new FileReader();
        reader.onload = e => {
            task.photo = e.target.result;
            addTask(task);
        };
        reader.readAsDataURL(photoInput);
    }
    else {
        addTask(task);
    }
};

function addTask(task) {
    projects[selectedProjectIndex].tasks.push(task);
    saveData();
    renderTasks(projects[selectedProjectIndex].tasks);
    closeModal("taskModal");
}

// Delete Task
function deleteTask(index) {
    projects[selectedProjectIndex].tasks.splice(index, 1);
    saveData();
    renderTasks(projects[selectedProjectIndex].tasks);
}

// Toggle Completion
function toggleTask(index) {
    const task = projects[selectedProjectIndex].tasks[index];
    task.completed = !task.completed;
    saveData();
}

//Inventory
document.getElementById("newInventoryBtn").onclick = () => openModal("inventoryModal");
document.getElementById("saveInventory").onclick = () => {
    const name = document.getElementById("inventoryName").value.trim();
    const qty = parseInt(document.getElementById("inventoryQty").value) || 0;
    if (name) {
        inventory.push({ name, qty });
        saveData();
        renderInventory();
        closeModal("inventoryModal");
    }
};
function renderInventory() {
    const list = document.getElementById("inventoryList");
    list.innerHTML = "";
    inventory.forEach((item, i) => {
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - Qty: ${item.qty}
        <button onclick="editInventory(${i})">✏</button>
        <button onclick="deleteInventory(${i})">🗑</button>
        )`;
        list.appendChild(li);
    });
}
function editInventory(i) {
    const newName = prompt("Edit item name:", inventory[i].name);
    const newQty = prompt("Edit quantity:", inventory[i].qty);
    if (newName !== null && newQty !== null) {
        inventory[i].name = newName.trim();
        inventory[i].qty = parseInt(newQty) || 0;
        saveData();
        renderInventory();
  }
}
function deleteInventory(i) {
    if (confirm("Delete this inventory item?")) {
        inventory.splice(i, 1);
        saveData();
        renderInventory();
    }
} 

// --- Contractors ---
document.getElementById("newContractorBtn").onclick = () => openModal("contractorModal");
document.getElementById("saveContractor").onclick = () => {
    const name = document.getElementById("contractorName").value.trim();
    const phone = document.getElementById("contractorPhone").value.trim();
    const email = document.getElementById("contractorEmail").value.trim();
    const notes = document.getElementById("contractorNotes").value.trim();
    if (name) {
        contractors.push({ name, phone, email, notes });
        saveData();
        renderContractors();
        closeModal("contractorModal");
    }
};
function renderContractors() {
    const list = document.getElementById("contractorList");
    list.innerHTML = "";
    contractors.forEach((c, i) => {
        list.innerHTML += `<li><strong>${c.name}</strong> - ${c.phone} - ${c.email}<br/>
            ${c.notes || ""}
            <br/><button onclick="editContractor(${i})">✏</button>
            <button onclick="deleteContractor(${i})">🗑</button></li>
        `;
  });
}
function editContractor(i) {
  const newName = prompt("Edit contractor name:", contractors[i].name);
  const newPhone = prompt("Edit phone:", contractors[i].phone);
  const newEmail = prompt("Edit email:", contractors[i].email);
  const newNotes = prompt("Edit notes:", contractors[i].notes);
  if (newName !== null) {
    contractors[i].name = newName.trim();
    contractors[i].phone = newPhone.trim();
    contractors[i].email = newEmail.trim();
    contractors[i].notes = newNotes.trim();
    saveData();
    renderContractors();
  }
}
function deleteContractor(i) {
  if (confirm("Delete this contractor?")) {
    contractors.splice(i, 1);
    saveData();
    renderContractors();
  }
}

// Initial render
renderProjects();
renderInventory();
renderContractors();