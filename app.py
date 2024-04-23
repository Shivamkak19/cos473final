from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import base64
import imagehash
import io
from io import BytesIO


import base64

def isBase64(sb):
        try:
                if isinstance(sb, str):
                        # If there's any unicode here, an exception will be thrown and the function will return false
                        sb_bytes = bytes(sb, 'ascii')
                elif isinstance(sb, bytes):
                        sb_bytes = sb
                else:
                        raise ValueError("Argument must be string or bytes")
                return base64.b64encode(base64.b64decode(sb_bytes)) == sb_bytes
        except Exception:
                return False

app = Flask(__name__)
CORS(app)

@app.route("/cos473/get_image_hash/", methods=["POST"])
def get_image_hash():
    print("GATE 10")

    image_base64 = request.json

    # remove "........base64,"
    image_base64 = image_base64.split("base64,",1)[1]

    print(image_base64)

    if not isBase64(image_base64):
        print("error: invalid image provided")
        return jsonify({"error": "No image data provided"})

    im_bytes = base64.b64decode(image_base64)   # im_bytes is a binary image
    im_file = BytesIO(im_bytes)  # convert image to file-like object
    img = Image.open(im_file)   # img is now PIL Image object

    # Compute the image hash
    image_hash = imagehash.average_hash(img)

    ret = {
        "image_blob": image_base64,
        "image_hash": str(image_hash)
    }

    return jsonify(ret)

if __name__ == "__main__":
    app.run(debug=True)
