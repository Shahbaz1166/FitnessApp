// ============================================================
// CHATBOT.JS
// A simple predefined-response chatbot UI.
// NOTE: this is NOT a real AI chatbot — it just shows a fixed
// message for each topic button. No external API is used.
// ============================================================

const RESPONSES = {
  workout: "Stay consistent and focus on proper form before increasing intensity.",
  diet: "Try to include vegetables, protein and balanced meals throughout the day.",
  water: "Remember to drink water regularly throughout the day.",
  motivation: "Small progress every day leads to big results. Keep going! 💪"
};

const TOPIC_LABELS = {
  workout: "Workout Tips",
  diet: "Diet Tips",
  water: "Water",
  motivation: "Motivation"
};

export function initChatbot() {
  const window_ = document.getElementById("chat-window");

  document.querySelectorAll(".btn-chat").forEach(btn => {
    btn.addEventListener("click", () => {
      const topic = btn.dataset.topic;

      // show the user's "question" (the button they tapped)
      const userBubble = document.createElement("div");
      userBubble.className = "chat-bubble user";
      userBubble.textContent = TOPIC_LABELS[topic];
      window_.appendChild(userBubble);

      // show the bot's predefined response
      const botBubble = document.createElement("div");
      botBubble.className = "chat-bubble bot";
      botBubble.textContent = RESPONSES[topic];
      window_.appendChild(botBubble);

      window_.scrollTop = window_.scrollHeight;
    });
  });
}
