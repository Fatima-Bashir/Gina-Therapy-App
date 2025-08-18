# GinaAI - Intelligent Conversational Assistant

<!-- @author: fatima bashir -->

![GinaAI Logo](https://via.placeholder.com/150x150/d946ef/ffffff?text=GinaAI)

**GinaAI** is a modern, full-stack conversational AI assistant built with React and Node.js. It features voice input, text-to-speech responses, and a beautiful, responsive user interface.

## ✨ Features

- 🗣️ **Voice Input**: Speak naturally using Web Speech API
- 🔊 **Text-to-Speech**: Listen to AI responses with natural voice synthesis
- 💬 **Smart Chat Interface**: Beautiful, modern chat UI with real-time messaging
- 🎨 **Modern Design**: Built with React and TailwindCSS for a sleek experience
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🔄 **Real-time**: Instant messaging with loading indicators and animations
- 🎯 **Easy Integration**: Placeholder system for AI model integration (Ava-Fusion™, GPT, etc.)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- A modern web browser with microphone support

### Installation

1. **Clone or download the project**
   ```bash
   # If you have git installed
   git clone <repository-url>
   cd GinaAI
   ```

2. **Install dependencies**
   ```bash
   # Option 1: Use the root package.json script
   npm run install-all
   
   # Option 2: Install manually
   cd backend
   npm install
   cd ../frontend
   npm install
   cd ..
   ```

### 🖥️ Running the Application (Windows)

#### Development Mode (Recommended)
Double-click `start-dev.bat` or run in PowerShell:
```powershell
.\start-dev.bat
```

This will:
- Install dependencies if needed
- Start the backend server on http://localhost:5000
- Start the frontend development server on http://localhost:3000
- Open both in separate command windows

#### Production Mode
Double-click `start-prod.bat` or run in PowerShell:
```powershell
.\start-prod.bat
```

#### Manual Startup
If you prefer to run servers manually:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

### 🐧 Running on Linux/Mac

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 📋 Usage

1. **Open your browser** and navigate to http://localhost:3000
2. **Read the introduction** on the home page
3. **Click "Start Chatting with Gina"** to begin
4. **Type messages** or **click the microphone button** to use voice input
5. **Listen to responses** - Gina will automatically speak her replies
6. **Navigate between pages** using the navigation buttons

### Voice Features

- **🎤 Voice Input**: Click the microphone button and speak your message
- **🔊 Auto Speech**: AI responses are automatically spoken aloud
- **🛑 Stop Speaking**: Click the stop button to cancel ongoing speech
- **👂 Listening Indicator**: Visual feedback when the app is listening

## 🏗️ Project Structure

```
GinaAI/
├── backend/                 # Node.js Express server
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Main server file
│   └── [.env]              # Environment variables (not included)
├── frontend/               # React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main App component
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # TailwindCSS configuration
│   └── postcss.config.js  # PostCSS configuration
├── package.json           # Root package.json with scripts
├── start-dev.bat          # Windows development startup
├── start-prod.bat         # Windows production startup
└── README.md              # This file
```

## 🔧 Configuration

### AI Model Integration

The backend includes a placeholder for AI model integration. To connect your AI model:

1. **Edit `backend/server.js`**
2. **Replace the `generatePlaceholderResponse` function**
3. **Add your API keys to environment variables**

Example integration locations:
- OpenAI GPT API
- Ava-Fusion™ API
- Custom AI endpoints

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
OPENAI_API_KEY=your-openai-key-here
AVA_FUSION_API_KEY=your-ava-fusion-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Speech Recognition** - Voice input handling
- **Web Speech API** - Text-to-speech functionality

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📱 Browser Support

- **Chrome** (Recommended) - Full voice feature support
- **Edge** - Full voice feature support  
- **Firefox** - Limited voice features
- **Safari** - Limited voice features

*Note: Voice features require HTTPS in production or localhost for development.*

## 🔍 Troubleshooting

### Common Issues

**1. Servers won't start**
- Ensure Node.js and npm are installed
- Check if ports 3000 and 5000 are available
- Run `npm run install-all` to ensure dependencies are installed

**2. Voice features don't work**
- Grant microphone permissions in your browser
- Use Chrome or Edge for best voice support
- Ensure you're running on localhost or HTTPS

**3. Chat responses don't appear**
- Check if the backend server is running on port 5000
- Look for errors in the browser console
- Verify the frontend can connect to the backend

**4. PowerShell execution policy errors**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🚧 Development Status

GinaAI is now **powered by OpenAI's GPT-4o** for intelligent conversations. Future enhancements planned:

- [x] Integration with OpenAI GPT-4o
- [ ] Integration with additional AI models (Ava-Fusion™, etc.)
- [ ] Conversation history persistence
- [ ] User authentication
- [ ] Custom voice selection
- [ ] Conversation export
- [ ] Multi-language support

## 🤝 Contributing

This is a development project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or feature requests:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all dependencies are properly installed
4. Verify both servers are running correctly

---

**Built with ❤️ by Fatima Bashir**

*Enjoy chatting with GinaAI! 🤖✨* 