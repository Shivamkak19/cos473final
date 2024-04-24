from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import base64
import imagehash
from io import BytesIO
import os

import base64
from web3 import Web3
from dotenv import load_dotenv

# packages import for cryptography
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes

load_dotenv()


# from hashImage import hashImage

# hasher = hashImage()

INFURA_KEY = os.getenv("INFURA_KEY")
METAMASK_PRIVATE_KEY = os.getenv("METAMASK_PRIVATE_KEY")
METAMASK_PUBLIC_KEY = os.getenv("METAMASK_PUBLIC_KEY")
IMAGE_VAULT_ADDRESS = os.getenv("IMAGE_VAULT_CONTRACT_ADDRESS")
IMAGE_VAULT_ABI = os.getenv("IMAGE_VAULT_CONTRACT_ABI")

# print("Infura: %s\n Metamask public: %s\n Metamask private: %s\n" % 
    #   (INFURA_KEY, METAMASK_PUBLIC_KEY, METAMASK_PRIVATE_KEY)
    #   )

w3 = Web3(Web3.HTTPProvider(f'https://sepolia.infura.io/v3/{INFURA_KEY}'))

your_address = Web3.to_checksum_address(METAMASK_PUBLIC_KEY)

your_private_key = METAMASK_PRIVATE_KEY

address = Web3.to_checksum_address(IMAGE_VAULT_ADDRESS)
image_vault_contract = w3.eth.contract(address=address, abi=IMAGE_VAULT_ABI)

val = image_vault_contract.functions.getAllTextValues().call()

# print("TESTING:", val)
# print(type(val))

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
    # print("GATE 10")

    image_base64 = request.json

    # remove "........base64,"
    image_base64 = image_base64.split("base64,",1)[1]

    # print(image_base64)

    if not isBase64(image_base64):
        # print("error: invalid image provided")
        return jsonify({"error": "No image data provided"})

    im_bytes = base64.b64decode(image_base64)   # im_bytes is a binary image
    im_file = BytesIO(im_bytes)  # convert image to file-like object
    img = Image.open(im_file)   # img is now PIL Image object

    # Create instance of hasher
    # metadata = hasher.get_image_metadata(image_base64)
    # print(metadata)
    # print(hasher.hash_metadata(metadata))
    # print()

    # Compute the image hash
    image_hash = imagehash.average_hash(img)
    # image_hash = hasher.generate_metadata_hash(image_base64)

    ret = {
        "image_blob": image_base64,
        "image_hash": str(image_hash)
    }

    return jsonify(ret)

@app.route("/cos473/image_vault_read_all/", methods=["POST"])
def query_image_vault():
    ret = {
        "values" : image_vault_contract.functions.getAllTextValues().call()
    }

    return jsonify(ret)

@app.route("/cos473/image_vault_query/", methods=["POST"])
def read_all_image_vault():

    image_hash_query = request.json

    if type(image_hash_query) != str:
        ret = {
            "status": "FAIL: not an image hash",
            "value" :  False
        }
    else:
        ret = {
            "status": "valid string submitted",
            "value" : image_vault_contract.functions.hasText(image_hash_query).call()
        }

    return jsonify(ret)



# Helper functions for unsigning signature and deserializing public key
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
    

@app.route("/cos473/image_vault_mint/", methods = ["POST"])
def image_vault_validate_mint():
    #   input schema
    # {
    #      "public_key": "...",
    #      "signature": "..."
    # }

    request_args = request.json
    public_key_pem = request_args["public_key"]
    signature = request_args["signature"]

    # Deserialize public key
    public_key = deserialize_public_key(public_key_pem)

    # Unsign signature to retrieve image hash
    original_hash = unsign_signature(public_key, signature)

    # ##################################################################
    # ##################################################################
    # Assumption: an invalid signature will produce an original_hash
    # that does not map to a meaningful image
    # Thus, it is okay to mint to the contract 
    # in excess even for invalid signatures

    if original_hash:
        # user is authorized, proceed to mint NFT
        image_vault_contract.functions.createNFT(original_hash).call()
        ret = {
            "status": True,
        }
    else:
        ret = {
            "status": False,
        }
    
    return jsonify(ret)

              

if __name__ == "__main__":
    app.run()
