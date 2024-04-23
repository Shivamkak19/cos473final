import './style.css'

// var Web3 = require('web3');
require('dotenv').config();
console.log(process.env);


var base64String
var server
var dev = true

if (dev == true){
  server = "http://127.0.0.1:5000"
}
else{
  server = "google.com"
}

var route = "cos473/get_image_hash/"

// Contract address and ABI
var contractAddress = process.env.IMAGE_VAULT_CONTRACT_ADDRESS;
var abi = process.env.IMAGE_VAULT_CONTRACT_ABI;

// Initialize web3
const network = process.env.ETHEREUM_NETWORK;
var web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`,
  ),
);

// Initialize contract instance
var contract = new web3.eth.Contract(abi, contractAddress);

// Function to validate image
async function validateImage(image_hash_query) {
    try {
        const result = await contract.methods.hasText(image_hash_query).call();
        console.log("Image Validation Result:", result);
    } catch (error) {
        console.error("Error validating image:", error);
    }
}

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


document.getElementById('main-button').addEventListener("click", setImageHash)


async function setImageHash() {
  console.log("gate 2", base64String)

  try {
      const response = await fetch(`${server}/${route}`, {
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

      // Call createNFT function with image hash
      // createNFT(imageHash);
  } catch (error) {
      console.error("Error creating NFT:", error);
  }
}

async function validateNFT() {


}

async function readAllNFTs() {
  // Your existing readAllNFTs function code here
}