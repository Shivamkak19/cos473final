
from flask import Flask, request, jsonify
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes

app = Flask(__name__)

# Function to deserialize the public key
def deserialize_public_key(pem):
    public_key = serialization.load_pem_public_key(pem.encode('utf-8'))
    return public_key

# Function to unsign the signature
def unsign_signature(public_key, signature):
    try:
        # Decrypt signature to get the original hash (unsign)
        original_hash = public_key.decrypt(
            bytes.fromhex(signature),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return original_hash.hex()
    except Exception as e:
        print(f"Decryption failed: {e}")
        return None

@app.route('/unsign', methods=['POST'])
def unsign():
    data = request.json
    public_key_pem = data['public_key']
    signature = data['signature']

    public_key = deserialize_public_key(public_key_pem)
    original_hash = unsign_signature(public_key, signature)

    if original_hash:
        return jsonify({'message': 'Signature decrypted successfully!', 'original_hash': original_hash}), 200
    else:
        return jsonify({'message': 'Signature decryption failed!'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)