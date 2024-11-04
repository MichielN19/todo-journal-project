const dateDisplay = document.querySelector(".current-date-h1");
const timeDisplay = document.querySelector(".current-time-h2");



function UpdateTime() {
    const options = { weekday: "long", day: "numeric", month: "long" };
    const today = new Date();

    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    const seconds = String(today.getSeconds()).padStart(2, "0");

    const currentTime = `${hours}:${minutes}:${seconds}`;
    const formattedDate = today.toLocaleDateString("en-GB", options);

    dateDisplay.innerHTML = formattedDate;
    timeDisplay.innerHTML = currentTime;
}

setInterval(UpdateTime, 1000);


// Function to save checkbox states to Local Storage
function saveCheckboxStates() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    localStorage.setItem(checkbox.id, checkbox.checked);
    console.log("saves the data");
  });
}

// Function to load checkbox states from Local Storage
function loadCheckboxStates() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    const savedState = localStorage.getItem(checkbox.id);
    if (savedState !== null) {
      checkbox.checked = savedState === 'true';
    }
  });
}

// Attach event listener to the checkboxes to save their states
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', saveCheckboxStates);
});

// Load checkbox states on page load
document.addEventListener('DOMContentLoaded', loadCheckboxStates);
