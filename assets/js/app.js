// Main Application Logic

let selectedFile = null;
let currentImageUrl = null;
let cameraStream = null;
let currentUploadMode = 'file'; // 'file' or 'camera'

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize API configuration on login screen
    initLoginApiConfig();

    // Check if user is already logged in
    const apiKey = api.getApiKey();
    if (apiKey) {
        // Validate the stored API key
        const isValid = await api.validateApiKey(apiKey);
        if (isValid) {
            showDashboard();
        } else {
            api.clearApiKey();
            switchScreen('auth-screen');
        }
    } else {
        switchScreen('auth-screen');
    }

    // Setup drag and drop
    setupDragAndDrop();
});

// Handle login
async function handleLogin(event) {
    event.preventDefault();

    const apiKeyInput = document.getElementById('login-api-key');
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        showNotification('Please enter an API key', 'error');
        return;
    }

    try {
        // Validate API key
        const isValid = await api.validateApiKey(apiKey);

        if (isValid) {
            api.setApiKey(apiKey);
            showNotification('Login successful!', 'success');
            showDashboard();
        } else {
            showNotification('Invalid API key. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please check your connection.', 'error');
        console.error('Login error:', error);
    }
}

// Handle register
async function handleRegister(event) {
    event.preventDefault();

    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const name = nameInput.value.trim();
    const email = emailInput.value.trim() || null;

    if (!name) {
        showNotification('Please enter your name', 'error');
        return;
    }

    if (name.length < 3) {
        showNotification('Name must be at least 3 characters long', 'error');
        return;
    }

    try {
        // Disable button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating Account...</span>';

        // Register
        const result = await api.register(name, email);

        // Show success with API key
        showRegistrationSuccess(result);

        // Reset form
        nameInput.value = '';
        emailInput.value = '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span>Create Account</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
        `;

    } catch (error) {
        showNotification(error.message || 'Registration failed. Please try again.', 'error');

        // Reset button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span>Create Account</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
        `;
        console.error('Registration error:', error);
    }
}

// Show registration success modal
function showRegistrationSuccess(result) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '3000';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                <h2 style="color: var(--secondary);">Registration Successful!</h2>
            </div>
            <div class="modal-body" style="text-align: center;">
                <div style="background: linear-gradient(135deg, var(--secondary), #34d399); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                <p style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--dark);">
                    <strong>Welcome, ${result.name}!</strong>
                </p>

                <p style="color: var(--gray); margin-bottom: 1.5rem;">
                    Your account has been created. Here's your API key:
                </p>

                <div style="background: var(--light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 2px dashed var(--primary);">
                    <code id="apiKeyDisplay" style="font-size: 0.9rem; word-break: break-all; color: var(--primary); font-weight: 600;">${result.api_key}</code>
                </div>

                <button onclick="copyApiKey('${result.api_key}')" class="btn btn-ghost" style="margin-bottom: 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy API Key
                </button>

                <div style="background: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--warning); text-align: left; margin-bottom: 1.5rem;">
                    <p style="color: #b45309; font-size: 0.9rem; margin: 0;">
                        <strong>⚠️ Important:</strong> Save this API key now! You won't be able to see it again. If you lose it, you'll need to register a new account.
                    </p>
                </div>

                <button onclick="closeRegistrationModal()" class="btn btn-primary btn-block">
                    Continue to Login
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Copy API key to clipboard
function copyApiKey(apiKey) {
    navigator.clipboard.writeText(apiKey).then(() => {
        showNotification('API key copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy. Please copy manually.', 'error');
    });
}

// Close registration modal and go to login
function closeRegistrationModal() {
    const modal = document.querySelector('.modal[style*="3000"]');
    if (modal) {
        modal.remove();
    }
    showLoginForm();
    showNotification('Now you can login with your API key', 'info');
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        api.clearApiKey();
        selectedFile = null;
        currentImageUrl = null;
        document.getElementById('imageInput').value = '';
        document.getElementById('imagePreview').classList.remove('active');
        document.getElementById('imagePreview').innerHTML = '';
        switchScreen('auth-screen');
        showNotification('Logged out successfully', 'success');
    }
}

// Show dashboard
function showDashboard() {
    switchScreen('dashboard-screen');
    loadHistory();

    // Perform health check
    api.healthCheck()
        .then(() => {
            showNotification('Connected to Skin IA API', 'success', 3000);
        })
        .catch(() => {
            showNotification('Warning: Could not connect to API', 'warning', 5000);
        });
}

