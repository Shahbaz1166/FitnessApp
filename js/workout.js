// ============================================================
// WORKOUT.JS
// Predefined workout plans (by level) and diet plans, plus the
// functions that render them onto the screen.
// ============================================================

import { fitnessData, saveData } from "./state.js";

// ---- Predefined workout plans (JS objects/arrays) ----
export const WORKOUT_PLANS = {
  Beginner: [
    { name: "Walking", sets: "1", reps: "15 minutes", note: "Keep a comfortable, steady pace." },
    { name: "Bodyweight Squats", sets: "3", reps: "10 reps", note: "Keep your back straight." },
    { name: "Wall Push-ups", sets: "3", reps: "10 reps", note: "Stand arm's length from the wall." },
    { name: "Plank", sets: "3", reps: "20 seconds", note: "Keep your body in a straight line." },
    { name: "Stretching", sets: "1", reps: "5 minutes", note: "Stretch major muscle groups gently." }
  ],
  Intermediate: [
    { name: "Push-ups", sets: "3", reps: "12 reps", note: "Keep your core tight." },
    { name: "Squats", sets: "4", reps: "15 reps", note: "Go down until thighs are parallel to floor." },
    { name: "Lunges", sets: "3", reps: "12 reps/leg", note: "Keep knee behind your toes." },
    { name: "Plank", sets: "3", reps: "40 seconds", note: "Engage your abs throughout." },
    { name: "Mountain Climbers", sets: "3", reps: "30 seconds", note: "Keep hips low and steady." }
  ],
  Advanced: [
    { name: "Burpees", sets: "4", reps: "12 reps", note: "Move with control, not just speed." },
    { name: "Push-ups", sets: "4", reps: "20 reps", note: "Full range of motion each rep." },
    { name: "Jump Squats", sets: "4", reps: "15 reps", note: "Land softly to protect your knees." },
    { name: "Lunges", sets: "4", reps: "15 reps/leg", note: "Add a jump between legs if comfortable." },
    { name: "Plank", sets: "3", reps: "60 seconds", note: "Keep breathing steadily." },
    { name: "Mountain Climbers", sets: "4", reps: "45 seconds", note: "Keep a fast, controlled pace." }
  ]
};

// ---- Predefined diet plan (JS object) ----
export const DIET_PLAN = {
  breakfast: ["Eggs", "Oatmeal", "Fruit"],
  lunch: ["Chicken", "Rice", "Vegetables"],
  snack: ["Fruit", "Yogurt"],
  dinner: ["Grilled chicken or fish", "Vegetables", "Salad"]
};

const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" };

// Builds the HTML for a list of exercises
function exerciseListHtml(exercises) {
  return exercises.map(ex => `
    <div class="exercise-item">
      <div>
        <div class="ex-name">${ex.name}</div>
        <div class="ex-note">${ex.note}</div>
      </div>
      <div class="ex-detail">${ex.sets} x ${ex.reps}</div>
    </div>
  `).join("");
}

// Builds the HTML for the diet plan cards
function dietGridHtml(diet) {
  return Object.keys(diet).map(mealKey => `
    <div class="diet-card">
      <div class="meal-name">${MEAL_LABELS[mealKey]}</div>
      <ul>${diet[mealKey].map(item => `<li>${item}</li>`).join("")}</ul>
    </div>
  `).join("");
}

