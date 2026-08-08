// ============================================================
// CALCULATOR.JS
// BMI + daily calorie target calculations, and the screens
// that display them (BMI screen, Calories screen).
// ============================================================

import { fitnessData, saveData } from "./state.js";

// BMI = weight(kg) / (height(m) * height(m))
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // one decimal place
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function bmiExplanation(category) {
  switch (category) {
    case "Underweight": return "Your weight is below the typical range for your height. Consider speaking with a professional about healthy weight gain.";
    case "Normal": return "Your weight is within a typical healthy range for your height. Keep up the good habits!";
    case "Overweight": return "Your weight is a bit above the typical range for your height. Small, consistent changes can help.";
    default: return "Your weight is well above the typical range for your height. Consider speaking with a professional for guidance.";
  }
}

// Mifflin-St Jeor formula — simple and commonly taught
export function calculateCalories(age, gender, heightCm, weightKg, activityMultiplier) {
  let bmr;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    // used for "female" and "other" for simplicity in this student project
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return Math.round(bmr * activityMultiplier);
}

// Renders the BMI screen using the current fitnessData
export function renderBmiScreen() {
  const bmi = calculateBMI(fitnessData.profile.weight, fitnessData.profile.height);
  const category = bmiCategory(bmi);

  fitnessData.bmi = bmi;
  fitnessData.bmiCategory = category;
  saveData();

  document.getElementById("bmi-value").textContent = bmi;
  document.getElementById("bmi-category").textContent = category;
  document.getElementById("bmi-explain").textContent = bmiExplanation(category);
}

// Wires the Calories form (called once at startup)
export function initCaloriesForm() {
  const form = document.getElementById("calories-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const select = document.getElementById("activity-level");
    const multiplier = parseFloat(select.value);
    if (!multiplier) return;

    const { age, gender, height, weight } = fitnessData.profile;
    const calories = calculateCalories(age, gender, height, weight, multiplier);

    fitnessData.calories = calories;
    fitnessData.activityMultiplier = multiplier;
    saveData();

    document.getElementById("calorie-value").textContent = calories;
    document.getElementById("calorie-result-box").classList.remove("d-none");

    // small delay so the user sees the number before moving on
    setTimeout(() => {
      window.APP_NAV.showScreen("screen-workout-diet");
      window.APP_NAV.renderWorkoutDietScreen();
    }, 700);
  });
}
