// Constants
const weeksCount = 4;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const daysPerMonth = 28;

const STORAGE_KEYS = {
  NAME: "userName",
  MARKS: "achievementMarks",
  MONTHS: "achievementMonths",
  YEARS: "achievementYears",
  HISTORY: "undoHistory",
  TODO: "todoTasks",
  THEME: "themePreference",
  BACKUPS: "stateBackups",
  CATEGORIES: "customCategories",
  STREAK: "dailyStreak",
  LAST_ACTIVE: "lastActiveDate"
};

// Elements
const tableContainer = document.getElementById("tableContainer");
const userNameSpan = document.getElementById("userName");
const totalAchievements = document.getElementById("totalAchievements");
const streakCounter = document.getElementById("streakCounter");
const clearButton = document.getElementById("clearButton");
const undoButton = document.getElementById("undoButton");
const monthsTable = document.getElementById("monthsTable");
const yearsTable = document.getElementById("yearsTable");
const badgesTable = document.getElementById("badgesTable");
const exportButton = document.getElementById("exportButton");
const exportPdfButton = document.getElementById("exportPdfButton");
const importInput = document.getElementById("importInput");
const backupRestore = document.getElementById("backupRestore");
const themeToggle = document.getElementById("themeToggle");
const requestNotifications = document.getElementById("requestNotifications");
const openSettings = document.getElementById("openSettings");
const settingsModal = document.getElementById("settingsModal");
const settingsForm = document.getElementById("settingsForm");
const newCategoryInput = document.getElementById("newCategoryInput");
const customCategoriesList = document.getElementById("customCategoriesList");
const closeModal = document.querySelector(".close-modal");

const taskForm = document.getElementById("taskForm");
const taskNameInput = document.getElementById("taskNameInput");
const taskDurationInput = document.getElementById("taskDurationInput");
const taskReminderInput = document.getElementById("taskReminderInput");
const taskNotesInput = document.getElementById("taskNotesInput");
const taskCategoryInput = document.getElementById("taskCategoryInput");
const taskPriorityInput = document.getElementById("taskPriorityInput");
const taskDependencyInput = document.getElementById("taskDependencyInput");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");
const startTasksButton = document.getElementById("startTasksButton");
const pauseTasksButton = document.getElementById("pauseTasksButton");
const stopTasksButton = document.getElementById("stopTasksButton");
const exportCalendarButton = document.getElementById("exportCalendarButton");
const loadTemplate = document.getElementById("loadTemplate");
const taskTimerDisplay = document.getElementById("taskTimer");
const progressFill = document.getElementById("progressFill");
const completedTasksDisplay = document.getElementById("completedTasks");
const pendingTasksDisplay = document.getElementById("pendingTasks");
const avgTaskDurationDisplay = document.getElementById("avgTaskDuration");
const progressChart = document.getElementById("progressChart");

// State
let achievementMarks = [];
let achievementMonths = 0;
let achievementYears = 0;
let undoHistory = [];
let todoTasks = [];
let customCategories = ["Work", "Personal", "Health", "Other"];
let currentTaskIndex = 0;
let taskTimer = null;
let taskTimeLeft = 0;
let isPaused = false;
let dragStartIndex = null;
let backups = [];
let badges = [];
let dailyStreak = 0;
let lastActiveDate = null;

// Audio (placeholders, replace with base64 MP3s)
const markSound = new Audio("assets/alert.mp3");
const completeSound = new Audio("assets/sound.mp3");
const notifySound = new Audio("assets/goal.mp3");

// Task Templates
const taskTemplates = [
  { name: "Morning Workout", duration: 30, category: "Health", priority: "Medium", notes: "Cardio and stretching" },
  { name: "Work Meeting", duration: 60, category: "Work", priority: "High", notes: "Prepare agenda" },
  { name: "Read Book", duration: 45, category: "Personal", priority: "Low", notes: "30 pages" }
];

// Error Boundary
window.addEventListener("error", (e) => {
  console.error("Runtime error:", e.message);
  alert(`An error occurred: ${e.message}. Please try refreshing the page.`);
});

