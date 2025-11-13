// API Service Layer

class SkinIAAPI {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.apiKey = null;
    }

    // Set API key
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, key);
    }

    // Get stored API key
    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        }
        return this.apiKey;
    }

    // Clear API key
    clearApiKey() {
        this.apiKey = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
    }

    // Get headers with API key
    getHeaders(isFormData = false) {
        const headers = {
            'X-API-Key': this.getApiKey(),
            'ngrok-skip-browser-warning': 'true'  // Skip ngrok interstitial page
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/healthz`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Health check error:', error);
            throw error;
        }
    }

    // Validate API key
    async validateApiKey(apiKey) {
        try {
            const response = await fetch(`${this.baseURL}/healthz`, {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey
                }
            });

            return response.ok;
        } catch (error) {
            console.error('API key validation error:', error);
            return false;
        }
    }

    // Upload image for analysis
    async analyzeImage(file, framework = 'pytorch') {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const endpoint = framework === 'pytorch'
                ? '/v1/analyze-pytorch'
                : '/v1/analyze';

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `Upload failed: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Image analysis error:', error);
            throw error;
        }
    }

    // Check analysis status
    async getAnalysisStatus(requestId) {
        try {
            const response = await fetch(`${this.baseURL}/v1/status/${requestId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                // Try to parse error as JSON, fallback to text
                let errorMessage = `Status check failed: ${response.status}`;
                try {
                    const error = await response.json();
                    errorMessage = error.detail || errorMessage;
                } catch (e) {
                    const text = await response.text();
                    if (text.includes('ngrok')) {
                        errorMessage = 'Ngrok interstitial page detected - retrying...';
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    // Poll for analysis completion
    async pollForResult(requestId, onProgress) {
        let attempts = 0;
        let consecutiveErrors = 0;

        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                attempts++;

                try {
                    const status = await this.getAnalysisStatus(requestId);
                    consecutiveErrors = 0; // Reset error count on success

                    if (onProgress) {
                        onProgress(status, attempts);
                    }

                    if (status.status === 'completed') {
                        clearInterval(interval);
                        resolve(status);
                    } else if (status.status === 'failed') {
                        clearInterval(interval);
                        reject(new Error(status.error_message || 'Analysis failed'));
                    } else if (attempts >= CONFIG.MAX_POLL_ATTEMPTS) {
                        clearInterval(interval);
                        reject(new Error('Analysis timeout - please try again'));
                    }
                } catch (error) {
                    consecutiveErrors++;
                    console.warn(`Status check attempt ${attempts} failed (${consecutiveErrors} consecutive errors):`, error.message);

                    // Only fail after 5 consecutive errors or max attempts
                    if (consecutiveErrors >= 5 || attempts >= CONFIG.MAX_POLL_ATTEMPTS) {
                        clearInterval(interval);
                        reject(error);
                    }
                    // Otherwise, retry on next interval
                }
            }, CONFIG.STATUS_POLL_INTERVAL);
        });
    }

    // Get distributed system status
    async getDistributedStatus() {
        try {
            const response = await fetch(`${this.baseURL}/v1/distributed/status`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 503) {
                    return {
                        enabled: false,
                        message: 'Distributed system not enabled'
                    };
                }
                throw new Error(`Status fetch failed: ${response.status}`);
            }

            const data = await response.json();
            return { enabled: true, ...data };
        } catch (error) {
            console.error('Distributed status error:', error);
            throw error;
        }
    }

    // Get hardware info
    async getHardwareInfo() {
        try {
            const response = await fetch(`${this.baseURL}/v1/hardware`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Hardware info failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Hardware info error:', error);
            throw error;
        }
    }

    // Register new client
    async register(name, email = null) {
        try {
            const response = await fetch(`${this.baseURL}/v1/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    name: name,
                    email: email
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `Registration failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Trigger election
    async triggerElection() {
        try {
            const response = await fetch(`${this.baseURL}/v1/distributed/trigger-election`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Election trigger failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Election trigger error:', error);
            throw error;
        }
    }

    // Run mutex demo
    async runMutexDemo() {
        try {
            const response = await fetch(`${this.baseURL}/v1/distributed/critical-section-demo`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Mutex demo failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Mutex demo error:', error);
            throw error;
        }
    }
}

// Create global API instance
const api = new SkinIAAPI();
