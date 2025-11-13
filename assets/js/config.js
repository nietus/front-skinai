// API Configuration
const CONFIG = {
  // Get API URL from localStorage (user must set this)
  get API_BASE_URL() {
    return localStorage.getItem("skinia_api_url") || "";
  },

  // Set API URL and save to localStorage
  set API_BASE_URL(url) {
    // Remove trailing slash if present
    const cleanUrl = url.replace(/\/$/, "");
    localStorage.setItem("skinia_api_url", cleanUrl);
  },

  // Polling interval for checking analysis status (milliseconds)
  STATUS_POLL_INTERVAL: 2000,

  // Maximum polling attempts before timeout
  MAX_POLL_ATTEMPTS: 60,

  // Local storage keys
  STORAGE_KEYS: {
    API_KEY: "skinia_api_key",
    HISTORY: "skinia_history",
    API_URL: "skinia_api_url",
  },

  // Supported image formats
  SUPPORTED_FORMATS: ["image/jpeg", "image/jpg", "image/png"],

  // Max file size (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Skin disease categories
  DISEASE_INFO: {
    Melanoma: {
      severity: "high",
      icon: "🔴",
      description:
        "A serious form of skin cancer. Seek medical attention immediately.",
    },
    "Actinic Carcinoma": {
      severity: "high",
      icon: "🔴",
      description: "A type of skin cancer. Consult a dermatologist.",
    },
    Acne: {
      severity: "low",
      icon: "🟢",
      description:
        "Common skin condition. Usually treatable with over-the-counter products.",
    },
    "Atopic Dermatitis": {
      severity: "medium",
      icon: "🟡",
      description:
        "A chronic skin condition. May require prescription treatment.",
    },
    "Benign Tumors": {
      severity: "low",
      icon: "🟢",
      description: "Non-cancerous growth. Monitor for changes.",
    },
    "Bullous Disease": {
      severity: "medium",
      icon: "🟡",
      description: "Blistering skin disorder. Consult a dermatologist.",
    },
    Cellulitis: {
      severity: "medium",
      icon: "🟡",
      description: "Bacterial skin infection. May require antibiotics.",
    },
    "Drug Eruptions": {
      severity: "medium",
      icon: "🟡",
      description: "Skin reaction to medication. Consult your doctor.",
    },
    Eczema: {
      severity: "medium",
      icon: "🟡",
      description:
        "Inflammatory skin condition. Treatable with moisturizers and medications.",
    },
    "Herpes HPV": {
      severity: "medium",
      icon: "🟡",
      description: "Viral skin infection. Consult a healthcare provider.",
    },
    "Light Diseases": {
      severity: "medium",
      icon: "🟡",
      description: "Photodermatosis. Avoid sun exposure and use sunscreen.",
    },
    Lupus: {
      severity: "high",
      icon: "🔴",
      description: "Autoimmune disease. Requires medical supervision.",
    },
    "Poison IVY": {
      severity: "low",
      icon: "🟢",
      description:
        "Allergic skin reaction. Usually resolves with topical treatment.",
    },
    Psoriasis: {
      severity: "medium",
      icon: "🟡",
      description:
        "Chronic autoimmune condition. Multiple treatment options available.",
    },
    Ringworm: {
      severity: "low",
      icon: "🟢",
      description: "Fungal infection. Treatable with antifungal medication.",
    },
    "Systemic Disease": {
      severity: "high",
      icon: "🔴",
      description:
        "May indicate underlying condition. Seek medical evaluation.",
    },
    "Urticarial Hives": {
      severity: "low",
      icon: "🟢",
      description: "Allergic reaction. Usually temporary and treatable.",
    },
    "Vascular Tumors": {
      severity: "medium",
      icon: "🟡",
      description:
        "Abnormal blood vessel growth. Monitor and consult specialist.",
    },
    Vasculitis: {
      severity: "medium",
      icon: "🟡",
      description: "Inflammation of blood vessels. May require treatment.",
    },
    "Viral Infections": {
      severity: "low",
      icon: "🟢",
      description: "Viral skin condition. Often resolves on its own.",
    },
  },
};

// Helper function to get disease info
function getDiseaseInfo(label) {
  return (
    CONFIG.DISEASE_INFO[label] || {
      severity: "medium",
      icon: "⚪",
      description:
        "Please consult a healthcare professional for proper diagnosis.",
    }
  );
}

// Helper function to get confidence level
function getConfidenceLevel(confidence) {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.5) return "medium";
  return "low";
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // More than a day
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
