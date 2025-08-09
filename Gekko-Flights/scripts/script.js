import { location } from "./locationList.js"

document.addEventListener("DOMContentLoaded", () => {
    const departureCityEl = document.getElementById("departure-city")
    const destinationCityEl = document.getElementById("destination-city")

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
