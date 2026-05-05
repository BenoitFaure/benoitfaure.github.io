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
  document.title = copy.documentTitle;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = copy[key] || "";
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

let currentLanguage = getInitialLanguage();

languageSwitch.addEventListener("click", () => {
  currentLanguage = currentLanguage === "du" ? "en" : "du";
  setLanguage(currentLanguage);
});

renderAccounts();
setLanguage(currentLanguage);
