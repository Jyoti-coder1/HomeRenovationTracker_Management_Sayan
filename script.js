// Initialize data arrays with fallback empty arrays
let projects = [];
let inventory = [];
let contractors = [];
let maintenance = [];
let selectedProjectIndex = null;

// Load saved data from localStorage safely
try {
    projects = JSON.parse(localStorage.getItem("projects")) || [];
} catch {
    projects = [];
}
try {
    inventory = JSON.parse(localStorage.getItem("inventory")) || [];
} catch {
    inventory = [];
}
try {
    contractors = JSON.parse(localStorage.getItem("contractors")) || [];
} catch {
    contractors = [];
}
try {
    maintenance = JSON.parse(localStorage.getItem("maintenance")) || [];
} catch {
    maintenance = [];
}

// Save all data helper
function saveAll() {
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("contractors", JSON.stringify(contractors));
    localStorage.setItem("maintenance", JSON.stringify(maintenance));
}

// Modal helpers
function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
    resetModalInputs(id);
}

function resetModalInputs(modalId) {
    document.querySelectorAll(`#${modalId} input, #${modalId} textarea, #${ modalId} select`).forEach(el => {
        if (el.type === "file") el.value = "";
        else if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
    });
}
function showSection(id) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// --- DOM refs (projects)
const projectList = document.getElementById("projectList");
const projectTitle = document.getElementById("projectTitle");
const projectBudget = document.getElementById("projectBudget");
const taskList = document.getElementById("taskList");

// Wire buttons for opening modals
document.getElementById("newProjectBtn").onclick = () => openModal("projectModal");
document.getElementById("newInventoryBtn").onclick = () => openModal("inventoryModal");
document.getElementById("newContractorBtn").onclick = () => openModal("contractorModal");

// Save new project
document.getElementById("saveProject").onclick = () => {
    const name = document.getElementById("projectName").value.trim();
    const budget = parseFloat(document.getElementById("projectBudgetInput").value) || 0;
    if (name) {
        projects.push({ name, budget, tasks: [], permits: [] });
        saveAll();
        renderProjects();
        closeModal("projectModal");
    } else {
        alert("Project name is required");
    }
};

// Render projects list
function renderProjects() {
    projectList.innerHTML = "";
    projects.forEach((p, i) => {
        const li = document.createElement("li");
        li.textContent = p.name;
        li.style.cursor = "pointer";
        li.onclick = () => { selectProject(i); showSection('projectsSection'); };
        projectList.appendChild(li);
    });
}

// Select and show project details
function selectProject(i) {
    selectedProjectIndex = i;
    const p = projects[i];
    projectTitle.textContent = p.name;
    projectBudget.textContent = (p.budget || 0).toFixed(2);
    renderTasks(p.tasks || []);
    document.getElementById("projectDetails").classList.remove("hidden");
    // Remember last
    localStorage.setItem('lastProject', i);
    renderPermits();
}

