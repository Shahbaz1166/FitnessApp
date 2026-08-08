// ============================================================
// STATE.JS
// Holds the in-memory fitness data object and the functions
// used to load/save it to localStorage. Firebase only ever
// stores the account (email/password) - everything about the
// fitness app itself lives here, in localStorage.
// ============================================================

// The current signed-in Firebase user (set by auth.js)
export let currentUser = null;
export function setCurrentUser(user) {
  currentUser = user;
}

// The in-memory copy of the fitness data for the current user
export let fitnessData = null;

// Returns a fresh, empty data object matching our data model
function blankData() {
  return {
    profile: {
      name: "",
      email: "",
      age: 0,
      gender: "",
      height: 0,
      weight: 0
    },
    goal: "",
    bmi: 0,
    bmiCategory: "",
    calories: 0,
    activityMultiplier: null,
    workout: {
      level: "",
      plan: [],
      completedToday: false
    },
    diet: {
      plan: null
    },
    daily: {
      date: todayStr(),
      water: 0,
      waterGoal: 8,
      meals: { breakfast: false, lunch: false, snack: false, dinner: false },
      habits: { water: false, workout: false, healthyFood: false, sleep: false }
    },
    streak: {
      current: 0,
      lastCompletedDate: null
    },
    // progress[] holds one entry per day that had any activity
    // { date, water, mealsCompleted, workoutDone, weight }
    progress: []
  };
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}
export { todayStr };

function storageKey(uid) {
  return `fitnessData_${uid}`;
}

// Loads this user's data from localStorage into `fitnessData`.
// Creates a fresh blank object the first time a user logs in.
export function loadData(uid) {
  const raw = localStorage.getItem(storageKey(uid));
  if (raw) {
    fitnessData = JSON.parse(raw);
  } else {
    fitnessData = blankData();
  }
  rolloverIfNewDay();
  return fitnessData;
}

// Saves the current `fitnessData` object back to localStorage
export function saveData() {
  if (!currentUser || !fitnessData) return;
  localStorage.setItem(storageKey(currentUser.uid), JSON.stringify(fitnessData));
}

// Wipes fitness data for the current user (keeps the Firebase account)
export function resetData() {
  if (!currentUser) return;
  const name = fitnessData.profile.name;
  const email = fitnessData.profile.email;
  fitnessData = blankData();
  fitnessData.profile.name = name;
  fitnessData.profile.email = email;
  saveData();
}

// If localStorage still has "today" set to a previous day, reset the
// daily trackers but keep profile, plans, streak and progress history.
export function rolloverIfNewDay() {
  if (!fitnessData) return;
  const today = todayStr();
  if (fitnessData.daily.date !== today) {
    // archive yesterday into progress[] before resetting, if it had any date at all
    if (fitnessData.daily.date) {
      archiveDay(fitnessData.daily.date);
    }
    fitnessData.daily.date = today;
    fitnessData.daily.water = 0;
    fitnessData.daily.meals = { breakfast: false, lunch: false, snack: false, dinner: false };
    fitnessData.daily.habits = { water: false, workout: false, healthyFood: false, sleep: false };
    fitnessData.workout.completedToday = false;
  }
}

// Adds/updates a progress[] entry for the given date based on daily data
function archiveDay(dateStr) {
  const mealsCompleted = Object.values(fitnessData.daily.meals).filter(Boolean).length;
  const entry = {
    date: dateStr,
    water: fitnessData.daily.water,
    mealsCompleted,
    workoutDone: fitnessData.workout.completedToday,
    weight: fitnessData.profile.weight
  };
  const existingIndex = fitnessData.progress.findIndex(p => p.date === dateStr);
  if (existingIndex >= 0) {
    fitnessData.progress[existingIndex] = entry;
  } else {
    fitnessData.progress.push(entry);
  }
  // keep only the last 30 days to keep localStorage small
  fitnessData.progress = fitnessData.progress.slice(-30);
}

// Call this any time "today" changes so progress[] reflects it live
// (used after water/meal/workout updates, without waiting for a day rollover)
export function updateTodayProgressEntry() {
  archiveDay(fitnessData.daily.date);
}