// ---- Setup screen: pick a level, preview workout + diet ----
export function initWorkoutDietSetup() {
  const levelGrid = document.getElementById("level-grid");
  const preview = document.getElementById("workout-preview");
  const alertBox = document.getElementById("plan-alert");
  const continueBtn = document.getElementById("plan-continue-btn");

  levelGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".goal-card");
    if (!card) return;
    levelGrid.querySelectorAll(".goal-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    const level = card.dataset.level;
    document.getElementById("workout-preview-list").innerHTML = exerciseListHtml(WORKOUT_PLANS[level]);
    document.getElementById("diet-preview-list").innerHTML = dietGridHtml(DIET_PLAN);
    preview.classList.remove("d-none");
    alertBox.classList.add("d-none");

    continueBtn.dataset.selectedLevel = level;
  });

  continueBtn.addEventListener("click", () => {
    const level = continueBtn.dataset.selectedLevel;
    if (!level) {
      alertBox.textContent = "Please choose a workout level to continue.";
      alertBox.classList.remove("d-none");
      return;
    }
    fitnessData.workout.level = level;
    fitnessData.workout.plan = WORKOUT_PLANS[level];
    fitnessData.workout.completedToday = false;
    fitnessData.diet.plan = DIET_PLAN;
    saveData();

    window.APP_NAV.enterApp();
  });
}

// Re-renders the setup screen in case the user navigates back to it
export function renderWorkoutDietScreen() {
  const levelGrid = document.getElementById("level-grid");
  levelGrid.querySelectorAll(".goal-card").forEach(c => c.classList.remove("selected"));
  document.getElementById("workout-preview").classList.add("d-none");
  document.getElementById("plan-alert").classList.add("d-none");
  document.getElementById("plan-continue-btn").removeAttribute("data-selected-level");
}

// ---- Workout page inside the app shell ----
export function renderWorkoutPage() {
  const level = fitnessData.workout.level;
  const plan = fitnessData.workout.plan || [];
  document.getElementById("workout-level-label").textContent = level || "--";

  const list = document.getElementById("workout-list");
  const empty = document.getElementById("workout-empty");
  const btn = document.getElementById("complete-workout-btn");
  const note = document.getElementById("workout-completed-note");

  if (!plan.length) {
    list.innerHTML = "";
    empty.classList.remove("d-none");
    btn.classList.add("d-none");
    return;
  }
  empty.classList.add("d-none");
  btn.classList.remove("d-none");
  list.innerHTML = exerciseListHtml(plan);

  if (fitnessData.workout.completedToday) {
    btn.innerHTML = `<i class="bi bi-check-circle-fill"></i> Workout Completed Today`;
    btn.disabled = true;
    note.textContent = "Nice work — see you again tomorrow!";
  } else {
    btn.innerHTML = `<i class="bi bi-check-circle"></i> Mark Workout as Completed`;
    btn.disabled = false;
    note.textContent = "";
  }
}

export function initWorkoutPage() {
  document.getElementById("complete-workout-btn").addEventListener("click", () => {
    fitnessData.workout.completedToday = true;
    saveData();
    window.APP_NAV.onDailyTargetChanged();
    renderWorkoutPage();
    window.APP_NAV.refreshDashboard();
  });
}

// ---- Diet page inside the app shell ----
export function renderDietPage() {
  const diet = fitnessData.diet.plan || DIET_PLAN;
  document.getElementById("diet-list").innerHTML = dietGridHtml(diet);

  const trackerList = document.getElementById("meal-tracker-list");
  trackerList.innerHTML = Object.keys(MEAL_LABELS).map(mealKey => {
    const checked = fitnessData.daily.meals[mealKey];
    return `
      <div class="meal-track-item ${checked ? "checked" : ""}">
        <label class="d-flex align-items-center gap-2 mb-0" style="cursor:pointer;">
          <input type="checkbox" class="form-check-input meal-checkbox" data-meal="${mealKey}" ${checked ? "checked" : ""}>
          <span>${checked ? "✓" : "○"} ${MEAL_LABELS[mealKey]}</span>
        </label>
      </div>
    `;
  }).join("");

  trackerList.querySelectorAll(".meal-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      const meal = cb.dataset.meal;
      fitnessData.daily.meals[meal] = cb.checked;
      saveData();
      window.APP_NAV.onDailyTargetChanged();
      renderDietPage();
      window.APP_NAV.refreshDashboard();
    });
  });
}
