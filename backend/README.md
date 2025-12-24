# DASH Voice Engine - Backend

This is the Python-powered Flask backend for the **DASH** automotive dashboard. It provides the core intelligence for voice command recognition and natural language parsing.

## 🎙️ Purpose

The backend handles the computationally intensive task of processing raw audio stream from the frontend, converting it to text using the Google Web Speech API, and mapping recognized phrases to specific dashboard actions or navigation routes.

## 🛠️ Tech Stack

- **Server**: Flask 2.0.1
- **CORS**: Flask-CORS (for secure communication with Next.js)
- **Speech-to-Text**: SpeechRecognition (utilizing Google Web Speech API)
- **Audio Processing**: Pydub (required for converting various audio formats)
- **Production Server**: Gunicorn

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- **FFmpeg**: Required for audio processing and conversion.
  - *Windows*: `choco install ffmpeg` or download from [ffmpeg.org](https://ffmpeg.org/)
  - *MacOS*: `brew install ffmpeg`
  - *Linux*: `sudo apt install ffmpeg`

### Installation

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate the environment**:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000` by default.

## 🛣️ API Endpoints

- `GET /api/test`: Connection diagnostic tool.
- `POST /api/voice-command`: Accepts multipart form-data with an `audio` file. Returns a JSON object with the recognized command and the corresponding dashboard route.

## 📁 Directory Structure

- `app.py`: Main server logic and command parsing rules.
- `requirements.txt`: Python package dependencies.
- `temp/`: (Auto-generated) Temporary storage for processing audio files.

---

Part of the **DASH** Intelligent Dashboard suite.
