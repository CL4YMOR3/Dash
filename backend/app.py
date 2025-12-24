from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from pydub import AudioSegment
import os
import tempfile
import logging
import re
import time
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize speech recognizer
recognizer = sr.Recognizer()

# Campus locations for navigation
CAMPUS_LOCATIONS = sorted([
    "gate 1", "admin", "mba block", "ites building", "management block",
    "d block", "e block", "boys hostel", "girls hostel", "canteen", 
    "library", "cafe"
], key=len, reverse=True)
# Default start location
DEFAULT_START = "gate 1"

# Command mapping
VALID_COMMANDS = {
    # Main pages
    "destination": "/destination",
    "destinations": "/destination",
    "select destination": "/destination",
    "car conditions": "/car-conditions",
    "car condition": "/car-conditions",
    "vehicle status": "/car-conditions", 
    "vehicle condition": "/car-conditions",
    "navigation": "/navigation",
    "navigate": "/navigation",
    "start navigation": "/navigation",
    "home": "/",
    "dashboard": "/",
    "main screen": "/",
    # Music actions
    "play music": "action:play_music",
    "pause music": "action:pause_music",
    "stop music": "action:pause_music",
    "next song": "action:next_track",
    "previous song": "action:previous_track",
    "skip track": "action:next_track",
    "next track": "action:next_track",
    "previous track": "action:previous_track",
    "music": "/music",
    "music player": "/music",
    "open music": "/music",
    # System
    "increase volume": "action:volume_up",
    "decrease volume": "action:volume_down",
    "mute": "action:mute",
    "unmute": "action:unmute",
    # Other actions
    "check battery": "/car-conditions",
    "check speed": "/car-conditions",
    "show map": "/navigation",
    "show weather": "/",
    "show route": "/navigation",
}

# Stopwords for simple keyword extraction
STOPWORDS = {"the", "a", "an", "to", "me", "please", "and", "of", "in", "on", "for", "is", "show", "take", "go", "find"}

def extract_keywords(text: str) -> list:
    """
    Extract keywords by removing stopwords.
    """
    words = re.findall(r"\w+", text.lower())
    return [w for w in words if w not in STOPWORDS]

# Improved matching logic with priority for navigation commands
def match_command(text: str):
    text_lower = text.lower()
    
    # 1. First check specifically for navigation phrases
    for location in CAMPUS_LOCATIONS:
        # More specific pattern for navigation commands
        pattern = rf"(?:go to|navigate to|take me to|show me|find)\s+(?:the\s+)?{re.escape(location)}\b"
        if re.search(pattern, text_lower):
            logger.info(f"Navigation match found for location: {location}")
            route = f"/navigation?start={DEFAULT_START.replace(' ', '%20')}&end={location.replace(' ', '%20')}"
            return {
                "command": f"navigate to {location}", 
                "route": route, 
                "startLocation": DEFAULT_START, 
                "location": location, 
                "isNavigation": True,
                "timestamp": int(time.time() * 1000)  # Add timestamp for state tracking
            }
    
    # 2. Exact phrase matching (longest first) for other commands
    for cmd in sorted(VALID_COMMANDS.keys(), key=lambda x: len(x), reverse=True):
        if cmd in text_lower:
            # If this is a navigation command mapping to /destination, convert to full nav
            if cmd.startswith("go to "):
                dest = cmd.replace("go to ", "")
                route = f"/navigation?start={DEFAULT_START.replace(' ', '%20')}&end={dest.replace(' ', '%20')}"
                return {"command": cmd, "route": route, "startLocation": DEFAULT_START, "location": dest, "isNavigation": True}
            return {"command": cmd, "route": VALID_COMMANDS[cmd]}
    
    # 3. Keyword extraction for more flexible matching
    keywords = extract_keywords(text)
    
    # 4. Fuzzy match on keywords and n-grams
    candidates = keywords.copy()
    words = text_lower.split()
    for i in range(len(words)):
        for j in range(i+1, min(i+5, len(words)+1)):
            candidates.append(" ".join(words[i:j]))

    best_match = None
    best_score = 0.0
    for phrase in candidates:
        for cmd in VALID_COMMANDS.keys():
            score = SequenceMatcher(None, phrase, cmd).ratio()
            if score > best_score:
                best_score = score
                best_match = cmd

    if best_match and best_score >= 0.6:
        # Handle fuzzy nav commands starting with 'go to '
        if best_match.startswith("go to "):
            dest = best_match.replace("go to ", "")
            route = f"/navigation?start={DEFAULT_START.replace(' ', '%20')}&end={dest.replace(' ', '%20')}"
            return {"command": best_match, "route": route, "startLocation": DEFAULT_START, "location": dest, "isNavigation": True}
        return {"command": best_match, "route": VALID_COMMANDS[best_match]}

    return None

@app.route('/api/voice-command', methods=['POST'])
def process_voice_command():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        # Save upload
        input_temp = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1])
        input_path = input_temp.name
        input_temp.close()
        audio_file.save(input_path)

        # Convert to WAV
        output_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        output_path = output_temp.name
        output_temp.close()

        try:
            audio = AudioSegment.from_file(input_path)
            audio.export(output_path, format='wav')

            with sr.AudioFile(output_path) as source:
                recorded = recognizer.record(source)
                text = recognizer.recognize_google(recorded).lower()
                logger.info(f"Recognized text: {text}")

                matched = match_command(text)
                if matched:
                    logger.info(f"Command matched: {matched}")
                    resp = {"success": True, "text": text, "command": matched['command'], "route": matched['route']}
                    if matched.get('isNavigation'):
                        resp.update({
                            "startLocation": matched['startLocation'], 
                            "location": matched['location'], 
                            "isNavigation": True,
                            "timestamp": matched.get('timestamp', int(time.time() * 1000))
                        })
                    return jsonify(resp)

                logger.warning(f"No command match found for: {text}")
                return jsonify({"success": False, "text": text, "error": "No valid command found"})

        except sr.UnknownValueError:
            return jsonify({"success": False, "error": "Could not understand audio"})
        except sr.RequestError as e:
            return jsonify({"success": False, "error": f"Speech recognition error: {e}"})
        except Exception as e:
            logger.error(f"Processing error: {e}")
            return jsonify({"success": False, "error": f"Processing error: {str(e)}"})
        finally:
            if os.path.exists(input_path): os.remove(input_path)
            if os.path.exists(output_path): os.remove(output_path)

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({"status": "Backend is running"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)