// Render tasks for selected project
function renderTasks(tasks) {
    taskList.innerHTML = "";
    tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${t.name}</strong> [${t.priority}] - Collaborator: ${t.collaborator || "N/A"}<br/>
            Reminder: ${t.reminder || "None"} 
            ${t.photo ? `<br/><img src="${t.photo}" alt="Photo for task ${t.name}" title="Photo for ${t.name}" width="100"/>` : ""}
            <br/>
            <input type="checkbox" id="taskChk_${i}" ${t.completed ? "checked" : ""} onchange="toggleTask(${i})" aria-label="Mark ${t.name} as completed"/>
            <label for="task_Chk${i}">Completed</label>
            <button aria-label="Delete task{t.name}" title="Delete task ${t.name}" onclick="deleteTask(${i})">🗑</button>
        `;
        taskList.appendChild(li);
    });
}

// Add task button opens task modal
document.getElementById("addTaskBtn").onclick = () => {
    if (selectedProjectIndex === null) return alert("Select a project first.");
    openModal("taskModal");
};

// Save new task
document.getElementById("saveTask").onclick = () => {
    const name = document.getElementById("taskName").value.trim();
    const collaborator = document.getElementById("taskCollaborator").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const reminder = document.getElementById("taskReminder").value;
    const photoFile = document.getElementById("taskPhoto").files[0];
    if (!name || selectedProjectIndex === null) return alert("Task name and a project are required.");

    const task = { name, collaborator, priority, reminder, completed: false };
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = e => {
            task.photo = e.target.result;
            addTask(task);
        };
        reader.readAsDataURL(photoFile);
    } else {
        addTask(task);
    }
};

function addTask(task) {
    projects[selectedProjectIndex].tasks.push(task);
    saveAll();
    renderTasks(projects[selectedProjectIndex].tasks);
    closeModal("taskModal");
}

//Delete Task
function deleteTask(i) {
    if (!confirm("Delete this task?")) return;
    projects[selectedProjectIndex].tasks.splice(i, 1);
    saveAll();
    renderTasks(projects[selectedProjectIndex].tasks);
}

//Toggle completion
function toggleTask(i) {
    const task = projects[selectedProjectIndex].tasks[i];
    task.completed = !task.completed;
    saveAll();
}

// --- Inventory ---
document.getElementById("newInventoryBtn").onclick = () => openModal("inventoryModal");
document.getElementById("saveInventory").onclick = () => {
    const name = document.getElementById("inventoryName").value.trim();
    const qty = parseInt(document.getElementById("inventoryQty").value) || 0;
    if (name) {
        inventory.push({ name, qty });
        saveAll();
        renderInventory();
        closeModal("inventoryModal");
    } else {
        alert("Item name is required");
    }
};
function renderInventory() {
    const list = document.getElementById("inventoryList");
    list.innerHTML = "";
    inventory.forEach((item, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - Qty: ${item.qty} 
            <button aria-label="Edit inevntory item ${item.name}" title="Edit ${item.name}" onclick="editInventory(${i})">✏</button> 
            <button aria-label="Delete inevntory item ${item.name}" title="Delete ${item.name}" onclick="deleteInventory(${i})">🗑</button>
        `;
        list.appendChild(li);
    });
}
function editInventory(i) {
    const newName = prompt("Edit item name:", inventory[i].name);
    const newQty = prompt("Edit quantity:", inventory[i].qty);
    if (newName !== null && newQty !== null) {
        inventory[i].name = newName.trim();
        inventory[i].qty = parseInt(newQty) || 0;
        saveAll();
        renderInventory();
    }
}
function deleteInventory(i) {
    if (confirm("Delete this inventory item?")) {
        inventory.splice(i, 1);
        saveAll();
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
        saveAll();
        renderContractors();
        closeModal("contractorModal");
    } else {
        alert("Contractor name is required");
    }
};
function renderContractors() {
    const list = document.getElementById("contractorList");
    list.innerHTML = "";
    contractors.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${c.name}</strong> - ${c.phone} - ${c.email}<br/>
            ${c.notes || ""}
            <br/>
            <button aria-label="Edit contractor ${c.name}" title="Edit ${c.name}" onclick="editContractor(${i})">✏</button> 
            <button aria-label="Delete contractor ${c.name}" title="Delete ${c.name}" onclick="deleteContractor(${i})">🗑</button>
        `;
        list.appendChild(li);
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
        saveAll();
        renderContractors();
    }
}
function deleteContractor(i) {
    if (confirm("Delete this contractor?")) {
        contractors.splice(i, 1);
        saveAll();
        renderContractors();
    }
}

// --- Permits ---
function renderPermits() {
    if (selectedProjectIndex === null) return;
    const list = document.getElementById("permitList");
    list.innerHTML = "";
    const proj = projects[selectedProjectIndex];
    proj.permits = proj.permits || [];

    proj.permits.forEach((p, idx) => {
        const li = document.createElement("li");
        li.className = "permit-item";

        // Create checkbox with label
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `permit_${idx}`;
        checkbox.checked = p.obtained
        checkbox.setAttribute("aria-label", `Permit ${p.name}`);
        checkbox.onchange = () => togglePermit(idx);

        const label = document.createElement("label");
        label.htmlFor = `permit_${idx}`;
        label.textContent = p.name;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.setAttribute("aria-label", `Remove permit ${p.name}`);
        deleteBtn.onclick = () => removePermit(idx);

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
    /*if (selectedProjectIndex === null) return;
    const list = document.getElementById("permitList");
    list.innerHTML = "";
    const proj = projects[selectedProjectIndex];
    proj.permits = proj.permits || [];

    proj.permits.forEach((p, idx) => {
        const li = document.createElement("li");
        li.className = "permit-item";
        li.innerHTML = `
            <input type="checkbox" id="permit_${idx}" ${p.obtained ? "checked" : ""} onchange="togglePermit(${idx})" />
            <label for="permit_${idx}">${p.name}</label>
            <button onclick="removePermit(${idx})">🗑</button>
        `;
        list.appendChild(li);
    });*/
}
function addPermit() {
    const nameEl = document.getElementById("newPermitName");
    const name = nameEl.value.trim();
    if (!name || selectedProjectIndex === null) return alert("Add a permit name and select a project.");
    const proj = projects[selectedProjectIndex];
    proj.permits = proj.permits || [];
    proj.permits.push({ name, obtained: false });
    saveAll();
    renderPermits();
    nameEl.value = "";
}
function togglePermit(idx) {
    const proj = projects[selectedProjectIndex];
    proj.permits[idx].obtained = !proj.permits[idx].obtained;
    saveAll();
    renderPermits();
}
function removePermit(idx) {
    const proj = projects[selectedProjectIndex];
    if (confirm("Remove this permit?")) {
        proj.permits.splice(idx, 1);
        saveAll();
        renderPermits();
    }
}

// --- Maintenance(global) ---
function renderMaintenance() {
    const list = document.getElementById("maintenanceList");
    list.innerHTML = "";
    maintenance.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${m.name}</strong> — Next due: ${m.nextDue || m.startDate || "N/A"}<br>
            Frequency: ${m.freq}<br/>
            <button aria-label="Edit maintenance task ${m.name}" title="Edit ${m.name}" onclick="editMaintenance(${i})">✏</button> 
            <button aria-label="Delete maintenance task ${m.name}" title="Delete ${m.name}" onclick="deleteMaintenance(${i})">🗑</button>
        `;
        list.appendChild(li);
    });
}
function addMaintenance() {
    const name = document.getElementById("maintenanceName").value.trim();
    const startDate = document.getElementById("maintenanceStart").value;
    const freq = document.getElementById("maintenanceFreq").value;
    if (!name || !startDate) return alert("Provide name and start date.");
    const nextDue = startDate;
    maintenance.push({ name, startDate, freq, nextDue });
    saveAll();
    renderMaintenance();
    // Clear inputs manually here because maintenance inputs are not in a modal
    document.getElementById("maintenanceName").value = "";
    document.getElementById("maintenanceStart").value = "";
    document.getElementById("maintenanceFreq").selectedIndex = 0;
}
function editMaintenance(i) {
    const item = maintenance[i];
    const newName = prompt("Task name:", item.name) || item.name;
    const newStart = prompt("Start date (YYYY-MM-DD):", item.startDate) || item.startDate;
    const newFreq = prompt("Frequency (none, monthly, quarterly, yearly):", item.freq) || item.freq;
    item.name = newName.trim();
    item.startDate = newStart;
    item.freq = newFreq;
    item.nextDue = newStart;
    saveAll();
    renderMaintenance();
}
function deleteMaintenance(i) {
    if (confirm("Delete maintenance task?")) {
        maintenance.splice(i, 1);
        saveAll();
        renderMaintenance();
    }
}
function addMonths(dateStr, months) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
}
function checkMaintenanceDue() {
    const today = new Date().toISOString().slice(0, 10);
    maintenance.forEach((m) => {
        if (!m.nextDue) return;
        if (m.nextDue <= today) {
            alert(`🔧 Maintenance due: ${ m.name }(due ${m.nextDue})`);
            if (m.freq === "monthly") m.nextDue = addMonths(m.nextDue, 1);
            else if (m.freq === "quarterly") m.nextDue = addMonths(m.nextDue, 3);
            else if (m.freq === "yearly") m.nextDue = addMonths(m.nextDue, 12);
            else m.nextDue = null;
            saveAll();
            renderMaintenance();
        }
    });
}
function scheduleMaintenanceChecks() {
    checkMaintenanceDue();
    setInterval(checkMaintenanceDue, 60 * 1000);
}

