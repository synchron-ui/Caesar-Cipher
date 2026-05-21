import os
import random
import string
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ALPHABET = string.ascii_lowercase + string.ascii_uppercase + string.digits + " "
SECRET_PASSWORD = os.environ.get("SECRET_PASSWORD", "python_rocks")


def encrypt_logic(message):
    shift = random.randint(1, len(ALPHABET) - 1)
    encrypted_text = ""
    for char in message:
        if char in ALPHABET:
            new_idx = (ALPHABET.find(char) + shift) % len(ALPHABET)
            encrypted_text += ALPHABET[new_idx]
        else:
            encrypted_text += char
    return encrypted_text, shift


def decrypt_logic(message, shift_key, password_attempt):
    if password_attempt != SECRET_PASSWORD:
        return None, "Invalid Password"

    decrypted_text = ""
    try:
        shift_key = int(shift_key)
        for char in message:
            if char in ALPHABET:
                new_idx = (ALPHABET.find(char) - shift_key) % len(ALPHABET)
                decrypted_text += ALPHABET[new_idx]
            else:
                decrypted_text += char
        return decrypted_text, None
    except ValueError:
        return None, "Invalid Shift Key"


@app.route('/api/healthz', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/api/encrypt', methods=['POST'])
def encrypt():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400

    text = data.get('text', '')
    if not isinstance(text, str) or not text.strip():
        return jsonify({'error': '"text" must be a non-empty string'}), 400

    encrypted_text, shift = encrypt_logic(text)
    return jsonify({'encrypted_text': encrypted_text, 'shift': shift})


@app.route('/api/decrypt', methods=['POST'])
def decrypt():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400

    text = data.get('text', '')
    shift = data.get('shift', None)
    password = data.get('password', '')

    if not isinstance(text, str) or not text.strip():
        return jsonify({'error': '"text" must be a non-empty string'}), 400
    if shift is None:
        return jsonify({'error': '"shift" is required'}), 400

    decrypted_text, error = decrypt_logic(text, shift, password)
    if error:
        status = 403 if error == "Invalid Password" else 400
        return jsonify({'error': error}), status

    return jsonify({'decrypted_text': decrypted_text})


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', '8080')),
        debug=False,
    )
