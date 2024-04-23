import './style.css'

var base64String
var server
var dev = true

if (dev == true){
  server = "http://127.0.0.1:5000"
}
else{
  server = "google.com"
}

var hash_route = "cos473/get_image_hash/"
var validate_route = "cos473/image_vault_query/"
var read_all_route = "cos473/image_vault_read_all/"

// Add event listeners to trigger functions on button clicks
document.getElementById('main-button').addEventListener("click", validateNFT)
document.getElementById('main-button2').addEventListener("click", readAllNFTs)

// Add event listener to check for change in image file upload
document.getElementById('uploadInput').addEventListener('change', function(event) {
  const file = event.target.files[0]; // Get the uploaded file
  const reader = new FileReader();
  reader.onload = function(event) {
    const blob = new Blob([event.target.result], { type: file.type }); // Convert the image to Blob
    // Read the blob as a data URL
    const dataURLReader = new FileReader();
    dataURLReader.onload = function() {
      base64String = dataURLReader.result; // Get the base64 encoded string
      console.log("Base64:", base64String); // Log the base64 encoded string
    };
    dataURLReader.readAsDataURL(blob);
  };
  reader.readAsArrayBuffer(file); // Read the uploaded file as an ArrayBuffer
});

// private function used to hash given image using python PIL 
async function setImageHash() {
  console.log("gate 2", base64String)
  try {
      const response = await fetch(`${server}/${hash_route}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(base64String)
      });
      if (!response.ok) {
          throw new Error("Failed to upload image.");
      }

      const data = await response.json();
      const imageHash = data.image_hash;
      console.log("Image Hash:", imageHash);
      return imageHash
  } catch (error) {
      console.error("Error creating NFT:", error);
      return ""
  }
}

// public function used to validate image based on given upload
async function validateNFT() {

  // call private helper to hash image with python PIL
  const image_hash = await setImageHash()

  try {
      const response = await fetch(`${server}/${validate_route}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(image_hash)
      });

      if (!response.ok) {
          throw new Error("Failed to proceed with validation process");
      }

      const data = await response.json();
      const validation_status = data.value;
      console.log("Image Hash:", validation_status);
      return validation_status
  } catch (error) {
      console.error("Error creating NFT:", error);
      return ""
  }
}

// public function to read all NFTS in authenticated collection
async function readAllNFTs() {
    try {
        const response = await fetch(`${server}/${read_all_route}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error("Failed to proceed with validation process");
        }
        const data = await response.json();
        const validated_image_hash_list = data.values;
        console.log("Image Hash:", validated_image_hash_list);
        return validated_image_hash_list
    } catch (error) {
        console.error("Error creating NFT:", error);
        return ""
    }
}