// Export project to PDF
async function exportProjectToPDF() {
    if (selectedProjectIndex === null) return alert("Select a project to export.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const proj = projects[selectedProjectIndex];
    let y = 10;
    doc.setFontSize(16);
    doc.text(`Project: ${proj.name}`, 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Budget: ₹${proj.budget}`, 10, y);
    y += 8;

    if (proj.permits && proj.permits.length) {
        doc.text("Permits:", 10, y);
        y += 6;
        proj.permits.forEach(p => {
            doc.text(`- ${p.name} : ${p.obtained ? "Obtained" : "Required" }`, 12, y);
            y += 6;
            if (y > 270) { doc.addPage(); y = 10; }
        });
    }

    if (proj.tasks && proj.tasks.length) {
        doc.text("Tasks:", 10, y);
        y += 6;
        for (const t of proj.tasks) {
            doc.text(`- ${t.name} [${t.priority}]- Collaborator: ${t.collaborator || "N/A"}`, 12, y);
            y += 6;
            if (t.reminder) {
                doc.text(`  Reminder: ${t.reminder}`, 14, y);
                y += 6;
            }
            if (t.photo) {
                try {
                    const imgProps = doc.getImageProperties(t.photo);
                    const width = Math.min(120, imgProps.width * 0.2);
                    const height = (imgProps.height / imgProps.width) * width;
                    if (y + height > 280) { doc.addPage(); y = 10; }
                    doc.addImage(t.photo, 'JPEG', 12, y, width, height);
                    y += height + 6;
                } catch (err) {
                    console.warn("Image skipped in PDF", err);
                    doc.text("  [Image omitted]", 14, y);
                    y += 6;
                }
            }
            if (y > 270) { doc.addPage(); y = 10; }
        }
    }

    const safeName = proj.name.replace(/\s+/g, '_').toLowerCase();
    doc.save(`${safeName}_report.pdf`);
}

// Event wiring
document.getElementById("addPermitBtn").addEventListener("click", addPermit);
document.getElementById("addMaintenanceBtn").addEventListener("click", addMaintenance);
document.getElementById("exportPdfBtn").addEventListener("click", exportProjectToPDF);

// Remember last opened project (optional)
const last = localStorage.getItem('lastProject');
if (last !== null) {
    const idx = parseInt(last);
    if (projects[idx]) selectProject(idx);
}

// Initial render calls
renderProjects();
renderInventory();
renderContractors();
renderMaintenance();
scheduleMaintenanceChecks();

/*// Initialize data arrays with fallback empty arrays
let projects = [];
let inventory = [];
let contractors = [];
let maintenance = [];
let selectedProjectIndex = null;

// Load saved data from localStorage safely
try {
    projects = JSON.parse(localStorage.getItem("projects")) || [];
} catch {
    projects = [];
}
try {
    inventory = JSON.parse(localStorage.getItem("inventory")) || [];
} catch {
    inventory = [];
}
try {
    contractors = JSON.parse(localStorage.getItem("contractors")) || [];
} catch {
    contractors = [];
}
try {
    maintenance = JSON.parse(localStorage.getItem("maintenance")) || [];
} catch {
    maintenance = [];
}

// Save all data helper
function saveAll() {
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("contractors", JSON.stringify(contractors));
    localStorage.setItem("maintenance", JSON.stringify(maintenance));
}

// Modal helpers
function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
    resetModalInputs(id);
}
function resetModalInputs(modalId) {
    document.querySelectorAll(`#${modalId} input, #${modalId} textarea, #${modalId} select`).forEach(el => {
        if (el.type === "file") el.value = "";
        else if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
    });
}
function showSection(id) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// --- DOM refs (projects)
const projectList = document.getElementById("projectList");
const projectTitle = document.getElementById("projectTitle");
const projectBudget = document.getElementById("projectBudget");
const taskList = document.getElementById("taskList");

