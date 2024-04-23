import './style.css';

const base64StringList = [];
const server = "http://127.0.0.1:5000"; // Change to your server URL
const hashRoute = "cos473/get_image_hash/";
const validateRoute = "cos473/image_vault_query/";
const readAllRoute = "cos473/image_vault_read_all/";

// Function to handle image upload
document.getElementById('uploadInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const base64String = event.target.result.split(',')[1];
        base64StringList.push(base64String);
        document.querySelector('.custom-file-label').innerText = file.name;
    };
    reader.readAsDataURL(file);
});

// Function to validate uploaded image
document.getElementById('validateImageButton').addEventListener('click', async function() {
    if (base64StringList.length === 0) {
        alert("Please upload an image first.");
        return;
    }

    const imageHashList = await setImageHash(base64StringList);
    console.log("Image Hash List:", imageHashList);

    // Validate each image hash
    for (const imageHash of imageHashList) {
        await validateNFT(imageHash);
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
async function setImageHash(base64StringList) {
    const imageHashList = [];
    for (const base64String of base64StringList) {
        try {
            const response = await fetch(`${server}/${hashRoute}`, {
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
            imageHashList.push(data.image_hash);
        } catch (error) {
            console.error("Error hashing image:", error);
            imageHashList.push("");
        }
    }
    return imageHashList;
}

// Function to validate the image hash
async function validateNFT(imageHash) {
    try {
        const response = await fetch(`${server}/${validateRoute}`, {
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
    } catch (error) {
        console.error("Error validating image:", error);
    }
}

// Function to read all NFTs
async function readAllNFTs() {
    try {
        const response = await fetch(`${server}/${readAllRoute}`, {
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
