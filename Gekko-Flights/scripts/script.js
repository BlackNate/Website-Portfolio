import { location } from "./locationList.js"

// Dropdown Select Option Elements
const departureCityEl = document.getElementById("departure-city")
const destinationCityEl = document.getElementById("destination-city")

// Anchor links Elements
const roundTripEl = document.getElementById("round-trip");
const oneTripEl = document.getElementById("one-trip");
const multiTripEl = document.getElementById("multi-trip");
const tripArray  = [roundTripEl, oneTripEl, multiTripEl];

const tripTypeBookingEL = document.querySelector(".trip-type-booking");


//Prints the location from the locationList.js file
document.addEventListener("DOMContentLoaded", () => {

    if (departureCityEl && destinationCityEl) {
        for (let country in location) {
            location[country].forEach(city => {
                const dapartOption = document.createElement("option");
                const destinationOption = document.createElement("option")

                dapartOption.textContent = `${city}, ${country}`;
                dapartOption.value = city.toLowerCase().replace(/\s+/g, "-");

                destinationOption.textContent = `${city}, ${country}`; 
                destinationOption.value = city.toLowerCase().replace(/\s+/g, "-"); 

                departureCityEl.appendChild(dapartOption)
                destinationCityEl.appendChild(destinationOption)
            })
        } 
    } else {
        console.error("Element with ID 'departure-city' not found.");
    }
});


//Check the current page URL
const currentURL = window.location.pathname   //gets current URL pathname

for (let trip of tripArray) {
    if (currentURL === trip.pathname) {
        trip.style.backgroundColor = "#0477BF";
        trip.style.color = "#F2C36B";
    } else if (currentURL === "/"){
        roundTripEl.style.backgroundColor = "#0477BF";
        roundTripEl.style.color = "#F2C36B";
    }
}


