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
    openApiSettings: "Open API-instellingen",
    openRouterTitle: "OpenRouter",
    apiKeyLabel: "API key",
    apiKeyPlaceholder: "API key",
    confirmApiKey: "Confirm",
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
    openApiSettings: "Open API settings",
    openRouterTitle: "OpenRouter",
    apiKeyLabel: "API key",
    apiKeyPlaceholder: "API key",
    confirmApiKey: "Confirm",
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

const account_settings = {
  api_key: "",
};

window.account_settings = account_settings;

const chat_config = window.app_config || {
  openrouter_model: "google/gemini-2.0-flash-001",
  context_prompt: "Say monkey.",
};

const LANG_STORAGE_KEY = "account-overview-language";
const screen = document.querySelector(".screen");
const languageSwitch = document.querySelector("[data-language-switch]");
const openApiSettingsButton = document.querySelector("[data-open-api-settings]");
const apiSettingsOverlay = document.querySelector("[data-api-settings-overlay]");
const apiSettingsForm = document.querySelector("[data-api-settings-form]");
const apiKeyInput = document.querySelector("[data-api-key-input]");
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
let hasRequestedInitialAgentMessage = false;

const chatMessages = [];
const openrouterMessages = [];

window.chatMessages = chatMessages;
window.openrouterMessages = openrouterMessages;

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
    requestInitialAgentMessage();

    if (account_settings.api_key) {
      chatInput.focus();
    }
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
    bubble.className = "chat-bubble";
    bubble.textContent = message.text;
    row.append(bubble);
    chatMessagesNode.append(row);
  });

  if (chatIsWaiting) {
    const row = document.createElement("div");
    row.className = "chat-row agent thinking-row";

    const avatar = document.createElement("span");
    avatar.className = "chat-avatar";
    avatar.setAttribute("aria-hidden", "true");

    const image = document.createElement("img");
    image.src = "resources/assets/bennie_char.png";
    image.alt = "";
    avatar.append(image);
    row.append(avatar);

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble thinking-bubble";
    bubble.textContent = "Thinking...";
    row.append(bubble);
    chatMessagesNode.append(row);
  }

  chatMessagesNode.scrollTop = chatMessagesNode.scrollHeight;
}

function setChatWaiting(isWaiting) {
  chatIsWaiting = isWaiting;
  chatInput.disabled = isWaiting;
  chatForm.querySelector("button").disabled = isWaiting;
}

function openApiSettings() {
  apiKeyInput.value = account_settings.api_key;
  apiSettingsOverlay.hidden = false;
  screen.classList.add("modal-open");
  apiKeyInput.focus();
}

function closeApiSettings() {
  apiSettingsOverlay.hidden = true;
  screen.classList.remove("modal-open");
}

function saveApiKey(apiKey) {
  account_settings.api_key = apiKey;
  closeApiSettings();

  if (currentPage === "chat") {
    requestInitialAgentMessage();
    chatInput.focus();
  }
}

function requireApiKey() {
  if (account_settings.api_key) {
    return true;
  }

  openApiSettings();
  return false;
}

async function getChatResponse(messages, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: chat_config.openrouter_model,
      messages,
      reasoning: {
        enabled: true,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter request failed");
  }

  return data.choices?.[0]?.message || { content: "" };
}

async function queueAgentResponse() {
  if (!requireApiKey()) {
    return;
  }

  setChatWaiting(true);
  renderChatMessages();

  try {
    const responseMessage = await getChatResponse(openrouterMessages, account_settings.api_key);
    const assistantMessage = {
      role: "assistant",
      content: responseMessage.content || "",
    };

    if (responseMessage.reasoning_details !== undefined) {
      assistantMessage.reasoning_details = responseMessage.reasoning_details;
    }

    openrouterMessages.push(assistantMessage);
    chatMessages.push({
      role: "agent",
      text: assistantMessage.content,
    });
  } catch (error) {
    chatMessages.push({
      role: "agent",
      text: error.message,
    });
  } finally {
    setChatWaiting(false);
    renderChatMessages();

    if (currentPage === "chat") {
      chatInput.focus();
    }
  }
}

function requestInitialAgentMessage() {
  if (hasRequestedInitialAgentMessage || openrouterMessages.length > 0 || chatIsWaiting) {
    return;
  }

  if (!requireApiKey()) {
    return;
  }

  hasRequestedInitialAgentMessage = true;
  openrouterMessages.push({
    role: "user",
    content: chat_config.context_prompt,
  });
  queueAgentResponse();
}

function sendChatMessage(messageText) {
  if (!messageText || chatIsWaiting) {
    return;
  }

  if (!requireApiKey()) {
    return;
  }

  chatMessages.push({
    role: "user",
    text: messageText,
  });
  openrouterMessages.push({
    role: "user",
    content: messageText,
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

openApiSettingsButton.addEventListener("click", () => {
  openApiSettings();
});

apiSettingsOverlay.addEventListener("click", (event) => {
  if (event.target === apiSettingsOverlay) {
    closeApiSettings();
  }
});

apiSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveApiKey(apiKeyInput.value.trim());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !apiSettingsOverlay.hidden) {
    closeApiSettings();
  }
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
