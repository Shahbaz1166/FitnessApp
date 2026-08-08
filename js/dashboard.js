// ============================================================
// DASHBOARD.JS
// Dashboard summary, habit tracker, water tracker, streak
// system and the progress page.
// ============================================================

import { fitnessData, saveData, todayStr, updateTodayProgressEntry } from "./state.js";

const HABIT_LABELS = {
  water: "Drink enough water",
  workout: "Complete workout",
  healthyFood: "Eat healthy food",
  sleep: "Sleep well"
};

function dateMinusDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ---- Streak system ----
// "Today's target" = the workout being marked completed for the day.
// Called any time a tracked action changes (workout completed, meal
// checked, water changed) so progress[] and the streak stay current.
export function onDailyTargetChanged() {
  updateTodayProgressEntry();

  if (fitnessData.workout.completedToday) {
    const today = todayStr();
    const streak = fitnessData.streak;

    if (streak.lastCompletedDate === today) {
      // already counted today — do not increase again
    } else {
      const yesterday = dateMinusDays(today, 1);
      if (streak.lastCompletedDate === yesterday) {
        streak.current += 1;
      } else {
        streak.current = 1;
      }
      streak.lastCompletedDate = today;
    }
  }
  saveData();
}

// ---- Dashboard page ----
export function renderDashboard() {
  const name = fitnessData.profile.name || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById("dashboard-welcome").textContent = `${greeting}, ${name} 👋`;
  document.getElementById("dashboard-date").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // streak ring
  const streak = fitnessData.streak.current || 0;
  const pct = Math.min(streak, 30) / 30 * 360; // ring fills up to a 30-day view
  document.getElementById("streak-ring").style.background =
    `conic-gradient(var(--warm) ${pct}deg, var(--border) 0deg)`;
  document.getElementById("streak-ring-value").textContent = streak;

  document.getElementById("dash-water").textContent = fitnessData.daily.water;
  document.getElementById("dash-water-goal").textContent = fitnessData.daily.waterGoal;

  const mealsCompleted = Object.values(fitnessData.daily.meals).filter(Boolean).length;
  document.getElementById("dash-meals").textContent = mealsCompleted;

  document.getElementById("dash-workout-status").textContent =
    fitnessData.workout.completedToday ? "Completed" : "Pending";

  document.getElementById("dash-bmi").textContent = fitnessData.bmi || "--";
  document.getElementById("dash-bmi-cat").textContent = fitnessData.bmiCategory || "—";
  document.getElementById("dash-calories").textContent = fitnessData.calories || "--";
  document.getElementById("dash-goal").textContent = fitnessData.goal || "--";

  // mini habit list
  const miniList = document.getElementById("dashboard-habits-mini");
  miniList.innerHTML = Object.keys(HABIT_LABELS).map(key => {
    const done = fitnessData.daily.habits[key];
    return `<div class="habit-mini ${done ? "done" : ""}">
      <i class="bi ${done ? "bi-check-circle-fill" : "bi-circle"}"></i> ${HABIT_LABELS[key]}
    </div>`;
  }).join("");
}

// ---- Habits + Water page ----
export function renderHabitsPage() {
  const list = document.getElementById("habits-list");
  list.innerHTML = Object.keys(HABIT_LABELS).map(key => {
    const checked = fitnessData.daily.habits[key];
    return `
      <div class="habit-item">
        <input type="checkbox" class="form-check-input habit-checkbox" id="habit-${key}" data-habit="${key}" ${checked ? "checked" : ""}>
        <label for="habit-${key}">${HABIT_LABELS[key]}</label>
      </div>
    `;
  }).join("");

  list.querySelectorAll(".habit-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      fitnessData.daily.habits[cb.dataset.habit] = cb.checked;
      saveData();
      renderDashboard();
    });
  });

  renderWaterTracker();
}

function renderWaterTracker() {
  const water = fitnessData.daily.water;
  const goal = fitnessData.daily.waterGoal;
  document.getElementById("water-count").textContent = water;
  document.getElementById("water-goal-display").textContent = goal;
  const pct = Math.min(100, Math.round((water / goal) * 100));
  document.getElementById("water-progress-bar").style.width = pct + "%";
}

export function initWaterTracker() {
  document.getElementById("water-plus").addEventListener("click", () => {
    const maxAllowed = fitnessData.daily.waterGoal + 4; // allow a little extra intake
    if (fitnessData.daily.water < maxAllowed) {
      fitnessData.daily.water += 1;
      saveData();
      onDailyTargetChanged();
      renderWaterTracker();
      renderDashboard();
    }
  });
  document.getElementById("water-minus").addEventListener("click", () => {
    if (fitnessData.daily.water > 0) {
      fitnessData.daily.water -= 1;
      saveData();
      onDailyTargetChanged();
      renderWaterTracker();
      renderDashboard();
    }
  });
}

// ---- Progress page ----
export function renderProgressPage() {
  document.getElementById("progress-weight").textContent = fitnessData.profile.weight || "--";
  document.getElementById("progress-streak").textContent = fitnessData.streak.current || 0;

  const totalWorkouts = fitnessData.progress.filter(p => p.workoutDone).length +
    (fitnessData.workout.completedToday ? 1 : 0);
  document.getElementById("progress-workouts").textContent = totalWorkouts;

  const last7 = getLast7DaysData();
  const avgWater = last7.length
    ? Math.round(last7.reduce((sum, d) => sum + d.water, 0) / last7.length * 10) / 10
    : 0;
  document.getElementById("progress-avg-water").textContent = avgWater;

  const chart = document.getElementById("progress-chart");
  const emptyState = document.getElementById("progress-empty");
  if (!last7.some(d => d.hasData)) {
    chart.innerHTML = "";
    emptyState.classList.remove("d-none");
  } else {
    emptyState.classList.add("d-none");
    const maxWater = Math.max(1, ...last7.map(d => d.water));
    chart.innerHTML = last7.map(d => {
      const heightPct = Math.max(4, Math.round((d.water / maxWater) * 100));
      const label = new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
      return `
        <div class="pc-bar-wrap">
          <div class="pc-bar" style="height:${heightPct}%"></div>
          <div class="pc-label">${label}</div>
        </div>
      `;
    }).join("");
  }

  const totalMeals = last7.reduce((sum, d) => sum + d.mealsCompleted, 0);
  document.getElementById("progress-meals-summary").textContent =
    last7.some(d => d.hasData)
      ? `${totalMeals} meals completed across the last 7 days.`
      : "No meals completed yet.";
}

// Builds an array of the last 7 days (oldest to newest) using
// fitnessData.progress plus today's live daily data.
function getLast7DaysData() {
  const today = todayStr();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = dateMinusDays(today, i);
    if (date === today) {
      const mealsCompleted = Object.values(fitnessData.daily.meals).filter(Boolean).length;
      days.push({
        date,
        water: fitnessData.daily.water,
        mealsCompleted,
        workoutDone: fitnessData.workout.completedToday,
        hasData: fitnessData.daily.water > 0 || mealsCompleted > 0 || fitnessData.workout.completedToday
      });
    } else {
      const entry = fitnessData.progress.find(p => p.date === date);
      days.push({
        date,
        water: entry ? entry.water : 0,
        mealsCompleted: entry ? entry.mealsCompleted : 0,
        workoutDone: entry ? entry.workoutDone : false,
        hasData: !!entry
      });
    }
  }
  return days;
}