// Helpers
function validateState(data) {
  return data && Array.isArray(data.achievementMarks) && typeof data.achievementMonths === "number" &&
    typeof data.achievementYears === "number" && Array.isArray(data.todoTasks) &&
    Array.isArray(data.customCategories) && typeof data.dailyStreak === "number";
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(achievementMarks));
  localStorage.setItem(STORAGE_KEYS.MONTHS, achievementMonths);
  localStorage.setItem(STORAGE_KEYS.YEARS, achievementYears);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(undoHistory));
  localStorage.setItem(STORAGE_KEYS.TODO, JSON.stringify(todoTasks));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(customCategories));
  localStorage.setItem(STORAGE_KEYS.STREAK, dailyStreak);
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, lastActiveDate ? lastActiveDate.toISOString() : "");
  saveBackup();
}

function loadState() {
  const marks = localStorage.getItem(STORAGE_KEYS.MARKS);
  achievementMarks = marks ? JSON.parse(marks) : [];

  achievementMonths = parseInt(localStorage.getItem(STORAGE_KEYS.MONTHS)) || 0;
  achievementYears = parseInt(localStorage.getItem(STORAGE_KEYS.YEARS)) || 0;

  const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
  undoHistory = history ? JSON.parse(history) : [];

  const tasks = localStorage.getItem(STORAGE_KEYS.TODO);
  todoTasks = tasks ? JSON.parse(tasks) : [];

  const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  customCategories = categories ? JSON.parse(categories) : ["Work", "Personal", "Health", "Other"];

  dailyStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK)) || 0;
  const lastActive = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
  lastActiveDate = lastActive ? new Date(lastActive) : null;

  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light";
  }

  const storedBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS);
  backups = storedBackups ? JSON.parse(storedBackups) : [];
  updateBackupOptions();
  updateCategoryOptions();
  updateStreak();
}

function saveBackup() {
  const backup = {
    timestamp: new Date().toISOString(),
    userName: localStorage.getItem(STORAGE_KEYS.NAME),
    achievementMarks,
    achievementMonths,
    achievementYears,
    todoTasks,
    customCategories,
    dailyStreak,
    lastActiveDate
  };
  backups.push(backup);
  if (backups.length > 10) backups.shift();
  localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
}

function updateBackupOptions() {
  backupRestore.innerHTML = '<option value="">Select Backup to Restore</option>';
  backups.forEach((backup, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = new Date(backup.timestamp).toLocaleString();
    backupRestore.appendChild(option);
  });
}

function restoreBackup(index) {
  const backup = backups[index];
  if (!backup || !validateState(backup)) return;
  if (confirm("Restore this backup? This will overwrite current data.")) {
    localStorage.setItem(STORAGE_KEYS.NAME, backup.userName);
    achievementMarks = backup.achievementMarks || [];
    achievementMonths = backup.achievementMonths || 0;
    achievementYears = backup.achievementYears || 0;
    todoTasks = backup.todoTasks || [];
    customCategories = backup.customCategories || ["Work", "Personal", "Health", "Other"];
    dailyStreak = backup.dailyStreak || 0;
    lastActiveDate = backup.lastActiveDate ? new Date(backup.lastActiveDate) : null;
    undoHistory = [];
    saveState();
    updateUserName();
    updateCategoryOptions();
    updateDisplay();
    alert("Backup restored successfully!");
  }
}

function updateUserName() {
  let name = localStorage.getItem(STORAGE_KEYS.NAME);
  if (!name) {
    name = prompt("Please enter your name") || "User";
    localStorage.setItem(STORAGE_KEYS.NAME, name);
  }
  userNameSpan.textContent = name;
}

function updateStreak() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = lastActiveDate ? new Date(lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  if (!last || today.getTime() === last.getTime()) {
    // Same day, no change
  } else if (today.getTime() - last.getTime() === 86400000) {
    // Consecutive day
    dailyStreak++;
    showMotivationalMessage();
  } else {
    // Missed a day
    dailyStreak = 1;
  }
  lastActiveDate = today;
  streakCounter.textContent = dailyStreak;
  saveState();
}

