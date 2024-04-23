import './style.css';

var base64StringList = [];

var dev = true
var host

// Set host based on hosting
if (dev == true){
    host = "http://127.0.0.1:5000";
}
else{
    host = "google.com"
}

var hashRoute = "cos473/get_image_hash/";
var validateRoute = "cos473/image_vault_query/";
var readAllRoute = "cos473/image_vault_read_all/";

// Function to handle image upload
document.getElementById('uploadInput').addEventListener('change', function(event) {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = function(event) {
          const base64String = event.target.result;
          const uploadTime = new Date().toLocaleString(); // Get current time
          displayImage(file.name, base64String); // Display the image
          base64StringList.push({ file, base64String, uploadTime }); // Store the image, base64 string, and upload time
          document.querySelector('.custom-file-label').innerText = "Uploaded images: " + base64StringList.length;
      };
      reader.readAsDataURL(file);
  }
});


// Function to display the uploaded image
function displayImage(fileName, base64String) {
  const imageDiv = document.createElement('div');
  imageDiv.classList.add('uploaded-image');
  imageDiv.innerHTML = `<img src="${base64String}" class="img-fluid" alt="${fileName}">`;
  document.getElementById('uploadedImagesContainer').appendChild(imageDiv);
}

// Function to remove uploaded image from the queue
function removeUploadedImage(index) {
  base64StringList.splice(index, 1);
  const uploadedImagesContainer = document.getElementById('uploadedImagesContainer');
  uploadedImagesContainer.removeChild(uploadedImagesContainer.children[index]);
}

// Function to validate uploaded image
document.getElementById('validateImageButton').addEventListener('click', async function() {
  if (base64StringList.length === 0) {
      alert("Please upload an image first.");
      return;
  }

  const current_len = base64StringList.length
  for (let i = 0; i < current_len; i++) {
    console.log("YO:", i)

      // List elements will be popped from front, so always access at 0 index
      const base64String = base64StringList[0].base64String
      const file = base64StringList[0].file
      const upload_time = base64StringList[0].uploadTime

      const imageHash = await setImageHash(base64String);
      console.log("Image Hash List:", imageHash);

      // Validate each image hash
      const validation_status = await validateNFT(imageHash);
      displayValidationResult(file.name, validation_status, upload_time);

      // Remove the uploaded image from the display
      removeUploadedImage(0);
  }
});

// Function to read all NFTs
document.getElementById('readAllImagesButton').addEventListener('click', async function() {
    const validatedImageHashList = await readAllNFTs();
    console.log("Validated Image Hash List:", validatedImageHashList);

    // Display the list of validated image hashes
    const nftList = document.getElementById('nftList');
    nftList.innerHTML = "";
    validatedImageHashList.forEach((imageHash, index) => {
        const listItem = document.createElement('li');
        listItem.className = "list-group-item";
        listItem.textContent = `NFT ${index + 1}: ${imageHash}`;
        nftList.appendChild(listItem);
    });
});

// Function to hash the uploaded image
async function setImageHash(base64String) {
        try {
            const response = await fetch(`${host}/${hashRoute}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(base64String)
            });
            if (!response.ok) {
                throw new Error("Failed to hash image.");
            }
            const data = await response.json();
            return data.image_hash
        } catch (error) {
            console.error("Error hashing image:", error);
            return ""
        }
}

// Function to validate the image hash
async function validateNFT(imageHash) {
    try {
        const response = await fetch(`${host}/${validateRoute}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageHash)
        });
        if (!response.ok) {
            throw new Error("Failed to validate image.");
        }
        const data = await response.json();
        console.log("Image Validation Result:", data.value);
        return data
    } catch (error) {
        console.error("Error validating image:", error);
        return false
    }
}

// Function to read all NFTs
async function readAllNFTs() {
    try {
        const response = await fetch(`${host}/${readAllRoute}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error("Failed to read all NFTs.");
        }
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error("Error reading all NFTs:", error);
        return [];
    }
}

// Function to display validation result
function displayValidationResult(fileName, status, upload_time) {

  console.log("check status:", status)
  const resultContainer = document.getElementById('validationResults');

  // Create table if it doesn't exist
  if (!document.getElementById('validationTable')) {
      const table = document.createElement('table');
      table.id = 'validationTable';
      table.className = 'table table-bordered mt-3';
      
      // Create table header
      const thead = document.createElement('thead');
      thead.innerHTML = `
          <tr>
              <th scope="col">File Name</th>
              <th scope="col">Upload Time</th>
              <th scope="col">Status</th>
          </tr>
      `;
      table.appendChild(thead);

      // Create table body
      const tbody = document.createElement('tbody');
      tbody.id = 'validationTableBody';
      table.appendChild(tbody);

      resultContainer.appendChild(table);
  }

  // Append validation result to table
  const tbody = document.getElementById('validationTableBody');
  const row = document.createElement('tr');
  row.innerHTML = `
      <td>${fileName}</td>
      <td>${upload_time}</td>
      <td>${status.value ? 'Valid' : 'Invalid'}</td>
  `;
  tbody.appendChild(row);
}