// Wire sidebar buttons to show sections + open modals
document.getElementById("newProjectBtn").onclick = () => {
    showSection("projectsSection");
    openModal("projectModal");
};
document.getElementById("newInventoryBtn").onclick = () => {
    showSection("inventorySection");
    openModal("inventoryModal");
};
document.getElementById("newContractorBtn").onclick = () => {
    showSection("contractorsSection");
    openModal("contractorModal");
};
document.getElementById("maintenanceSectionBtn").onclick = () => {
    showSection("maintenanceSection");
};

// Save new project
document.getElementById("saveProject").onclick = () => {
    const name = document.getElementById("projectName").value.trim();
    const budget = parseFloat(document.getElementById("projectBudgetInput").value) || 0;
    if (name) {
        projects.push({ name, budget, tasks: [], permits: [] });
        saveAll();
        renderProjects();
        closeModal("projectModal");
    } else {
        alert("Project name is required");
    }
};

// Render projects list
function renderProjects() {
    projectList.innerHTML = "";
    projects.forEach((p, i) => {
        const li = document.createElement("li");
        li.textContent = p.name;
        li.style.cursor = "pointer";
        li.setAttribute("tabindex", "0");
        li.onclick = () => { selectProject(i); showSection('projectsSection'); };
        li.onkeypress = e => {
            if (e.key === "Enter" || e.key === " ") {
                selectProject(i);
                showSection('projectsSection');
            }
        };
        projectList.appendChild(li);
    });
}

