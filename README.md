# AI Fitness Coach — Frontend Prototype

A student frontend project built with **HTML5, CSS3, Bootstrap 5 and vanilla
JavaScript**, using **Firebase Authentication** (Email/Password) for accounts
and **localStorage** for all fitness app data. No backend, no framework.

## Folder structure

```
project/
├── index.html              (single-page app — all screens live here)
├── css/
│   └── style.css
└── js/
    ├── firebase-config.js  (paste your Firebase config here)
    ├── state.js             (data model + localStorage helpers)
    ├── auth.js               (Firebase sign up / login / logout)
    ├── calculator.js         (BMI + calorie formulas)
    ├── workout.js             (workout & diet plan data + rendering)
    ├── dashboard.js           (dashboard, habits, water, streak, progress)
    ├── chatbot.js              (predefined chatbot responses)
    └── app.js                  (main entry point — wires everything together)
```

The app is built as **one HTML file with JavaScript-controlled
screens/sections**, rather than many separate HTML pages. This keeps
authentication and navigation simple, while still feeling like a single
connected application.

## 1. Firebase setup (required)

1. Go to the [Firebase console](https://console.firebase.google.com) and
   create a new project (or use an existing one).
2. In your project, go to **Build → Authentication → Sign-in method** and
   enable **Email/Password**.
3. Go to **Project settings → General → Your apps**, click the **Web** icon
   (`</>`) to register a new web app, and copy the `firebaseConfig` object
   Firebase gives you.
4. Open `js/firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

That's the only file you need to edit to get authentication working.

## 2. Run the project locally

Because the app uses JavaScript **modules** (`type="module"`), it must be
served over `http://`, not opened directly as a `file://` path.

Any of these work:

**Option A — VS Code Live Server**
Open the `project` folder in VS Code, install the "Live Server" extension,
right-click `index.html` → "Open with Live Server".

**Option B — Python**
```bash
cd project
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option C — Node**
```bash
cd project
npx serve .
```

## 3. Testing checklist

- **Auth:** sign up, duplicate email is rejected with a friendly message,
  login works, wrong password is rejected, logout works, refreshing the
  page keeps you logged in.
- **Setup flow:** profile → goal → BMI → calories → workout & diet plan,
  each step saves and persists after a refresh.
- **Dashboard:** streak ring, water, meals and workout status update live.
- **Water tracker:** `+`/`−` buttons, can't go below 0, persists.
- **Habits:** checkboxes persist.
- **Workout:** marking a workout complete updates the dashboard, progress
  and streak, and can't be double-counted on the same day.
- **Diet:** meal checkboxes persist and update the dashboard.
- **Streak:** completing the workout on consecutive days increases the
  streak; skipping a day resets it; clicking multiple times the same day
  does not increase it further.
- **Progress:** 7-day water chart and stats populate as you use the app.
- **Chatbot:** each button shows its predefined response.
- **Profile:** edit profile (recalculates BMI/calories), change goal,
  reset data (confirmation required, Firebase account stays intact), logout.
- **Responsive:** resize down to tablet/mobile — sidebar becomes a
  hamburger/offcanvas menu.

## Notes

- All fitness data is namespaced per Firebase user as
  `fitnessData_<uid>` in `localStorage`, so multiple accounts on the same
  browser never mix data.
- The chatbot is **not** a real AI — it shows fixed, predefined replies for
  four topics (workout, diet, water, motivation), as required for this
  student prototype.
- A new calendar day automatically resets water/meals/habits/workout
  completion while keeping your profile, plans, streak and progress
  history.