function showMotivationalMessage() {
  const messages = [
    "Great job keeping the streak alive! 🔥",
    "You're unstoppable! Keep it up! 💪",
    "Another day, another win! 🎉"
  ];
  alert(messages[Math.floor(Math.random() * messages.length)]);
}

function updateCategoryOptions() {
  taskCategoryInput.innerHTML = customCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  taskFilter.innerHTML = `
    <option value="all">All Tasks</option>
    <option value="completed">Completed</option>
    <option value="pending">Pending</option>
    <option value="High">High Priority</option>
    <option value="Medium">Medium Priority</option>
    <option value="Low">Low Priority</option>
    ${customCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("")}
  `;
}

function createTable() {
  tableContainer.innerHTML = "";
  const table = document.createElement("table");
  table.setAttribute("aria-label", "Weekly achievement grid");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const emptyCell = document.createElement("th");
  headerRow.appendChild(emptyCell);

  days.forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (let week = 0; week < weeksCount; week++) {
    const row = document.createElement("tr");
    const weekCell = document.createElement("th");
    weekCell.textContent = `Week ${week + 1}`;
    row.appendChild(weekCell);

    for (let day = 0; day < days.length; day++) {
      const dayNumber = week * 7 + day + 1;
      const td = document.createElement("td");
      td.classList.add("cell");
      td.dataset.dayNumber = dayNumber;
      td.setAttribute("role", "gridcell");
      td.setAttribute("aria-label", `Day ${dayNumber}`);
      td.tabIndex = 0;

      if (achievementMarks.includes(dayNumber)) {
        td.classList.add("marked");
        td.setAttribute("aria-selected", "true");
      } else {
        td.setAttribute("aria-selected", "false");
      }

      td.textContent = dayNumber;

      td.addEventListener("click", () => {
        toggleDayMark(dayNumber);
        markSound.play().catch(() => {});
      });
      td.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleDayMark(dayNumber);
          markSound.play().catch(() => {});
        }
      });

      row.appendChild(td);
    }

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

function toggleDayMark(dayNumber) {
  undoHistory.push([...achievementMarks]);
  undoButton.disabled = false;

  const index = achievementMarks.indexOf(dayNumber);
  if (index >= 0) {
    achievementMarks.splice(index, 1);
  } else {
    achievementMarks.push(dayNumber);
  }
  achievementMarks.sort((a, b) => a - b);

  checkFullMonth();
  updateBadges();
  updateDisplay();
  saveState();
}

function updateDisplay() {
  createTable();
  updateTotalAchievements();
  updateMonthsYears();
  updateBadgesDisplay();
  renderTasks();
  updateStats();
  drawProgressChart();
}

function updateTotalAchievements() {
  totalAchievements.textContent = achievementMarks.length;
}

function updateMonthsYears() {
  let monthsCompleted = Math.floor(achievementMarks.length / daysPerMonth);
  if (monthsCompleted > achievementMonths) {
    achievementMonths = monthsCompleted;
    if (achievementMonths >= 12) {
      achievementYears = Math.floor(achievementMonths / 12);
      achievementMonths = achievementMonths % 12;
    }
  }
  renderMonthsYears();
}

function renderMonthsYears() {
  monthsTable.innerHTML = "";
  const monthsRow = document.createElement("div");
  for (let i = 1; i <= achievementMonths; i++) {
    const span = document.createElement("span");
    span.textContent = "♦️";
    span.style.fontSize = "1.5rem";
    span.style.margin = "0 6px";
    span.setAttribute("aria-label", `Completed month ${i}`);
    monthsRow.appendChild(span);
  }
  monthsTable.appendChild(monthsRow);

  yearsTable.innerHTML = "";
  const yearsRow = document.createElement("div");
  for (let i = 1; i <= achievementYears; i++) {
    const span = document.createElement("span");
    span.textContent = "🔷";
    span.style.fontSize = "1.8rem";
    span.style.margin = "0 8px";
    span.setAttribute("aria-label", `Completed year ${i}`);
    yearsRow.appendChild(span);
  }
  yearsTable.appendChild(yearsRow);
}

