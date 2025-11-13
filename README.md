# Skin IA - Frontend Interface

A modern, beautiful web interface for the Skin IA distributed skin disease analysis system.

## Features

- **User Authentication**: Login with API key
- **Image Upload**: Drag-and-drop or click to upload skin images
- **Real-time Analysis**: Upload images and get AI-powered skin disease predictions
- **Distributed System Monitoring**: View distributed system status, nodes, and load balancing
- **Analysis History**: Track your previous analyses with timestamps
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## Quick Start

### Prerequisites

- A running Skin IA API (distributed or standalone)
- ngrok tunnel (for remote access) or localhost for development
- Any modern web browser

### Setup

1. **Configure API URL**

   Open `assets/js/config.js` and update the `API_BASE_URL`:

   ```javascript
   const CONFIG = {
       // For ngrok deployment
       API_BASE_URL: 'https://f065b38b0b9a.ngrok-free.app',

       // OR for local development
       // API_BASE_URL: 'http://localhost:8000',
       ...
   };
   ```

2. **Launch the Frontend**

   Simply open `index.html` in your web browser:

   ```bash
   # Windows
   start index.html

   # macOS
   open index.html

   # Linux
   xdg-open index.html
   ```

   Or serve it with a simple HTTP server:

   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js (with http-server)
   npx http-server -p 8080
   ```

   Then navigate to: http://localhost:8080

3. **Register or Login**

   **New users**: Click "Register here" to create a new account. You'll receive a unique API key.

   **Existing users**: Use your API key to login. For testing, use:
   - **API Key**: `default-key`

## Usage

### Analyzing Images

1. **Login** with your API key
2. **Upload an image** by clicking or dragging into the upload area
3. **Click "Analyze Image"** to submit for analysis
4. **Wait for results** - the system will poll automatically
5. **View results** including:
   - Detected skin condition
   - Confidence score
   - Top 5 predictions
   - Medical recommendations

### Viewing System Status

Click the **"System Status"** button in the navbar to view:
- Current node information
- Leader/follower status
- Alive nodes count
- Tasks processed
- Load distribution across nodes
- Lamport clock and election state

### Analysis History

Your recent analyses are saved locally and displayed in the **"Recent Analyses"** section. Click any history item to view the full results again.

## Supported Skin Conditions

The AI model can detect 20 different skin conditions:

1. Acne
2. Actinic Carcinoma
3. Atopic Dermatitis
4. Benign Tumors
5. Bullous Disease
6. Cellulitis
7. Drug Eruptions
8. Eczema
9. Herpes HPV
10. Light Diseases
11. Lupus
12. Melanoma
13. Poison IVY
14. Psoriasis
15. Ringworm
16. Systemic Disease
17. Urticarial Hives
18. Vascular Tumors
19. Vasculitis
20. Viral Infections

## Project Structure

```
frontend/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   └── styles.css      # All styling and responsive design
│   └── js/
│       ├── config.js       # Configuration and constants
│       ├── api.js          # API service layer
│       ├── ui.js           # UI helper functions
│       └── app.js          # Main application logic
└── README.md               # This file
```

## Configuration

### API Settings (config.js)

```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-ngrok-url.ngrok-free.app',
    STATUS_POLL_INTERVAL: 2000,          // Poll every 2 seconds
    MAX_POLL_ATTEMPTS: 60,               // Timeout after 60 attempts
    MAX_FILE_SIZE: 10 * 1024 * 1024,     // 10MB max file size
    SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png']
};
```

### Changing the ngrok URL

When you deploy with ngrok, you'll get a new URL each time. Update it in two places:

1. **Frontend Config** (`assets/js/config.js`):
   ```javascript
   API_BASE_URL: 'https://YOUR-NEW-NGROK-URL.ngrok-free.app'
   ```

2. That's it! The frontend will now connect to your new ngrok tunnel.

## Features in Detail

### Authentication System
- API key-based authentication
- Secure key storage in localStorage
- Automatic session validation
- Easy logout functionality

### Image Upload
- Drag-and-drop support
- Click to browse files
- Image preview before analysis
- File type and size validation
- Support for JPG, JPEG, and PNG

### Analysis Results
- Color-coded severity indicators
- Confidence score visualization
- Top 5 predictions display
- Medical recommendations
- Analysis metadata (framework, timestamp, ID)

### Distributed System Status
- Real-time node monitoring
- Leader election status
- Load distribution visualization
- Lamport clock synchronization
- Auto-refresh every 30 seconds

### History Management
- Local storage of recent analyses
- Quick access to past results
- Timestamp tracking
- Visual thumbnails

## Troubleshooting

### Cannot connect to API

1. Check that the API is running:
   ```bash
   curl https://your-ngrok-url.ngrok-free.app/healthz
   ```

2. Verify the URL in `config.js` matches your ngrok URL

3. Check browser console for CORS errors

### Invalid API Key

1. Make sure you're using the correct API key
2. For testing, use: `default-key`
3. Contact your administrator for a new key

### Upload fails

1. Check image format (JPG, JPEG, or PNG only)
2. Verify file size is under 10MB
3. Ensure stable internet connection
4. Check API server logs

### Analysis timeout

1. The default timeout is 120 seconds (60 polls × 2s)
2. Check distributed system status for node availability
3. Verify all nodes are healthy
4. Check API server logs for errors

## Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

1. **Use PyTorch endpoint** - 13.6× faster than TensorFlow
2. **Optimize images** - Compress images before upload
3. **Clear history** - Remove old analyses from localStorage periodically
4. **Use modern browsers** - Best performance with latest Chrome/Edge

## Security Notes

- API keys are stored in browser localStorage
- Images are NOT stored on the server
- Analysis results are temporary
- Always use HTTPS in production (ngrok provides this)
- Never share your API key publicly

## Development

### Adding New Features

1. **API Integration**: Add new API calls in `api.js`
2. **UI Components**: Create reusable components in `ui.js`
3. **Application Logic**: Add business logic in `app.js`
4. **Styling**: Update `styles.css` for new components

### Customization

- **Colors**: Modify CSS variables in `:root` (styles.css)
- **Fonts**: Change font family imports in `<head>` (index.html)
- **Logo**: Replace SVG icon in HTML
- **Disease Info**: Update `DISEASE_INFO` in config.js

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/healthz` | GET | Health check and API key validation |
| `/v1/analyze-pytorch` | POST | Upload image for PyTorch analysis |
| `/v1/status/{id}` | GET | Check analysis status and results |
| `/v1/distributed/status` | GET | Get distributed system status |
| `/v1/hardware` | GET | Query available hardware |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Part of the Skin IA project - AI-powered skin disease analysis system.

## Support

For issues or questions:
1. Check this README
2. Review browser console errors
3. Check API server logs
4. Contact your system administrator

---

**Built with ❤️ for the Skin IA project**
