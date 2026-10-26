
let isFahrenheit = false;
let weatherData = null;

async function getWeather() {
    let city = document.getElementById("city").value.trim();
    let message = document.getElementById("message");

    if (city === "") {
        message.innerText = "Please enter a city name!";
        return;
    }
    message.innerText = "Loading weather...";

    try {
        
        let locationURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) + "&count=1&language=en&format=json";

        let locationResponse = await fetch(locationURL);
        let locationData = await locationResponse.json();

        if (!locationData.results) {
            message.innerText = "City not found!";
            return;
        }

        let latitude = locationData.results[0].latitude;
        let longitude = locationData.results[0].longitude;
        let cityName = locationData.results[0].name;

       
        let weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
            `&longitude=${longitude}` +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
            "&forecast_days=3&timezone=auto";

        let weatherResponse = await fetch(weatherURL);
        weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            throw new Error("Weather data not available");
        }

        localStorage.setItem("city", cityName);

        document.getElementById("cityName").innerText = cityName;

        showWeather();

        message.innerText = "";

    } catch (error) {
        message.innerText = "Something went wrong. Please try again.";
    }
}

function showWeather() {
    if (weatherData === null) {
        return;
    }

    let current = weatherData.current;
    let daily = weatherData.daily;

    let temp = current.temperature_2m;
    let feels = current.apparent_temperature;

    if (isFahrenheit) {
        temp = (temp * 9 / 5) + 32;
        feels = (feels * 9 / 5) + 32;
    }

    let unit = isFahrenheit ? "°F" : "°C";

    document.getElementById("temperature").innerText =
        Math.round(temp) + unit;

    document.getElementById("condition").innerText =
        getCondition(current.weather_code);

    document.getElementById("humidity").innerText =
        current.relative_humidity_2m;

    document.getElementById("wind").innerText =
        current.wind_speed_10m;

    document.getElementById("feelsLike");

    let forecast = document.getElementById("forecast");
    forecast.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        let max = daily.temperature_2m_max[i];
        let min = daily.temperature_2m_min[i];

        if (isFahrenheit) {
            max = (max * 9 / 5) + 32;
            min = (min * 9 / 5) + 32;
        }

        let dayName = i === 0 ? "Today" :
            new Date(daily.time[i] + "T12:00:00")
                .toLocaleDateString("en-IN", { weekday: "short" });

        let card = document.createElement("div");
        card.className = "day";

        card.innerHTML = `
            <h3>${dayName}</h3>
            <p>${getCondition(daily.weather_code[i])}</p>
            <p>Max: ${Math.round(max)}${unit}</p>
            <p>Min: ${Math.round(min)}${unit}</p>
        `;

        forecast.appendChild(card);
    }
}

function getCondition(code) {
    if (code === 0) {
        return "Clear Sky ☀️";
    } else if (code <= 3) {
        return "Cloudy ☁️";
    } else if (code <= 48) {
        return "Foggy 🌫️";
    } else if (code <= 67 || (code >= 80 && code <= 82)) {
        return "Rainy 🌧️";
    } else if (code <= 77 || code === 85 || code === 86) {
        return "Snowy ❄️";
    } else {
        return "Thunderstorm ⛈️";
    }
}

function changeUnit() {
    isFahrenheit = !isFahrenheit;

    if (weatherData !== null) {
        showWeather();
    }
}


window.onload = function() {
    let savedCity = localStorage.getItem("city");

    if (savedCity) {
        document.getElementById("city").value = savedCity;
        getWeather();
    }
};
