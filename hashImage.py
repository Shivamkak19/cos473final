"""
HashImage class that takes a JPEG image as input
generates a SHA-256 hash
"""

import hashlib
import base64
from io import BytesIO
from PIL import Image
from PIL.ExifTags import TAGS
## GPT recos 
import cv2
import hashlib
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
import requests
import numpy as np


class hashImage:
    # Return image metadata as a dictionary
    def get_image_metadata(self, image_path):
        with Image.open(BytesIO(base64.b64decode(image_path))) as img:
            metadata = img.getexif()
            if metadata is not None:
                # Decode metadata into dictionary
                return {TAGS.get(tag): value for tag, value in metadata.items() if tag in TAGS}
            return {}
    
    # Generate SHA-256 hash for a given metadata dictionary
    def hash_metadata(self, metadata):
        metadata_string = str(metadata).encode('utf-8')
        sha256 = hashlib.sha256()
        sha256.update(metadata_string)
        return sha256.hexdigest()
    
    # Combine the previous two functions for simple functionality
    def generate_metadata_hash(self, image_path):
        return self.hash_metadata(self.get_image_metadata(image_path))
    


# Step 1: Load the image and compute its hash
def hash_image(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)  # Read the image
    if image is None:
        raise ValueError("Image could not be read.")
    image_bytes = image.tobytes()  # Convert image to bytes
    sha256_hash = hashlib.sha256()
    sha256_hash.update(image_bytes)
    return sha256_hash.digest()  # Return the hash of the image

# Step 2: Generate RSA key pair
def generate_rsa_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()
    return private_key, public_key

# Step 3: Sign the hash of the image
def sign_data(private_key, data):
    signature = private_key.sign(
        data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return signature

# Step 4: Serialize public key to PEM format
def serialize_public_key(public_key):
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem.decode('utf-8')

# Step 5: Send data to the server
def send_to_server(public_key, signature, server_url):
    response = requests.post(server_url, json={
        'public_key': public_key,
        'signature': signature.hex()  # Send signature as hex string
    })
    return response

# Usage
image_hash = hash_image('path_to_your_image.jpg')
private_key, public_key = generate_rsa_key_pair()
signature = sign_data(private_key, image_hash)
public_key_pem = serialize_public_key(public_key)
server_url = 'http://your_server_endpoint'
response = send_to_server(public_key_pem, signature, server_url)
    




