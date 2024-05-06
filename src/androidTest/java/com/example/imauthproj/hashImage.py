"""
HashImage class that takes a JPEG image as input
generates a SHA-256 hash
"""
from tkinter import filedialog 
from tkinter import *
import hashlib
import base64
from io import BytesIO
from PIL import Image
from PIL.ExifTags import TAGS
import cv2
from scipy.spatial import distance
import numpy as np
import matplotlib.pyplot as plt


class hashImage:
    # Hash image based on pixels
    def generate_pixel_hash(self, image_path):
        image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)  # Read the image
        if image is None:
            raise ValueError("Image could not be read.")
        image_bytes = image.tobytes()  # Convert image to bytes
        sha256_hash = hashlib.sha256()
        sha256_hash.update(image_bytes)
        return sha256_hash.digest()  # Return the hash of the image

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

if __name__ == '__main__':
    root = Tk()
    root.withdraw()

    # Select file name and cleanse it
    path = filedialog.askopenfile().name
    path = path.replace("/", "//")
    hasher = hashImage()
    #print(hasher.hash_metadata(metadata))
    #print(hasher.generate_metadata_hash(path))
    hash = hasher.generate_pixel_hash(path)
    print("hash ", hash)
    #print("signed hash ", hasher.sign_data(hasher.generate_rsa_key_pair()[0], hash))


