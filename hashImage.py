"""
HashImage class that takes a JPEG image as input
generates a SHA-256 hash
"""

import hashlib
from PIL import Image
from PIL.ExifTags import TAGS


class hashImage:
    # Return image metadata as a dictionary
    def get_image_metadata(self, image_path):
        with Image.open(image_path) as img:
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
    path = "C:\\Users\\Arav\\Pictures\\Camera Roll\\WIN_20240130_15_50_44_Pro.jpg"
    hasher = hashImage()
    metadata = hasher.get_image_metadata(path)
    print(metadata)
    print(hasher.hash_metadata(metadata))
    print(hasher.generate_metadata_hash(path))