function updateBadges() {
  const newBadges = [];
  if (achievementMarks.length >= 10) newBadges.push("10 Days Streak");
  if (achievementMarks.length >= 20) newBadges.push("20 Days Streak");
  if (achievementMonths >= 1) newBadges.push("1 Month Complete");
  if (achievementMonths >= 3) newBadges.push("3 Months Complete");
  if (todoTasks.filter(t => t.completed).length >= 10) newBadges.push("10 Tasks Done");
  if (dailyStreak >= 7) newBadges.push("7-Day Streak");
  if (badges.length !== newBadges.length || !badges.every((b, i) => b === newBadges[i])) {
    badges = newBadges;
    saveState();
  }
}

function updateBadgesDisplay() {
  badgesTable.innerHTML = "";
  badges.forEach(badge => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = badge;
    span.setAttribute("aria-label", `Milestone: ${badge}`);
    badgesTable.appendChild(span);
  });
}

function checkFullMonth() {
  if (achievementMarks.length >= daysPerMonth) {
    const allDays = Array.from({ length: daysPerMonth }, (_, i) => i + 1);
    const allPresent = allDays.every(day => achievementMarks.includes(day));
    if (allPresent) {
      alert("Month completed! Starting a new month...");
      achievementMarks = [];
      achievementMonths++;
      if (achievementMonths >= 12) {
        achievementYears++;
        achievementMonths = 0;
      }
      undoHistory = [];
      updateBadges();
      saveState();
      updateDisplay();
    }
  }
}

function drawProgressChart() {
  const ctx = progressChart.getContext("2d");
  const completed = todoTasks.filter(t => t.completed).length;
  const total = todoTasks.length;
  const data = [completed, total - completed];
  const labels = ["Completed", "Pending"];
  const colors = ["#00c853", "#ff4444"];

  ctx.clearRect(0, 0, progressChart.width, progressChart.height);
  const centerX = progressChart.width / 2;
  const centerY = progressChart.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  let totalValue = data.reduce((a, b) => a + b, 0);
  let startAngle = 0;

  data.forEach((value, i) => {
    const sliceAngle = (value / totalValue) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    startAngle += sliceAngle;

    // Legend
    ctx.fillStyle = colors[i];
    ctx.fillRect(10, 10 + i * 20, 15, 15);
    ctx.fillStyle = document.body.classList.contains("dark-mode") ? "#e0e0e0" : "#333";
    ctx.font = "12px Inter";
    ctx.fillText(labels[i], 30, 20 + i * 20);
  });
}

function clearAll() {
  if (confirm("Are you sure you want to clear all achievements and tasks?")) {
    achievementMarks = [];
    achievementMonths = 0;
    achievementYears = 0;
    undoHistory = [];
    todoTasks = [];
    badges = [];
    dailyStreak = 0;
    saveState();
    updateDisplay();
    undoButton.disabled = true;
  }
}

function undo() {
  if (undoHistory.length > 0) {
    achievementMarks = undoHistory.pop();
    updateBadges();
    updateDisplay();
    saveState();
    undoButton.disabled = undoHistory.length === 0;
  }
}

