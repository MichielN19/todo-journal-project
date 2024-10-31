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