// Select and show project details
function selectProject(i) {
    selectedProjectIndex = i;
    const p = projects[i];
    projectTitle.textContent = p.name;
    projectBudget.textContent = (p.budget || 0).toFixed(2);
    renderTasks(p.tasks || []);
    document.getElementById("projectDetails").classList.remove("hidden");
    localStorage.setItem('lastProject', i);
    renderPermits();
}

// --- Render tasks with labels and alt text ---
function renderTasks(tasks) {
    taskList.innerHTML = "";
    tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${t.name}</strong> [${t.priority}] - Collaborator: ${t.collaborator || "N/A"}<br/>
            Reminder: ${t.reminder || "None"}<br/>
            ${t.photo ? `<img src="${t.photo}" alt="Photo for task ${t.name}" width="100" />` : ""}
            <br/>
            <input type="checkbox" id="taskChk_${i}" ${t.completed ? "checked" : ""} onchange="toggleTask(${i})"/>
            <label for="taskChk_${i}">Completed</label>
            <button aria-label="Delete task ${t.name}" onclick="deleteTask(${i})">🗑</button>
        `;
        taskList.appendChild(li);
    });
}

// Add task button opens task modal
document.getElementById("addTaskBtn").onclick = () => {
    if (selectedProjectIndex === null) return alert("Select a project first.");
    openModal("taskModal");
};

// Save new task
document.getElementById("saveTask").onclick = () => {
    const name = document.getElementById("taskName").value.trim();
    const collaborator = document.getElementById("taskCollaborator").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const reminder = document.getElementById("taskReminder").value;
    const photoFile = document.getElementById("taskPhoto").files[0];
    if (!name || selectedProjectIndex === null) return alert("Task name and a project are required.");

    const task = { name, collaborator, priority, reminder, completed: false };
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = e => {
            task.photo = e.target.result;
            addTask(task);
        };
        reader.readAsDataURL(photoFile);
    } else {
        addTask(task);
    }
};
function addTask(task) {
    projects[selectedProjectIndex].tasks.push(task);
    saveAll();
    renderTasks(projects[selectedProjectIndex].tasks);
    closeModal("taskModal");
}

function deleteTask(i) {
    if (!confirm("Delete this task?")) return;
    projects[selectedProjectIndex].tasks.splice(i, 1);
    saveAll();
    renderTasks(projects[selectedProjectIndex].tasks);
}

function toggleTask(i) {
    const task = projects[selectedProjectIndex].tasks[i];
    task.completed = !task.completed;
    saveAll();
    renderTasks(projects[selectedProjectIndex].tasks);
}

// --- Inventory ---
document.getElementById("saveInventory").onclick = () => {
    const name = document.getElementById("inventoryName").value.trim();
    const qty = parseInt(document.getElementById("inventoryQty").value) || 0;
    if (name) {
        inventory.push({ name, qty });
        saveAll();
        renderInventory();
        closeModal("inventoryModal");
    } else {
        alert("Item name is required");
    }
};
function renderInventory() {
    const list = document.getElementById("inventoryList");
    list.innerHTML = "";
    inventory.forEach((item, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - Qty: ${item.qty}
            <button aria-label="Edit inventory item ${item.name}" onclick="editInventory(${i})">✏</button>
            <button aria-label="Delete inventory item ${item.name}" onclick="deleteInventory(${i})">🗑</button>
        `;
        list.appendChild(li);
    });
}
function editInventory(i) {
    const newName = prompt("Edit item name:", inventory[i].name);
    const newQty = prompt("Edit quantity:", inventory[i].qty);
    if (newName !== null && newQty !== null) {
        inventory[i].name = newName.trim();
        inventory[i].qty = parseInt(newQty) || 0;
        saveAll();
        renderInventory();
    }
}
function deleteInventory(i) {
    if (confirm("Delete this inventory item?")) {
        inventory.splice(i, 1);
        saveAll();
        renderInventory();
    }
}