function exportData() {
  const data = {
    userName: localStorage.getItem(STORAGE_KEYS.NAME),
    achievementMarks,
    achievementMonths,
    achievementYears,
    todoTasks,
    customCategories,
    badges,
    dailyStreak,
    lastActiveDate: lastActiveDate ? lastActiveDate.toISOString() : ""
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "achievement-tracker-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function exportToPdf() {
  const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\definecolor{darkblue}{rgb}{0,0,0.5}
\\begin{document}
\\title{Achievement Tracker Report}
\\author{${localStorage.getItem(STORAGE_KEYS.NAME) || "User"}}
\\date{${new Date().toLocaleDateString()}}
\\maketitle
\\section*{Achievements}
\\begin{itemize}
  \\item Total Days Marked: ${achievementMarks.length}
  \\item Months Completed: ${achievementMonths}
  \\item Years Completed: ${achievementYears}
  \\item Current Streak: ${dailyStreak} days
\\end{itemize}
\\section*{Milestones}
\\begin{itemize}
  ${badges.map(b => `\\item ${b}`).join("\n  ")}
\\end{itemize}
\\section*{Tasks}
\\begin{itemize}
  ${todoTasks.map(t => `\\item ${t.name} (${t.duration} min, ${t.priority}, ${t.completed ? "Completed" : "Pending"})`).join("\n  ")}
\\end{itemize}
\\end{document}
  `;
  const blob = new Blob([latexContent], { type: "text/latex" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "achievement-report.tex";
  a.click();
  URL.revokeObjectURL(url);
  alert("LaTeX file downloaded. Compile with PDFLaTeX to generate PDF.");
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!validateState(data)) throw new Error("Invalid data format");
      if (data.userName) localStorage.setItem(STORAGE_KEYS.NAME, data.userName);
      achievementMarks = data.achievementMarks || [];
      achievementMonths = data.achievementMonths || 0;
      achievementYears = data.achievementYears || 0;
      todoTasks = data.todoTasks || [];
      customCategories = data.customCategories || ["Work", "Personal", "Health", "Other"];
      badges = data.badges || [];
      dailyStreak = data.dailyStreak || 0;
      lastActiveDate = data.lastActiveDate ? new Date(data.lastActiveDate) : null;
      undoHistory = [];
      saveState();
      updateUserName();
      updateCategoryOptions();
      updateDisplay();
      alert("Data imported successfully!");
    } catch (err) {
      alert(`Error importing data: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

function exportToCalendar() {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AchievementTracker//EN",
    ...todoTasks.filter(task => task.reminder).map(task => {
      const start = new Date(task.reminder);
      const end = new Date(start.getTime() + task.duration * 60 * 1000);
      return [
        "BEGIN:VEVENT",
        `SUMMARY:${task.name} (${task.priority})`,
        `DTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DESCRIPTION:${task.notes || "No notes"}`,
        "END:VEVENT"
      ].join("\n");
    }),
    "END:VCALENDAR"
  ].join("\n");

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem(STORAGE_KEYS.THEME, isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  drawProgressChart();
}

function requestNotificationPermission() {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      requestNotifications.disabled = true;
      alert("Notifications enabled!");
      checkReminders();
    } else {
      alert("Notifications permission denied.");
    }
  });
}

function checkReminders() {
  setInterval(() => {
    const now = new Date();
    todoTasks.forEach(task => {
      if (task.reminder && !task.completed) {
        const reminderTime = new Date(task.reminder);
        if (now >= reminderTime && now < new Date(reminderTime.getTime() + 60000)) {
          notifySound.play().catch(() => {});
          new Notification(`Reminder: ${task.name} (${task.priority})`, {
            body: `Start "${task.name}" (${formatDuration(task.duration)})\n${task.notes || "No notes"}`,
            icon: "https://via.placeholder.com/32"
          });
        }
      }
    });
  }, 60000);
}

// ToDo Section
function updateDependencyOptions() {
  taskDependencyInput.innerHTML = `<option value="">No Dependency</option>` +
    todoTasks.filter(t => !t.completed).map((t, i) => `<option value="${i}">${t.name}</option>`).join("");
}

