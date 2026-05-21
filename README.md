# Caesar Cipher Web

A modern, interactive web application that implements a classic Caesar cipher with a high-fidelity visual experience. The project is split into a React-based frontend and a Python Flask backend API.

## 🚀 Features

- **Encryption**: Automatically generates a random shift key to encode your plaintext messages securely.
- **Decryption**: Requires both the ciphertext, the shift key, and a secret password to decode messages back to plaintext.
- **Engaging UI**: Built with React, Tailwind CSS, and Framer Motion for smooth animations and transitions.
- **Interactive Cipher Wheel**: A visual representation of the cipher that rotates dynamically as shifts are applied.

## 📂 Project Structure

```text
Caesarcipher/
├── caesar-cipher-project/
│   ├── artifacts/
│   │   ├── api-server/    # Python Flask backend
│   │   └── web/           # React + Vite frontend
└── cipher_wheel_ideas.txt # Future UI/UX improvement concepts
```

## 🛠️ Getting Started

### 1. Start the Backend API
The backend handles the encryption and decryption logic.

```bash
cd caesar-cipher-project/artifacts/api-server
pip install -r requirements.txt
python app.py
```
*The server will start on `http://localhost:8080`*

### 2. Start the Frontend
The frontend is a Vite + React application.

```bash
cd caesar-cipher-project/artifacts/web
npm install
npm run dev
```
*The application will be available at `http://localhost:5173`*

## 🔮 Upcoming Features (Roadmap)

We are actively working on making the Caesar Cipher Wheel more interactive and satisfying to use. Planned features include:

- **Interactive Drag-to-Spin**: Manually rotate the inner wheel to update the shift value, feeling like a physical combination lock.
- **"Roulette" Spin**: The wheel will spin rapidly for a few seconds before snapping to the random shift key during encryption.
- **Real-time Typing Highlights**: As you type, the corresponding letters on the inner and outer rings will glow.
- **Mechanical Audio Feedback**: Satisfying "clicks" or "ticks" as the wheel rotates.
- **Matrix-style Character Scrambling**: Rapidly scrambling characters during the generation phase.
- **Hover Physics & 3D Tilt**: The wheel tilts dynamically towards your cursor for a tangible presence on the screen.

## 🔐 Configuration

The backend is currently configured with a default hardcoded password for decryption. You can update this by editing the `SECRET_PASSWORD` variable inside `api-server/app.py`.