// --- Contractors ---
document.getElementById("saveContractor").onclick = () => {
    const name = document.getElementById("contractorName").value.trim();
    const phone = document.getElementById("contractorPhone").value.trim();
    const email = document.getElementById("contractorEmail").value.trim();
    const notes = document.getElementById("contractorNotes").value.trim();
    if (name) {
        contractors.push({ name, phone, email, notes });
        saveAll();
        renderContractors();
        closeModal("contractorModal");
    } else {
        alert("Contractor name is required");
    }
};
function renderContractors() {
    const list = document.getElementById("contractorList");
    list.innerHTML = "";
    contractors.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${c.name}</strong> - ${c.phone} - ${c.email}<br/>
            ${c.notes || ""}<br/>
            <button aria-label="Edit contractor ${c.name}" onclick="editContractor(${i})">✏</button>
            <button aria-label="Delete contractor ${c.name}" onclick="deleteContractor(${i})">🗑</button>
        `;
        list.appendChild(li);
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
        saveAll();
        renderContractors();
    }
}
function deleteContractor(i) {
    if (confirm("Delete this contractor?")) {
        contractors.splice(i, 1);
        saveAll();
        renderContractors();
    }
}

// --- Permits ---
function renderPermits() {
    if (selectedProjectIndex === null) return;
    const list = document.getElementById("permitList");
    list.innerHTML = "";
    const proj = projects[selectedProjectIndex];
    proj.permits = proj.permits || [];

    proj.permits.forEach((p, idx) => {
        const li = document.createElement("li");
        li.className = "permit-item";

        // Create checkbox with label
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `permit_${idx}`;
        checkbox.checked = p.obtained
        checkbox.setAttribute("aria-label", `Permit ${p.name}`);
        checkbox.onchange = () => togglePermit(idx);

        const label = document.createElement("label");
        label.htmlFor = `permit_${idx}`;
        label.textContent = p.name;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.setAttribute("aria-label", `Remove permit ${p.name}`);
        deleteBtn.onclick = () => removePermit(idx);

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

function addPermit() {
    const nameEl = document.getElementById("newPermitName");
    const name = nameEl.value.trim();
    if (!name || selectedProjectIndex === null) {
        alert("Add a permit name and select a project.");
        return;
    }
    const proj = projects[selectedProjectIndex];
    proj.permits = proj.permits || [];
    proj.permits.push({ name, obtained: false });
    saveAll();
    renderPermits();
    nameEl.value = "";
}

function togglePermit(idx) {
    const proj = projects[selectedProjectIndex];
    proj.permits[idx].obtained = !proj.permits[idx].obtained;
    saveAll();
    renderPermits();
}

function removePermit(idx) {
    const proj = projects[selectedProjectIndex];
    if (confirm("Remove this permit?")) {
        proj.permits.splice(idx, 1);
        saveAll();
        renderPermits();
    }
}

// --- Maintenance ---
function renderMaintenance() {
    const list = document.getElementById("maintenanceList");
    list.innerHTML = "";
    maintenance.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${m.name}</strong> — Next due: ${m.nextDue || m.startDate || "N/A"}<br/>
            Frequency: ${m.freq}<br/>
            <button aria-label="Edit maintenance task ${m.name}" onclick="editMaintenance(${i})">✏</button>
            <button aria-label="Delete maintenance task ${m.name}" onclick="deleteMaintenance(${i})">🗑</button>
        `;
        list.appendChild(li);
    });
}

function addMaintenance() {
    const name = document.getElementById("maintenanceName").value.trim();
    const startDate = document.getElementById("maintenanceStart").value;
    const freq = document.getElementById("maintenanceFreq").value;
    if (!name || !startDate) {
        alert("Provide name and start date.");
        return;
    }
    const nextDue = startDate;
    maintenance.push({ name, startDate, freq, nextDue });
    saveAll();
    renderMaintenance();
    document.getElementById("maintenanceName").value = "";
    document.getElementById("maintenanceStart").value = "";
    document.getElementById("maintenanceFreq").selectedIndex = 0;
}