function renderTasks() {
  taskList.innerHTML = "";
  const filter = taskFilter.value;

  let filteredTasks = todoTasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    if (filter === "High" || filter === "Medium" || filter === "Low") return task.priority === filter;
    return task.category === filter;
  });

  filteredTasks.sort((a, b) => {
    const priorities = { High: 3, Medium: 2, Low: 1 };
    return priorities[b.priority] - priorities[a.priority];
  });

  filteredTasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.classList.toggle("completed", task.completed);
    li.draggable = true;
    li.dataset.index = todoTasks.indexOf(task);
    li.setAttribute("aria-label", 
      `Task: ${task.name}, Duration: ${formatDuration(task.duration)}, Priority: ${task.priority}, Category: ${task.category}${task.notes ? `, Notes: ${task.notes}` : ""}${task.dependency !== null ? `, Depends on: ${todoTasks[task.dependency]?.name || "Unknown"}` : ""}${task.completed ? ", Completed" : ""}`);
    li.tabIndex = 0;

    const infoDiv = document.createElement("div");
    infoDiv.className = "task-info";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = task.name;
    const durationSpan = document.createElement("span");
    durationSpan.textContent = formatDuration(task.duration);
    const prioritySpan = document.createElement("span");
    prioritySpan.className = `task-priority ${task.priority.toLowerCase()}`;
    prioritySpan.textContent = task.priority;
    const categorySpan = document.createElement("span");
    categorySpan.className = "task-category";
    categorySpan.textContent = task.category;
    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(durationSpan);
    infoDiv.appendChild(prioritySpan);
    infoDiv.appendChild(categorySpan);
    if (task.notes) {
      const notesSpan = document.createElement("span");
      notesSpan.className = "task-notes";
      notesSpan.textContent = task.notes;
      infoDiv.appendChild(notesSpan);
    }
    if (task.dependency !== null) {
      const depSpan = document.createElement("span");
      depSpan.className = "task-notes";
      depSpan.textContent = `Depends on: ${todoTasks[task.dependency]?.name || "Unknown"}`;
      infoDiv.appendChild(depSpan);
    }
    li.appendChild(infoDiv);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";
    const deleteBtn = document.createElement("button");
    deleteBtn.title = "Delete task";
    deleteBtn.textContent = "❌";
    deleteBtn.setAttribute("aria-label", `Delete task ${task.name}`);
    deleteBtn.addEventListener("click", () => deleteTask(todoTasks.indexOf(task)));
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  });

  startTasksButton.disabled = todoTasks.length === 0;
  pauseTasksButton.disabled = taskTimer === null;
  stopTasksButton.disabled = taskTimer === null;
  updateDependencyOptions();
}

