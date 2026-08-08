// ============================================================
// AUTH.JS
// Handles Sign Up, Login, Logout and the auth state listener
// using Firebase Authentication (Email/Password).
// ============================================================



//-------------------------------
import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Friendly messages for common Firebase Auth error codes
function friendlyAuthError(error) {
  const code = error && error.code ? error.code : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// Wires up password show/hide toggle buttons (.btn-toggle-pass)
function initPasswordToggles() {
  document.querySelectorAll(".btn-toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  });
}

function showFieldError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (message) {
    input.classList.add("is-invalid");
    err.textContent = message;
  } else {
    input.classList.remove("is-invalid");
    err.textContent = "";
  }
}

function setLoading(btn, isLoading, label) {
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="loading-spin"></span> ${label}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || label;
  }
}

// initAuth wires up the forms and the auth-state listener.
// `onLoggedIn(user)` and `onLoggedOut()` are callbacks supplied by app.js
export function initAuth({ onLoggedIn, onLoggedOut }) {
  initPasswordToggles();

  // ---------- SIGN UP ----------
  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;

    // reset previous errors
    ["signup-name", "signup-email", "signup-password", "signup-confirm"].forEach(id => {
      document.getElementById(id).classList.remove("is-invalid");
    });
    document.getElementById("signup-alert").classList.add("d-none");
    document.getElementById("signup-success").classList.add("d-none");

    let hasError = false;
    if (!name) { showFieldError("signup-name", "err-signup-name", "Full name is required."); hasError = true; }
    if (!email) { showFieldError("signup-email", "err-signup-email", "Email is required."); hasError = true; }
    if (!password || password.length < 6) { showFieldError("signup-password", "err-signup-password", "Password must be at least 6 characters."); hasError = true; }
    if (confirm !== password) { showFieldError("signup-confirm", "err-signup-confirm", "Passwords do not match."); hasError = true; }
    if (hasError) return;

    const btn = document.getElementById("signup-submit-btn");
    setLoading(btn, true, "Creating Account...");

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      document.getElementById("signup-success").textContent = "Account created! Redirecting...";
      document.getElementById("signup-success").classList.remove("d-none");

      // onAuthStateChanged (below) will fire and take the user forward
    } catch (error) {
      document.getElementById("signup-alert").textContent = friendlyAuthError(error);
      document.getElementById("signup-alert").classList.remove("d-none");
    } finally {
      setLoading(btn, false, "Create Account");
    }
  });

  // ---------- LOGIN ----------
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    document.getElementById("login-alert").classList.add("d-none");

    if (!email || !password) {
      document.getElementById("login-alert").textContent = "Please enter both email and password.";
      document.getElementById("login-alert").classList.remove("d-none");
      return;
    }

    const btn = document.getElementById("login-submit-btn");
    setLoading(btn, true, "Logging In...");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged (below) takes over from here
    } catch (error) {
      document.getElementById("login-alert").textContent = friendlyAuthError(error);
      document.getElementById("login-alert").classList.remove("d-none");
    } finally {
      setLoading(btn, false, "Login");
    }
  });

  // ---------- LOGOUT ----------
  const logoutButtons = [
    document.getElementById("sidebar-logout-btn"),
    document.getElementById("mobile-logout-btn"),
    document.getElementById("profile-logout-btn")
  ];
  logoutButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        // onAuthStateChanged (below) takes over from here
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  });

  // ---------- AUTH STATE LISTENER ----------
  // This is the source of truth for whether someone is logged in.
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onLoggedIn(user);
    } else {
      onLoggedOut();
    }
  });
}