function editMaintenance(i) {
    const item = maintenance[i];
    const newName = prompt("Task name:", item.name) || item.name;
    const newStart = prompt("Start date (YYYY-MM-DD):", item.startDate) || item.startDate;
    const newFreq = prompt("Frequency (none, monthly, quarterly, yearly):", item.freq) || item.freq;
    item.name = newName.trim();
    item.startDate = newStart;
    item.freq = newFreq;
    item.nextDue = newStart;
    saveAll();
    renderMaintenance();
}

function deleteMaintenance(i) {
    if (confirm("Delete maintenance task?")) {
        maintenance.splice(i, 1);
        saveAll();
        renderMaintenance();
    }
}

function addMonths(dateStr, months) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
}

function checkMaintenanceDue() {
    const today = new Date().toISOString().slice(0, 10);
    maintenance.forEach((m) => {
        if (!m.nextDue) return;
        if (m.nextDue <= today) {
            alert(`🔧Maintenance due: ${m.name} (due ${m.nextDue})`);
            if (m.freq === "monthly") m.nextDue = addMonths(m.nextDue, 1);
            else if (m.freq === "quarterly") m.nextDue = addMonths(m.nextDue, 3);
            else if (m.freq === "yearly") m.nextDue = addMonths(m.nextDue, 12);
            else m.nextDue = null;
            saveAll();
            renderMaintenance();
        }
    });
}

function scheduleMaintenanceChecks() {
    checkMaintenanceDue();
    setInterval(checkMaintenanceDue, 60 * 1000); // check every 1 minute
}

// --- Export project to PDF ---
async function exportProjectToPDF() {
    if (selectedProjectIndex === null) {
        alert("Select a project to export.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const proj = projects[selectedProjectIndex];
    let y = 10;
    doc.setFontSize(16);
    doc.text(`Project: ${proj.name}`, 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Budget: ₹${proj.budget}`, 10, y);
    y += 8;

    if (proj.permits && proj.permits.length) {
        doc.text("Permits:", 10, y);
        y += 6;
        proj.permits.forEach(p => {
            doc.text(`- ${p.name} : ${p.obtained ? "Obtained" : "Required"}`, 12, y);
            y += 6;
            if (y > 270) { doc.addPage(); y = 10; }
        });
    }

    if (proj.tasks && proj.tasks.length) {
        doc.text("Tasks:", 10, y);
        y += 6;
        for (const t of proj.tasks) {
            doc.text(`- ${t.name}[${t.priority}]- Collaborator: ${t.collaborator || "N/A"}`, 12, y);
            y += 6;
            if (t.reminder) {
                doc.text(`  Reminder: ${t.reminder}`, 14, y);
                y += 6;
            }
            if (t.photo) {
                try {
                    const imgProps = doc.getImageProperties(t.photo);
                    const width = Math.min(120, imgProps.width * 0.2);
                    const height = (imgProps.height / imgProps.width) * width;
                    if (y + height > 280) {
                        doc.addPage();
                        y = 10;
                    }
                    doc.addImage(t.photo, 'JPEG', 12, y, width, height);
                    y += height + 6;
                } catch (err) {
                    console.warn("Image skipped in PDF", err);
                    doc.text("  [Image omitted]", 14, y);
                    y += 6;
                }
            }
            if (y > 270) {
                doc.addPage();
                y = 10;
            }
        }
    }

    const safeName = proj.name.replace(/\s+/g, '_').toLowerCase();
    doc.save(`${safeName}_report.pdf`);
}

// Event wiring for Day4 elements
document.getElementById("addPermitBtn").addEventListener("click", addPermit);
document.getElementById("addMaintenanceBtn").addEventListener("click", addMaintenance);
document.getElementById("exportPdfBtn").addEventListener("click", exportProjectToPDF);

// Load last selected project on page load, or first
const last = localStorage.getItem('lastProject');
if (last !== null) {
    const idx = parseInt(last);
    if (projects[idx]) selectProject(idx);
}

// Initial render calls
renderProjects();
renderInventory();
renderContractors();
renderMaintenance();
scheduleMaintenanceChecks();*/