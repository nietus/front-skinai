// UI Helper Functions

// Show notification
function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById("notifications");

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  notification.innerHTML = `
        <div class="notification-icon">${icons[type]}</div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
    `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Switch screens
function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("active");
  }
}

// Show login form
function showLoginForm() {
  document.getElementById("login-form").classList.add("active");
  document.getElementById("register-form").classList.remove("active");
}

// Show register form
function showRegisterForm() {
  document.getElementById("register-form").classList.add("active");
  document.getElementById("login-form").classList.remove("active");
}

// Show distributed status modal
async function showDistributedStatus() {
  const modal = document.getElementById("statusModal");
  const content = document.getElementById("statusContent");

  modal.classList.add("active");
  content.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const status = await api.getDistributedStatus();

    if (!status.enabled) {
      content.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <p>Distributed System Disabled</p>
                    <small>The system is running in standalone mode</small>
                </div>
            `;
      return;
    }

    const html = `
            <div class="status-grid">
                <div class="status-card">
                    <h3>Node ID</h3>
                    <div class="value">#${status.node_id}</div>
                    <div class="label">Current Node</div>
                </div>
                <div class="status-card">
                    <h3>Leader</h3>
                    <div class="value">#${status.leader_id}</div>
                    <div class="label">${
                      status.is_leader ? "You are the leader" : "Follower node"
                    }</div>
                </div>
                <div class="status-card">
                    <h3>Alive Nodes</h3>
                    <div class="value">${status.alive_nodes?.length || 0}/${
      status.total_nodes || 0
    }</div>
                    <div class="label">Active / Total</div>
                </div>
                <div class="status-card">
                    <h3>Tasks Processed</h3>
                    <div class="value">${status.tasks_processed || 0}</div>
                    <div class="label">Total analyses</div>
                </div>
            </div>

            ${
              status.health_summary
                ? `
                <div class="node-list">
                    <h3>Node Health</h3>
                    ${Object.entries(status.health_summary)
                      .map(
                        ([nodeId, health]) => `
                        <div class="node-item">
                            <div class="node-info">
                                <div class="node-status ${health.status}"></div>
                                <div>
                                    <div class="node-name">Node #${nodeId}</div>
                                    <small>${
                                      health.last_ping
                                        ? formatDate(health.last_ping)
                                        : "Never"
                                    }</small>
                                </div>
                            </div>
                            ${
                              nodeId == status.leader_id
                                ? '<div class="node-badge">LEADER</div>'
                                : ""
                            }
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `
                : ""
            }

            ${
              status.load_summary
                ? `
                <div class="node-list">
                    <h3>Load Distribution</h3>
                    ${Object.entries(status.load_summary)
                      .map(
                        ([nodeId, load]) => `
                        <div class="node-item">
                            <div class="node-info">
                                <div class="node-name">Node #${nodeId}</div>
                            </div>
                            <div class="detail-value">${load} tasks</div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `
                : ""
            }

            <div class="result-details" style="margin-top: 2rem;">
                <div class="detail-row">
                    <span class="detail-label">Lamport Clock</span>
                    <span class="detail-value">${
                      status.lamport_clock || 0
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Election State</span>
                    <span class="detail-value">${
                      status.election_state || "idle"
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">In Critical Section</span>
                    <span class="detail-value">${
                      status.in_critical_section ? "Yes" : "No"
                    }</span>
                </div>
            </div>

            <div class="simulation-controls">
                <h3>Distributed System Simulation</h3>
                <p class="simulation-hint">Test distributed algorithms by simulating failures and triggering elections</p>
                <div class="control-buttons">
                    <button class="btn btn-warning" onclick="triggerElection()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Trigger Election
                    </button>
                    <button class="btn btn-secondary" onclick="runMutexDemo()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Test Mutual Exclusion
                    </button>
                </div>
            </div>
        `;

    content.innerHTML = html;
  } catch (error) {
    console.error("Distributed status error:", error);
    content.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p>Distributed System Not Available</p>
                <small>The system is running in standalone mode or the distributed endpoints are not enabled.</small>
            </div>
        `;
  }
}

// Close status modal
function closeStatusModal() {
  document.getElementById("statusModal").classList.remove("active");
}

// Display analysis results
function displayResults(result) {
  const container = document.getElementById("resultsContent");
  const diseaseInfo = getDiseaseInfo(result.result.label);
  const confidenceLevel = getConfidenceLevel(result.result.confidence);

  const html = `
        <div class="result-header ${diseaseInfo.severity}">
            <div class="result-icon ${diseaseInfo.severity}">
                ${diseaseInfo.icon}
            </div>
            <div class="result-info">
                <h3>${result.result.label}</h3>
                <p>${Math.round(result.result.confidence * 100)}% confidence</p>
            </div>
        </div>

        <div class="confidence-bar">
            <div class="confidence-fill ${confidenceLevel}" style="width: ${
    result.result.confidence * 100
  }%"></div>
        </div>

        <div class="result-details">
            <div class="detail-row">
                <span class="detail-label">Analysis ID</span>
                <span class="detail-value">${result.request_id.substring(
                  0,
                  8
                )}...</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Framework</span>
                <span class="detail-value">${
                  result.result.extra?.model?.framework || "PyTorch"
                }</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Completed At</span>
                <span class="detail-value">${formatDate(
                  result.result.completed_at
                )}</span>
            </div>
        </div>

        <div class="alert ${diseaseInfo.severity}">
            <p><strong>Important:</strong> ${diseaseInfo.description}</p>
            <p style="margin-top: 0.5rem;"><small>This is an AI-based analysis and should not replace professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.</small></p>
        </div>

        ${
          result.result.extra?.top_k
            ? `
            <div class="top-predictions">
                <h4>Top Predictions</h4>
                ${result.result.extra.top_k
                  .slice(0, 5)
                  .map(
                    (pred, idx) => `
                    <div class="prediction-item">
                        <span class="prediction-label">${idx + 1}. ${
                      pred.label
                    }</span>
                        <span class="prediction-confidence">${Math.round(
                          pred.confidence * 100
                        )}%</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `
            : ""
        }
    `;

  container.innerHTML = html;
}

// Add alert styles to CSS dynamically
const alertStyles = `
.alert {
    padding: 1.5rem;
    border-radius: var(--radius);
    margin-top: 1.5rem;
    border-left: 4px solid;
}

.alert.high {
    background: rgba(239, 68, 68, 0.1);
    border-color: var(--danger);
    color: var(--danger);
}

.alert.medium {
    background: rgba(245, 158, 11, 0.1);
    border-color: var(--warning);
    color: #b45309;
}

.alert.low {
    background: rgba(16, 185, 129, 0.1);
    border-color: var(--secondary);
    color: #047857;
}

.alert strong {
    display: block;
    margin-bottom: 0.5rem;
}
`;

// Inject alert styles
const styleSheet = document.createElement("style");
styleSheet.textContent = alertStyles;
document.head.appendChild(styleSheet);

// Show loading overlay
function showLoading(message = "Processing...") {
  const resultsCard = document.querySelector(".results-card");
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.id = "loadingOverlay";
  overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
  resultsCard.style.position = "relative";
  resultsCard.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.remove();
  }
}

// Add to history
function addToHistory(result, imageUrl) {
  try {
    const apiKey = api.getApiKey();
    if (!apiKey) {
      console.error("No API key found");
      return;
    }

    let history = JSON.parse(
      localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY) || "[]"
    );

    history.unshift({
      requestId: result.request_id,
      label: result.result.label,
      confidence: result.result.confidence,
      timestamp: result.result.completed_at,
      imageUrl: imageUrl,
      apiKey: apiKey, // Store the API key with the history item
    });

    // Filter out old items to keep only the last 20 for this user
    const userHistory = history
      .filter((item) => item.apiKey === apiKey)
      .slice(0, 20);

    // Update the stored history with all users' history, but keep only the most recent 20 for each user
    const otherUsersHistory = history.filter((item) => item.apiKey !== apiKey);
    const updatedHistory = [...userHistory, ...otherUsersHistory];

    localStorage.setItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      JSON.stringify(updatedHistory)
    );
    loadHistory();
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

// Load history
function loadHistory() {
  try {
    const apiKey = api.getApiKey();
    if (!apiKey) {
      console.error("No API key found");
      return;
    }

    const allHistory = JSON.parse(
      localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY) || "[]"
    );

    // Filter history to show only items for the current user
    const userHistory = allHistory.filter((item) => item.apiKey === apiKey);

    const container = document.getElementById("historyContent");

    if (userHistory.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <p>No history available</p>
                </div>
            `;
      return;
    }

    const html = userHistory
      .map(
        (item) => `
            <div class="history-item" onclick="viewHistoryItem('${
              item.requestId
            }')">
                ${
                  item.imageUrl
                    ? `<img src="${item.imageUrl}" alt="Analysis" class="history-image">`
                    : ""
                }
                <div class="history-info">
                    <h4>${item.label}</h4>
                    <p>${Math.round(
                      item.confidence * 100
                    )}% confidence • ${formatDate(item.timestamp)}</p>
                </div>
                <div class="history-badge completed">Completed</div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  } catch (error) {
    console.error("Failed to load history:", error);
  }
}

// View history item
async function viewHistoryItem(requestId) {
  try {
    showLoading("Loading analysis...");
    const result = await api.getAnalysisStatus(requestId);
    hideLoading();

    if (result.status === "completed") {
      displayResults(result);
      showNotification("Analysis loaded from history", "success");
    }
  } catch (error) {
    hideLoading();
    showNotification("Failed to load analysis", "error");
  }
}

// Close modal on outside click
document.addEventListener("click", (e) => {
  const statusModal = document.getElementById("statusModal");
  const settingsModal = document.getElementById("settingsModal");

  if (e.target === statusModal) {
    closeStatusModal();
  }

  if (e.target === settingsModal) {
    closeSettings();
  }
});

// ============================================================================
// Settings Modal Functions
// ============================================================================

// Show settings modal
function showSettings() {
  const modal = document.getElementById("settingsModal");
  const input = document.getElementById("apiUrlInput");

  // Load current API URL
  input.value = CONFIG.API_BASE_URL;

  modal.classList.add("active");
}

// Close settings modal
function closeSettings() {
  document.getElementById("settingsModal").classList.remove("active");
}

// Save API URL
function saveApiUrl() {
  const input = document.getElementById("apiUrlInput");
  const url = input.value.trim();

  if (!url) {
    showNotification("Please enter an API URL", "warning");
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    showNotification("Invalid URL format", "error");
    return;
  }

  // Save to CONFIG (which will store in localStorage)
  CONFIG.API_BASE_URL = url;

  showNotification("API URL saved successfully!", "success");

  // Close modal after a short delay
  setTimeout(() => {
    closeSettings();
  }, 1000);
}

// ============================================================================
// Login Screen API Configuration Functions
// ============================================================================

// Initialize login screen API input
function initLoginApiConfig() {
  const input = document.getElementById("login-api-url");

  if (input) {
    // Load current value from localStorage
    const savedUrl = CONFIG.API_BASE_URL;
    if (savedUrl) {
      input.value = savedUrl;
    }

    // Save on input change (real-time saving)
    input.addEventListener("input", () => {
      const url = input.value.trim();
      if (url) {
        try {
          new URL(url);
          CONFIG.API_BASE_URL = url;
        } catch (error) {
          // Invalid URL, but don't show error yet - wait until they're done typing
        }
      }
    });

    // Validate on blur
    input.addEventListener("blur", () => {
      const url = input.value.trim();
      if (url) {
        try {
          new URL(url);
          CONFIG.API_BASE_URL = url;
        } catch (error) {
          showNotification("Invalid URL format", "error");
        }
      }
    });
  }
}
