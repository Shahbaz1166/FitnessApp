// ============================================================
// APP.JS
// The main entry point. Wires together auth, state, calculator,
// workout/diet, dashboard and chatbot, and controls which
// screen/page is visible at any time.
// ============================================================

import { initAuth } from "./auth.js";
import {
  fitnessData, setCurrentUser, loadData, saveData, resetData, rolloverIfNewDay
} from "./state.js";
import { calculateBMI, bmiCategory, renderBmiScreen, initCaloriesForm } from "./calculator.js";
import {
  initWorkoutDietSetup, renderWorkoutDietScreen,
  renderWorkoutPage, initWorkoutPage, renderDietPage
} from "./workout.js";
import {
  renderDashboard, renderHabitsPage, initWaterTracker,
  renderProgressPage, onDailyTargetChanged
} from "./dashboard.js";
import { initChatbot } from "./chatbot.js";

// ---------------------------------------------------------
// Simple toast helper
// ---------------------------------------------------------
function showToast(message) {
  const toastEl = document.getElementById("appToast");
  document.getElementById("appToastBody").textContent = message;
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2200 });
  toast.show();
}

// ---------------------------------------------------------
// Top-level screen navigation (splash, welcome, auth, setup, app)
// ---------------------------------------------------------
function showScreen(screenId) {
  document.querySelectorAll(".app-screen").forEach(s => s.classList.add("d-none"));
  document.getElementById(screenId).classList.remove("d-none");
  window.scrollTo(0, 0);
}

// ---------------------------------------------------------
// App-shell page navigation (dashboard, workout, diet, ...)
// ---------------------------------------------------------
function showAppPage(page) {
  document.querySelectorAll(".app-page").forEach(p => p.classList.add("d-none"));
  document.getElementById("page-" + page).classList.remove("d-none");

  document.querySelectorAll(".nav-link-app").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  if (page === "dashboard") renderDashboard();
  if (page === "workout") renderWorkoutPage();
  if (page === "diet") renderDietPage();
  if (page === "habits") renderHabitsPage();
  if (page === "progress") renderProgressPage();
  if (page === "profile") renderProfileView();
}

function initAppNavigation() {
  document.querySelectorAll(".nav-link-app").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showAppPage(link.dataset.page);
    });
  });
}

function enterApp() {
  rolloverIfNewDay();
  saveData();
  showScreen("screen-app");
  showAppPage("dashboard");
}

function refreshDashboard() {
  // only re-render if the dashboard page is currently visible
  if (!document.getElementById("page-dashboard").classList.contains("d-none")) {
    renderDashboard();
  }
}

// Exposed so calculator.js / workout.js / dashboard.js can call back
// into app.js without creating circular imports.
window.APP_NAV = { showScreen, enterApp, renderWorkoutDietScreen, refreshDashboard, onDailyTargetChanged };

// ---------------------------------------------------------
// Decide which screen to resume on, based on how much of
// setup the current user has completed.
// ---------------------------------------------------------
function resumeFlow() {
  const p = fitnessData.profile;
  if (!p.age || !p.gender || !p.height || !p.weight) {
    showScreen("screen-profile-setup");
  } else if (!fitnessData.goal) {
    showScreen("screen-goal");
  } else if (!fitnessData.bmi) {
    renderBmiScreen();
    showScreen("screen-bmi");
  } else if (!fitnessData.calories) {
    showScreen("screen-calories");
  } else if (!fitnessData.workout.level) {
    renderWorkoutDietScreen();
    showScreen("screen-workout-diet");
  } else {
    enterApp();
  }
}

// ---------------------------------------------------------
// Profile setup screen
// ---------------------------------------------------------
function initProfileSetupForm() {
  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const age = parseInt(document.getElementById("profile-age").value, 10);
    const gender = document.getElementById("profile-gender").value;
    const height = parseFloat(document.getElementById("profile-height").value);
    const weight = parseFloat(document.getElementById("profile-weight").value);

    const alertBox = document.getElementById("profile-alert");
    if (!age || age < 10 || age > 100 || !gender || !height || !weight) {
      alertBox.textContent = "Please fill in every field with a valid value.";
      alertBox.classList.remove("d-none");
      return;
    }
    alertBox.classList.add("d-none");

    fitnessData.profile.age = age;
    fitnessData.profile.gender = gender;
    fitnessData.profile.height = height;
    fitnessData.profile.weight = weight;
    saveData();

    showScreen("screen-goal");
  });
}

// ---------------------------------------------------------
// Fitness goal screen
// ---------------------------------------------------------
function initGoalScreen() {
  const grid = document.getElementById("goal-grid");
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".goal-card");
    if (!card) return;
    grid.querySelectorAll(".goal-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    document.getElementById("goal-alert").classList.add("d-none");
  });

  document.getElementById("goal-continue-btn").addEventListener("click", () => {
    const selected = grid.querySelector(".goal-card.selected");
    const alertBox = document.getElementById("goal-alert");
    if (!selected) {
      alertBox.textContent = "Please select a fitness goal to continue.";
      alertBox.classList.remove("d-none");
      return;
    }
    fitnessData.goal = selected.dataset.goal;
    saveData();
    renderBmiScreen();
    showScreen("screen-bmi");
  });
}

// ---------------------------------------------------------
// BMI screen -> Calories screen
// ---------------------------------------------------------
function initBmiScreen() {
  document.getElementById("bmi-continue-btn").addEventListener("click", () => {
    showScreen("screen-calories");
  });
}