function updateStats() {
  const completed = todoTasks.filter(t => t.completed).length;
  const pending = todoTasks.length - completed;
  const avgDuration = todoTasks.length
    ? Math.round(todoTasks.reduce((sum, t) => sum + t.duration, 0) / todoTasks.length)
    : 0;

  completedTasksDisplay.textContent = completed;
  pendingTasksDisplay.textContent = pending;
  avgTaskDurationDisplay.textContent = formatDuration(avgDuration);
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function addTask(name, duration, reminder, notes, category, priority, dependency) {
  todoTasks.push({ name, duration, reminder, notes, category, priority, dependency, completed: false });
  saveState();
  renderTasks();
}

function deleteTask(index) {
  if (taskTimer !== null && currentTaskIndex === index && !isPaused) {
    alert("Cannot delete task currently running.");
    return;
  }
  if (todoTasks.some(t => t.dependency === index)) {
    alert("Cannot delete task with dependencies.");
    return;
  }
  todoTasks.splice(index, 1);
  todoTasks.forEach(t => {
    if (t.dependency && t.dependency > index) t.dependency--;
    else if (t.dependency === index) t.dependency = null;
  });
  if (currentTaskIndex > index) currentTaskIndex--;
  updateBadges();
  saveState();
  renderTasks();
}

function markTaskCompleted(index) {
  todoTasks[index].completed = true;
  completeSound.play().catch(() => {});
  updateBadges();
  saveState();
  renderTasks();
}

function canStartTask(index) {
  const task = todoTasks[index];
  if (task.dependency === null) return true;
  return todoTasks[task.dependency]?.completed || false;
}

function startNextTask() {
  if (currentTaskIndex >= todoTasks.length) {
    taskTimerDisplay.textContent = "🎉 All tasks completed!";
    progressFill.style.width = "100%";
    progressFill.setAttribute("aria-valuenow", 100);
    startTasksButton.disabled = false;
    pauseTasksButton.disabled = true;
    stopTasksButton.disabled = true;
    currentTaskIndex = 0;
    markToday();
    return;
  }

  const task = todoTasks[currentTaskIndex];
  if (task.completed) {
    currentTaskIndex++;
    startNextTask();
    return;
  }

  if (!canStartTask(currentTaskIndex)) {
    alert(`Cannot start "${task.name}" until dependency "${todoTasks[task.dependency].name}" is completed.`);
    currentTaskIndex++;
    startNextTask();
    return;
  }

  const confirmed = confirm(`Start task "${task.name}" for ${formatDuration(task.duration)}?`);
  if (!confirmed) {
    taskTimerDisplay.textContent = "Task start cancelled.";
    progressFill.style.width = "0%";
    progressFill.setAttribute("aria-valuenow", 0);
    startTasksButton.disabled = false;
    pauseTasksButton.disabled = true;
    stopTasksButton.disabled = true;
    currentTaskIndex = 0;
    return;
  }

  startTasksButton.disabled = true;
  pauseTasksButton.disabled = false;
  stopTasksButton.disabled = false;
  taskTimeLeft = task.duration * 60;
  isPaused = false;
  updateTimerDisplay();

  taskTimer = setInterval(() => {
    if (!isPaused) {
      taskTimeLeft--;
      updateTimerDisplay();
      const progress = ((task.duration * 60 - taskTimeLeft) / (task.duration * 60)) * 100;
      progressFill.style.width = `${progress}%`;
      progressFill.setAttribute("aria-valuenow", Math.round(progress));

      if (taskTimeLeft <= 0) {
        clearInterval(taskTimer);
        taskTimer = null;
        markTaskCompleted(currentTaskIndex);
        currentTaskIndex++;
        startNextTask();
      }
    }
  }, 1000);
}

function pauseTask() {
  isPaused = !isPaused;
  pauseTasksButton.textContent = isPaused ? "▶️ Resume" : "⏸️ Pause";
  pauseTasksButton.setAttribute("aria-label", isPaused ? "Resume tasks" : "Pause tasks");
  taskTimerDisplay.textContent = isPaused ? "⏩ Task paused" : `⏳ Time left for task: ${formatTime(taskTimeLeft)}`;
}

function stopTasks() {
  if (taskTimer) {
    clearInterval(taskTimer);
    taskTimer = null;
    taskTimerDisplay.textContent = "Tasks stopped.";
    progressFill.style.width = "0%";
    progressFill.setAttribute("aria-valuenow", 0);
    startTasksButton.disabled = false;
    pauseTasksButton.disabled = true;
    stopTasksButton.disabled = true;
    currentTaskIndex = 0;
  }
}

function updateTimerDisplay() {
  if (taskTimeLeft <= 0 || isPaused) return;
  const mins = Math.floor(taskTimeLeft / 60);
  const secs = taskTimeLeft % 60;
  taskTimerDisplay.textContent = `⏳ Time left for task: ${mins}:${secs.toString().padStart(2, "0")}`;
}

function markToday() {
  const today = new Date();
  const dayNum = today.getDate();

  if (dayNum > daysPerMonth) {
    alert("Day number out of tracker range, not marking today.");
    return;
  }
  if (!achievementMarks.includes(dayNum)) {
    achievementMarks.push(dayNum);
    achievementMarks.sort((a, b) => a - b);
    checkFullMonth();
    updateBadges();
    updateDisplay();
    saveState();
    alert("Day marked complete!");
  }
}

function handleDragStart(e) {
  dragStartIndex = +e.target.dataset.index;
  e.target.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const dragEndIndex = +e.target.closest("li").dataset.index;
  if (dragStartIndex !== dragEndIndex) {
    const [draggedTask] = todoTasks.splice(dragStartIndex, 1);
    todoTasks.splice(dragEndIndex, 0, draggedTask);
    todoTasks.forEach(t => {
      if (t.dependency === dragStartIndex) t.dependency = dragEndIndex;
      else if (t.dependency > dragStartIndex && t.dependency <= dragEndIndex) t.dependency--;
      else if (t.dependency < dragStartIndex && t.dependency >= dragEndIndex) t.dependency++;
    });
    if (currentTaskIndex === dragStartIndex) {
      currentTaskIndex = dragEndIndex;
    } else if (dragStartIndex < currentTaskIndex && dragEndIndex >= currentTaskIndex) {
      currentTaskIndex--;
    } else if (dragStartIndex > currentTaskIndex && dragEndIndex <= currentTaskIndex) {
      currentTaskIndex++;
    }
    saveState();
    renderTasks();
  }
  e.target.classList.remove("dragging");
}

function handleKeyboardNavigation(e) {
  const focusable = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  const currentIndex = focusable.indexOf(document.activeElement);
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    const nextIndex = (currentIndex + 1) % focusable.length;
    focusable[nextIndex].focus();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
    focusable[prevIndex].focus();
  } else if (e.key === "t" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    toggleTheme();
  } else if (e.key === "u" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    undo();
  } else if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    openSettings.click();
  }
}