// Setup drag and drop
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.background = 'rgba(99, 102, 241, 0.05)';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            handleFileSelect({ target: imageInput });
        }
    });
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Validate file type
    if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
        showNotification('Please upload a valid image (JPG, JPEG, or PNG)', 'error');
        event.target.value = '';
        return;
    }

    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showNotification('Image size must be less than 10MB', 'error');
        event.target.value = '';
        return;
    }

    selectedFile = file;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageUrl = e.target.result;
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `
            <img src="${currentImageUrl}" alt="Preview">
            <button class="remove-image" onclick="removeImage()" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        preview.classList.add('active');

        // Enable analyze button
        document.getElementById('analyzeBtn').disabled = false;

        // Hide upload label
        document.querySelector('.upload-label').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
    selectedFile = null;
    currentImageUrl = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').classList.remove('active');
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('analyzeBtn').disabled = true;
    document.querySelector('.upload-label').style.display = 'flex';
}

// Handle upload and analysis
async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
        showNotification('Please select an image first', 'error');
        return;
    }

    try {
        // Disable button
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span>Uploading...</span>';

        // Show loading
        showLoading('Uploading image...');

        // Upload image
        const uploadResult = await api.analyzeImage(selectedFile, 'tensorflow');
        showNotification('Image uploaded successfully!', 'success');

        // Update UI
        analyzeBtn.innerHTML = '<span>Analyzing...</span>';
        showLoading(`Analyzing image (Node #${uploadResult.assigned_to_node || 'local'})...`);

        // Poll for result
        let pollAttempts = 0;
        const result = await api.pollForResult(uploadResult.request_id, (status, attempts) => {
            pollAttempts = attempts;
            const elapsed = Math.round((attempts * CONFIG.STATUS_POLL_INTERVAL) / 1000);
            showLoading(`Analyzing image... (${elapsed}s)`);
        });

        // First hide any loading state
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
            document.body.style.overflow = '';
        }

        // Display results
        displayResults(result);
        showNotification('Analysis complete!', 'success');

        // Add to history
        addToHistory(result, currentImageUrl);

        // Reset form completely - back to initial state
        selectedFile = null;
        currentImageUrl = null;

        // Stop camera if it's running
        stopCamera();

        // Reset camera area
        const cameraArea = document.getElementById('cameraArea');
        cameraArea.innerHTML = `
            <div id="cameraView" class="camera-view">
                <video id="cameraStream" autoplay playsinline></video>
                <canvas id="cameraCanvas" style="display: none;"></canvas>
            </div>
            <div class="camera-controls">
                <button type="button" class="btn btn-secondary" onclick="startCamera()" id="startCameraBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                    </svg>
                    Start Camera
                </button>
                <button type="button" class="btn btn-primary" onclick="capturePhoto()" id="captureBtn" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Capture Photo
                </button>
                <button type="button" class="btn btn-ghost" onclick="stopCamera()" id="stopCameraBtn" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                    Stop Camera
                </button>
            </div>
        `;

        // Reset file input
        document.getElementById('imageInput').value = '';

        // Reset upload area
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.innerHTML = `
            <input type="file" id="imageInput" accept="image/*" onchange="handleFileSelect(event)" hidden>
            <label for="imageInput" class="upload-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span class="upload-text">Click to upload or drag and drop</span>
                <span class="upload-hint">PNG, JPG, JPEG up to 10MB</span>
            </label>
            <div id="imagePreview" class="image-preview"></div>
        `;

        // Switch back to file upload mode
        currentUploadMode = 'file';
        uploadArea.style.display = 'block';
        cameraArea.style.display = 'none';

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.tab-btn').classList.add('active');

        // Re-attach event listeners
        setupDragAndDrop();
        
        // Clear previous results
        const resultsContent = document.getElementById('resultsContent');
        resultsContent.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <p>No analysis yet</p>
                <small>Upload an image to get started</small>
            </div>
        `;
        
        // Ensure any remaining loading states are cleared
        const loadingElements = document.querySelectorAll('.loading-overlay');
        loadingElements.forEach(el => el.remove());
        document.body.style.overflow = '';

        // Reset button to disabled state (no file selected)
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `
            <span>Analyze Image</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;

    } catch (error) {
        hideLoading();
        showNotification(error.message || 'Analysis failed. Please try again.', 'error');
        console.error('Upload error:', error);

        // Reset button
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `
            <span>Analyze Image</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;
    }
}

// Switch between file upload and camera mode
function switchUploadMode(mode) {
    currentUploadMode = mode;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-btn').classList.add('active');

    // Show/hide appropriate sections
    const uploadArea = document.getElementById('uploadArea');
    const cameraArea = document.getElementById('cameraArea');

    if (mode === 'file') {
        uploadArea.style.display = 'block';
        cameraArea.style.display = 'none';
        stopCamera();
    } else {
        uploadArea.style.display = 'none';
        cameraArea.style.display = 'block';
        // Reset file input
        removeImage();
    }
}

// Start camera
async function startCamera() {
    try {
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        };

        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.getElementById('cameraStream');
        videoElement.srcObject = cameraStream;

        // Update button visibility
        document.getElementById('startCameraBtn').style.display = 'none';
        document.getElementById('captureBtn').style.display = 'inline-flex';
        document.getElementById('stopCameraBtn').style.display = 'inline-flex';

        showNotification('Camera started successfully', 'success');
    } catch (error) {
        console.error('Camera error:', error);
        showNotification('Failed to access camera. Please check permissions.', 'error');
    }
}

// Stop camera
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;

        const videoElement = document.getElementById('cameraStream');
        videoElement.srcObject = null;

        // Update button visibility
        document.getElementById('startCameraBtn').style.display = 'inline-flex';
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('stopCameraBtn').style.display = 'none';
    }
}

// Capture photo from camera
function capturePhoto() {
    const videoElement = document.getElementById('cameraStream');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
        if (blob) {
            // Create a File object from the blob
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            selectedFile = file;

            // Get data URL for preview
            currentImageUrl = canvas.toDataURL('image/jpeg');

            // Stop camera first
            stopCamera();

            // Show preview in camera area
            const cameraView = document.getElementById('cameraView');
            cameraView.innerHTML = `
                <img src="${currentImageUrl}" alt="Captured" style="width: 100%; border-radius: 8px;">
                <button class="remove-image" onclick="retakePhoto()" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            `;

            // Enable analyze button - use setTimeout to ensure DOM is ready
            setTimeout(() => {
                const analyzeBtn = document.getElementById('analyzeBtn');
                if (analyzeBtn) {
                    analyzeBtn.disabled = false;
                    console.log('Analyze button enabled after photo capture');
                } else {
                    console.error('Analyze button not found!');
                }
            }, 100);

            showNotification('Photo captured successfully!', 'success');
        } else {
            console.error('Failed to convert canvas to blob');
            showNotification('Failed to capture photo. Please try again.', 'error');
        }
    }, 'image/jpeg', 0.95);
}

// Retake photo
function retakePhoto() {
    selectedFile = null;
    currentImageUrl = null;
    document.getElementById('analyzeBtn').disabled = true;

    // Reset camera view
    const cameraView = document.getElementById('cameraView');
    cameraView.innerHTML = `
        <video id="cameraStream" autoplay playsinline></video>
        <canvas id="cameraCanvas" style="display: none;"></canvas>
    `;

    // Restart camera
    startCamera();
}

// Trigger election
async function triggerElection() {
    try {
        showNotification('Triggering leader election...', 'info');
        const result = await api.triggerElection();
        showNotification(`Election triggered on node ${result.node_id}! Check status for updates.`, 'success');

        // Refresh status after a delay
        setTimeout(() => {
            showDistributedStatus();
        }, 2000);
    } catch (error) {
        showNotification('Failed to trigger election: ' + error.message, 'error');
        console.error('Election error:', error);
    }
}


// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeStatusModal();
    }
});

// Auto-refresh distributed status every 30 seconds when modal is open
let statusRefreshInterval = null;

document.getElementById('statusModal').addEventListener('transitionend', function() {
    if (this.classList.contains('active')) {
        statusRefreshInterval = setInterval(() => {
            if (this.classList.contains('active')) {
                showDistributedStatus();
            }
        }, 30000);
    } else {
        if (statusRefreshInterval) {
            clearInterval(statusRefreshInterval);
            statusRefreshInterval = null;
        }
    }
});
