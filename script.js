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
  const emailInput = document.getElementById("emailInput");
  const toggleEye = document.getElementById("toggleEye");

  const serverUrl = "https://f7fd1ac9e420.ngrok-free.app";

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
  const file = input.files[0];
  const email = emailInput.value.trim();

  if (!file || !email || !email.includes("@")) {
    alert("Valid email and image required.");
    input.value = ''; // Clear input on error
    return;
  }

  // Only allow specific image types
  const allowedTypes = ["image/jpeg", "image/png", "image/bmp"];
  if (!allowedTypes.includes(file.type)) {
    alert("Only JPG, PNG, or BMP files are allowed.");
    input.value = '';
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/, '') + '-' + new Date().getMilliseconds();
  const fileName = `${email} ${timestamp}.${file.name.split('.').pop()}`; // keep original extension

  const formData = new FormData();
  formData.append("imageFile", file, fileName);

  fetch(`${serverUrl}/upload`, {
    method: "POST",
    body: formData,
  })
    .then(res => {
      if (!res.ok) throw new Error("Upload failed");
      return res.text();
    })
    .then(result => {
      console.log("Upload successful:", result);
      input.value = ''; // Clear input after upload
      alert("Image uploaded successfully!");
    })
    .catch(err => {
      console.error("Error uploading:", err);
      input.value = ''; // Clear input on error
      alert("Error uploading image.");
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