// Settings Modal
function renderCustomCategories() {
  customCategoriesList.innerHTML = "";
  customCategories.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", `Delete category ${cat}`);
    deleteBtn.onclick = () => {
      if (todoTasks.some(t => t.category === cat)) {
        alert("Cannot delete category in use.");
        return;
      }
      customCategories = customCategories.filter(c => c !== cat);
      saveState();
      updateCategoryOptions();
      renderCustomCategories();
    };
    li.appendChild(deleteBtn);
    customCategoriesList.appendChild(li);
  });
}

// Event Listeners
clearButton.addEventListener("click", clearAll);
undoButton.addEventListener("click", undo);
exportButton.addEventListener("click", exportData);
exportPdfButton.addEventListener("click", exportToPdf);
importInput.addEventListener("change", importData);
backupRestore.addEventListener("change", (e) => restoreBackup(+e.target.value));
themeToggle.addEventListener("click", toggleTheme);
requestNotifications.addEventListener("click", requestNotificationPermission);
openSettings.addEventListener("click", () => {
  settingsModal.style.display = "flex";
  settingsModal.setAttribute("aria-hidden", "false");
  newCategoryInput.focus();
  renderCustomCategories();
});
closeModal.addEventListener("click", () => {
  settingsModal.style.display = "none";
  settingsModal.setAttribute("aria-hidden", "true");
});
settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cat = newCategoryInput.value.trim();
  if (!cat || customCategories.includes(cat)) {
    alert("Invalid or duplicate category name.");
    return;
  }
  customCategories.push(cat);
  saveState();
  updateCategoryOptions();
  renderCustomCategories();
  newCategoryInput.value = "";
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = taskNameInput.value.trim();
  const duration = parseInt(taskDurationInput.value);
  const reminder = taskReminderInput.value ? new Date(taskReminderInput.value).toISOString() : null;
  const notes = taskNotesInput.value.trim();
  const category = taskCategoryInput.value;
  const priority = taskPriorityInput.value;
  const dependency = taskDependencyInput.value ? parseInt(taskDependencyInput.value) : null;

  if (!name || isNaN(duration) || duration <= 0) {
    alert("Please enter valid task name and duration.");
    return;
  }

  addTask(name, duration, reminder, notes, category, priority, dependency);
  taskNameInput.value = "";
  taskDurationInput.value = "";
  taskReminderInput.value = "";
  taskNotesInput.value = "";
  taskCategoryInput.value = "Work";
  taskPriorityInput.value = "Medium";
  taskDependencyInput.value = "";
});

startTasksButton.addEventListener("click", () => {
  currentTaskIndex = 0;
  startNextTask();
});

pauseTasksButton.addEventListener("click", pauseTask);
stopTasksButton.addEventListener("click", stopTasks);
exportCalendarButton.addEventListener("click", exportToCalendar);
loadTemplate.addEventListener("click", () => {
  const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
  taskNameInput.value = template.name;
  taskDurationInput.value = template.duration;
  taskCategoryInput.value = template.category;
  taskPriorityInput.value = template.priority;
  taskNotesInput.value = template.notes || "";
});

taskList.addEventListener("dragstart", handleDragStart);
taskList.addEventListener("dragover", handleDragOver);
taskList.addEventListener("drop", handleDrop);
taskList.addEventListener("dragend", (e) => e.target.classList.remove("dragging"));
taskFilter.addEventListener("change", renderTasks);
document.addEventListener("keydown", handleKeyboardNavigation);

// Init
updateUserName();
loadState();
updateDisplay();
undoButton.disabled = undoHistory.length === 0;
if (Notification.permission === "granted") {
  requestNotifications.disabled = true;
  checkReminders();
}

// Auto-save backup every 5 minutes
setInterval(saveBackup, 5 * 60 * 1000);

// Register Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(err => {
    console.error("Service Worker registration failed:", err);
  });
}