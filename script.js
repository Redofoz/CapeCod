/*
  This is your site JavaScript code - you can add interactivity!
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
  console.log("Console Log Activated 🌎");

  const uploadBtn = document.getElementById("uploadBtn");
  const cameraBtn = document.getElementById("cameraBtn");
  const uploadInput = document.getElementById("uploadInput");
  const cameraInput = document.getElementById("cameraInput");
  const passwordInput = document.getElementById("passwordInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const passwordMessage = document.getElementById("passwordMessage");
  const emailInput = document.getElementById("emailInput")

  const serverUrl = "https://1e78553d22ce.ngrok-free.app";

  // Utilities
  function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:T]/g, '-').replace(/\..+/, '') + '-' + now.getMilliseconds();
  }

  function strToUint8(str) {
    return new TextEncoder().encode(str);
  }

  function uint8ToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }

  // Main image handler
  async function handleImageUpload(input) {
    if (input.id === "uploadInput") {
    alert("Picture uploaded successfully!");
    } else if (input.id === "cameraInput") {
    alert("Picture taken successfully!");
    }
  const file = input.files[0];
  const email = emailInput.value.trim();

  if (!file || !email || !email.includes("@")) {
    alert("Valid email and image required.");
    return;
  }



  const timestamp = getTimestamp();
  const baseName = `${email} ${timestamp}`;

  const key = crypto.getRandomValues(new Uint8Array(16)); // 128-bit key
  const iv = crypto.getRandomValues(new Uint8Array(12));  // GCM IV

  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-GCM" }, true, ["encrypt"]);
  const imageData = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, imageData);

  // Combine IV + encrypted data into one file
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  const encryptedBlob = new Blob([combined], { type: "application/octet-stream" });

  // Export the key as Base64
  const exportedKey = await crypto.subtle.exportKey("raw", cryptoKey);
  const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  const base64IV = btoa(String.fromCharCode(...iv));

  // Create key file
  const keyContent = `Encryption Key (Base64): ${base64Key}\nIV (Base64): ${base64IV}`;
  const keyBlob = new Blob([keyContent], { type: "text/plain" });

  // Prepare FormData
  const formData = new FormData();
  formData.append("encryptedFile", encryptedBlob, `${baseName}.bin`);
  formData.append("keyFile", keyBlob, `${baseName}.txt`);

  fetch(`${serverUrl}/upload`, {
    method: "POST",
    body: formData,
  })
    .then(res => {
      if (!res.ok) throw new Error("Upload failed");
      return res.text();
    })
    .then(result => console.log("Upload successful:", result))
    .catch(err => console.error("Error uploading:", err));
    .finally(() => {
    // Reset so the same file triggers change next time
    input.value = "";
  });
}

  // Events
  uploadBtn.addEventListener("click", () => uploadInput.click());
  cameraBtn.addEventListener("click", () => cameraInput.click());

  uploadInput.addEventListener("change", () => {
    if (uploadInput.files.length > 0) {
      handleImageUpload(uploadInput);
    }
  });
  
  cameraInput.addEventListener("change", () => {
    if (cameraInput.files.length > 0) {
      handleImageUpload(cameraInput);
    }
  });

  uploadBtn.classList.add("locked");
  cameraBtn.classList.add("locked");

 unlockBtn.addEventListener("click", function () {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !email.includes("@")) {
    passwordMessage.textContent = "Please enter a valid email address.";
    passwordMessage.style.display = "block";
    return;
  }

  fetch(`${serverUrl}/check-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'allowed') {
        uploadBtn.classList.remove("locked");
        cameraBtn.classList.remove("locked");
        uploadBtn.classList.add("unlocked");
        cameraBtn.classList.add("unlocked");

        passwordInput.style.display = "none";
        unlockBtn.style.display = "none";
        emailInput.style.display = "none";
        passwordMessage.style.display = "none";

        // 👁️ Hides the eye toggle icon too:
        toggleEye.style.display = "none";
      } else {
        passwordMessage.textContent = "Incorrect password.";
        passwordMessage.style.display = "block";
      }
    })
    .catch(err => {
      console.error("Password check failed:", err);
      passwordMessage.textContent = "Server error.";
      passwordMessage.style.display = "block";
    });
});

function togglePassword() {
  const input = document.getElementById("passwordInput");
  const eye = document.getElementById("toggleEye");

  if (input.type === "password") {
    input.type = "text";
    eye.textContent = "🙈";
  } else {
    input.type = "password";
    eye.textContent = "👁️";
  }
}
