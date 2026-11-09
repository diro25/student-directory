// ---------- Config ----------
const DEPARTMENTS = [
  "Software", "school of elec.", "Mechanical", "Civil",
  "CSE", "ECE", "POWER", "Water Resources engineering", "material engineering."
];
const YEAR_NAMES = {
  1: "Freshman",
  2: "Sophomore",
  3: "Junior",
  4: "Senior",
  5: "Alumni",
};

const STORAGE_KEY = "student-directory:v1";
const THEME_KEY = "student-directory:theme";

// ---------- State ----------
let students = load() ?? [
  { id: 1, name: "diriba", department: "CSE", year: 3 },
  { id: 2, name: "Nagasa",   department: "sOFTWARE ENGINEERING",      year: 5 },
  { id: 3, name: "Abel",   department: "school of elec.",        year: 2 },
];
let activeFilter = "All";

// ---------- DOM ----------
const form = document.getElementById("student-form");
const nameInput = document.getElementById("name");
const deptSelect = document.getElementById("department");
const yearSelect = document.getElementById("year");
const filtersEl = document.getElementById("filters");
const listEl = document.getElementById("student-list");
const countEl = document.getElementById("count");
const themeBtn = document.getElementById("theme-toggle");

// ---------- Helpers ----------
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); } catch {}
}
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Render ----------
function renderDepartmentOptions() {
  deptSelect.innerHTML = DEPARTMENTS
    .map(d => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`)
    .join("");
}

function renderFilters() {
  filtersEl.innerHTML = ["All", ...DEPARTMENTS]
    .map(d => `
      <button type="button" class="chip ${d === activeFilter ? "chip--active" : ""}"
              data-dept="${escapeHTML(d)}">${escapeHTML(d)}</button>`)
    .join("");
}

function renderStudents() {
  // .filter() by department
  const visible = students.filter(
    s => activeFilter === "All" || s.department === activeFilter
  );

  // .map() into cards (destructuring + ternary badge)
  listEl.innerHTML = visible.length
    ? visible.map(({ id, name, department, year }) => {
        const isFinalStage = year >= 4;      // senior or alumni
        const badge = YEAR_NAMES[year];
        return `
          <li class="card">
            <div class="card__avatar">${escapeHTML(name[0].toUpperCase())}</div>
            <div class="card__info">
              <div class="card__name">${escapeHTML(name)}</div>
              <div class="card__meta">${escapeHTML(department)} · Y${year}</div>
            </div>
            <span class="badge ${isFinalStage ? "" : "badge--junior"}">${badge}</span>
            <button class="card__remove" data-id="${id}" aria-label="Remove ${escapeHTML(name)}">✕</button>
          </li>`;
      }).join("")
    : `<li class="empty">No students here yet. Add one above.</li>`;

  countEl.textContent = `Showing ${visible.length} of ${students.length} students`;
}

function render() {
  renderFilters();
  renderStudents();
}

// ---------- Events ----------
form.addEventListener("submit", e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  students.push({
    id: Date.now(),
    name,
    department: deptSelect.value,
    year: Number(yearSelect.value),
  });
  save();
  form.reset();
  nameInput.focus();
  render();
});

filtersEl.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  activeFilter = chip.dataset.dept;
  render();
});

listEl.addEventListener("click", e => {
  const btn = e.target.closest(".card__remove");
  if (!btn) return;
  students = students.filter(s => s.id !== Number(btn.dataset.id));
  save();
  render();
});

// ---------- Dark mode ----------
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  // button offers the opposite mode
  themeBtn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
themeBtn.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

// ---------- Init ----------
let savedTheme = "dark";
try { savedTheme = localStorage.getItem(THEME_KEY) || "dark"; } catch {}
applyTheme(savedTheme);
renderDepartmentOptions();
render();