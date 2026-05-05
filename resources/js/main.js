const COPY = {
  du: {
    documentTitle: "Rekening overzicht",
    switchTo: "EN",
    title: "Rekening overzicht",
    transfer: "Overschrijven",
    qrScanner: "QR-scanner",
    savingsGoal: "Spaardoel instellen",
    privateSavings: "Privé sparen",
    sharedSavings: "Samen sparen",
    goalTitle: "Spaardoel instellen",
    setupTogether: "Samen instellen",
    setupAlone: "Zelf instellen",
    goalIntro: "Het is geweldig dat je een doel wilt stellen. Laten we hier samen aan werken, ik zal je helpen om je doel een diepere betekenis te geven.",
    stepName: "Geef je goal een naam",
    stepAmount: "Kies een bedrag",
    stepMotivation: "Wat is je drijfveer",
    continue: "Verder",
    chatTitle: "Samen instellen",
    chatPlaceholder: "Type hier",
    chatInputLabel: "Chatbericht",
    sendMessage: "Verstuur bericht",
  },
  en: {
    documentTitle: "Account overview",
    switchTo: "DU",
    title: "Account overview",
    transfer: "Transfer",
    qrScanner: "QR-scanner",
    savingsGoal: "Set savings goal",
    privateSavings: "Private savings",
    sharedSavings: "Shared savings",
    goalTitle: "Set savings goal",
    setupTogether: "Set up together",
    setupAlone: "Set up myself",
    goalIntro: "It is great that you want to set a goal. Let us work on it together, I will help you give your goal a deeper meaning.",
    stepName: "Give your goal a name",
    stepAmount: "Choose an amount",
    stepMotivation: "What is your motivation",
    continue: "Continue",
    chatTitle: "Set up together",
    chatPlaceholder: "Type here",
    chatInputLabel: "Chat message",
    sendMessage: "Send message",
  },
};

const account_config = {
  private: {
    name: "J. Kool",
    number: "NL76 TRIO 2301 2295 80",
    amount: "€ 11328",
  },
  shared: {
    name: "J. Kool X F. Steven",
    number: "NL76 TRIO 2301 2295 80",
    amount: "€ 43827",
  },
};

const LANG_STORAGE_KEY = "account-overview-language";
const languageSwitch = document.querySelector("[data-language-switch]");
const pages = document.querySelectorAll("[data-page]");
const openGoalButton = document.querySelector("[data-open-goal]");
const openChatButton = document.querySelector("[data-open-chat]");
const backOverviewButton = document.querySelector("[data-back-overview]");
const backGoalButton = document.querySelector("[data-back-goal]");
const goalChoices = document.querySelectorAll("[data-goal-choice]");
const chatMessagesNode = document.querySelector("[data-chat-messages]");
const chatForm = document.querySelector("[data-chat-form]");
const chatInput = document.querySelector("[data-chat-input]");
let currentPage = "overview";
let chatIsWaiting = false;

const chatMessages = [
  {
    role: "agent",
    text: "test message",
  },
];

function getInitialLanguage() {
  const savedLanguage = window.localStorage.getItem(LANG_STORAGE_KEY);

  if (savedLanguage && COPY[savedLanguage]) {
    return savedLanguage;
  }

  return "du";
}

function setLanguage(language) {
  const copy = COPY[language];

  document.documentElement.lang = language === "du" ? "nl" : "en";
  if (currentPage === "chat") {
    document.title = copy.chatTitle;
  } else if (currentPage === "goal") {
    document.title = copy.goalTitle;
  } else {
    document.title = copy.documentTitle;
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = copy[key] || "";
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    node.placeholder = copy[key] || "";
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    node.setAttribute("aria-label", copy[key] || "");
  });

  languageSwitch.textContent = copy.switchTo;
  languageSwitch.setAttribute("aria-label", language === "du" ? "Switch to English" : "Schakel naar Nederlands");
  window.localStorage.setItem(LANG_STORAGE_KEY, language);
}

function renderAccounts() {
  document.querySelectorAll("[data-account]").forEach((accountNode) => {
    const account = account_config[accountNode.dataset.account];

    if (!account) {
      return;
    }

    accountNode.querySelectorAll("[data-account-field]").forEach((fieldNode) => {
      const field = fieldNode.dataset.accountField;
      fieldNode.textContent = account[field] || "";
    });
  });
}

function showPage(pageName) {
  currentPage = pageName;

  pages.forEach((page) => {
    page.hidden = page.dataset.page !== pageName;
  });

  setLanguage(currentLanguage);

  if (pageName === "chat") {
    renderChatMessages();
    chatInput.focus();
  }
}

function setGoalChoice(selectedChoice) {
  goalChoices.forEach((choice) => {
    const isSelected = choice === selectedChoice;
    choice.classList.toggle("active", isSelected);
    choice.setAttribute("aria-pressed", String(isSelected));
  });
}

function renderChatMessages() {
  chatMessagesNode.replaceChildren();

  chatMessages.forEach((message) => {
    const row = document.createElement("div");
    row.className = `chat-row ${message.role}`;

    if (message.role === "agent") {
      const avatar = document.createElement("span");
      avatar.className = "chat-avatar";
      avatar.setAttribute("aria-hidden", "true");

      const image = document.createElement("img");
      image.src = "resources/assets/bennie_char.png";
      image.alt = "";
      avatar.append(image);
      row.append(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble${message.pending ? " pending" : ""}`;
    bubble.textContent = message.text;
    row.append(bubble);
    chatMessagesNode.append(row);
  });

  chatMessagesNode.scrollTop = chatMessagesNode.scrollHeight;
}

function setChatWaiting(isWaiting) {
  chatIsWaiting = isWaiting;
  chatInput.disabled = isWaiting;
  chatForm.querySelector("button").disabled = isWaiting;
}

function queueAgentResponse() {
  const pendingMessage = {
    role: "agent",
    text: "test-message",
    pending: true,
  };

  chatMessages.push(pendingMessage);
  setChatWaiting(true);
  renderChatMessages();

  window.setTimeout(() => {
    pendingMessage.text = "test message";
    pendingMessage.pending = false;
    setChatWaiting(false);
    renderChatMessages();
    chatInput.focus();
  }, 700);
}

function sendChatMessage(messageText) {
  if (!messageText || chatIsWaiting) {
    return;
  }

  chatMessages.push({
    role: "user",
    text: messageText,
  });

  chatInput.value = "";
  renderChatMessages();
  queueAgentResponse();
}

let currentLanguage = getInitialLanguage();

languageSwitch.addEventListener("click", () => {
  currentLanguage = currentLanguage === "du" ? "en" : "du";
  setLanguage(currentLanguage);
});

openGoalButton.addEventListener("click", () => {
  showPage("goal");
});

backOverviewButton.addEventListener("click", () => {
  showPage("overview");
});

backGoalButton.addEventListener("click", () => {
  showPage("goal");
});

openChatButton.addEventListener("click", () => {
  showPage("chat");
});

goalChoices.forEach((choice) => {
  choice.addEventListener("click", () => {
    setGoalChoice(choice);
  });
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(chatInput.value.trim());
});

renderAccounts();
renderChatMessages();
setLanguage(currentLanguage);