// ---------------------------------------------------------
// Profile page: view / edit / change goal / reset
// ---------------------------------------------------------
function renderProfileView() {
  const p = fitnessData.profile;
  document.getElementById("pv-name").textContent = p.name || "--";
  document.getElementById("pv-email").textContent = p.email || "--";
  document.getElementById("pv-age").textContent = p.age || "--";
  document.getElementById("pv-gender").textContent = p.gender ? (p.gender[0].toUpperCase() + p.gender.slice(1)) : "--";
  document.getElementById("pv-height").textContent = p.height ? `${p.height} cm` : "--";
  document.getElementById("pv-weight").textContent = p.weight ? `${p.weight} kg` : "--";
  document.getElementById("pv-goal").textContent = fitnessData.goal || "--";
  document.getElementById("pv-bmi").textContent = fitnessData.bmi
    ? `${fitnessData.bmi} (${fitnessData.bmiCategory})` : "--";
  document.getElementById("pv-calories").textContent = fitnessData.calories
    ? `${fitnessData.calories} kcal/day` : "--";
}

function showProfileView() {
  document.getElementById("profile-view").classList.remove("d-none");
  document.getElementById("profile-edit-box").classList.add("d-none");
  document.getElementById("profile-goal-box").classList.add("d-none");
}

function initProfilePage() {
  document.getElementById("edit-profile-btn").addEventListener("click", () => {
    const p = fitnessData.profile;
    document.getElementById("edit-age").value = p.age;
    document.getElementById("edit-gender").value = p.gender;
    document.getElementById("edit-height").value = p.height;
    document.getElementById("edit-weight").value = p.weight;
    document.getElementById("profile-view").classList.add("d-none");
    document.getElementById("profile-edit-box").classList.remove("d-none");
  });
  document.getElementById("cancel-edit-profile").addEventListener("click", showProfileView);

  document.getElementById("edit-profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const age = parseInt(document.getElementById("edit-age").value, 10);
    const gender = document.getElementById("edit-gender").value;
    const height = parseFloat(document.getElementById("edit-height").value);
    const weight = parseFloat(document.getElementById("edit-weight").value);
    if (!age || !gender || !height || !weight) return;

    fitnessData.profile.age = age;
    fitnessData.profile.gender = gender;
    fitnessData.profile.height = height;
    fitnessData.profile.weight = weight;

    // recalculate BMI
    fitnessData.bmi = calculateBMI(weight, height);
    fitnessData.bmiCategory = bmiCategory(fitnessData.bmi);

    // recalculate calories if we know the previously chosen activity level
    if (fitnessData.activityMultiplier) {
      const bmr = gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
      fitnessData.calories = Math.round(bmr * fitnessData.activityMultiplier);
    }

    saveData();
    showProfileView();
    renderProfileView();
    showToast("Profile updated.");
  });

  document.getElementById("change-goal-btn").addEventListener("click", () => {
    const box = document.getElementById("profile-goal-box");
    box.querySelectorAll(".goal-card").forEach(c => {
      c.classList.toggle("selected", c.dataset.goal === fitnessData.goal);
    });
    document.getElementById("profile-view").classList.add("d-none");
    box.classList.remove("d-none");
  });
  document.getElementById("cancel-change-goal").addEventListener("click", showProfileView);

  document.getElementById("profile-goal-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".goal-card");
    if (!card) return;
    fitnessData.goal = card.dataset.goal;
    saveData();
    showProfileView();
    renderProfileView();
    showToast("Goal updated.");
  });

  document.getElementById("reset-data-btn").addEventListener("click", () => {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("resetModal"));
    modal.show();
  });
  document.getElementById("confirm-reset-btn").addEventListener("click", () => {
    resetData();
    bootstrap.Modal.getInstance(document.getElementById("resetModal")).hide();
    showToast("Fitness data has been reset.");
    resumeFlow();
  });
}

// ---------------------------------------------------------
// Welcome screen buttons + auth screen switch links
// ---------------------------------------------------------
function initWelcomeAndSwitchLinks() {
  document.getElementById("welcome-login-btn").addEventListener("click", () => showScreen("screen-login"));
  document.getElementById("welcome-signup-btn").addEventListener("click", () => showScreen("screen-signup"));
  document.getElementById("link-to-login").addEventListener("click", (e) => { e.preventDefault(); showScreen("screen-login"); });
  document.getElementById("link-to-signup").addEventListener("click", (e) => { e.preventDefault(); showScreen("screen-signup"); });
}

// ---------------------------------------------------------
// Boot the app
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initWelcomeAndSwitchLinks();
  initProfileSetupForm();
  initGoalScreen();
  initBmiScreen();
  initCaloriesForm();
  initWorkoutDietSetup();
  initAppNavigation();
  initWorkoutPage();
  initWaterTracker();
  initChatbot();
  initProfilePage();

  initAuth({
    onLoggedIn: (user) => {
      setCurrentUser(user);
      loadData(user.uid);

      // fill in name/email from the Firebase account the first time
      if (!fitnessData.profile.name) fitnessData.profile.name = user.displayName || "";
      fitnessData.profile.email = user.email || "";
      saveData();

      resumeFlow();
    },
    onLoggedOut: () => {
      setCurrentUser(null);
      showScreen("screen-welcome");
    }
  });

  // Splash screen: show briefly, then let the auth listener above
  // decide whether to land on Welcome or resume a logged-in session.
  // (If onLoggedIn/onLoggedOut already fired and switched screens by
  // then, this is a harmless no-op — every other screen is hidden.)
  setTimeout(() => {
    document.getElementById("screen-splash").classList.add("d-none");
    const anyVisible = document.querySelectorAll(".app-screen:not(.d-none)").length > 0;
    if (!anyVisible) {
      showScreen("screen-welcome");
    }
  }, 1400);
});
