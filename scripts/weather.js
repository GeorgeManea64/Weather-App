document.addEventListener("DOMContentLoaded", () => {
    const weatherCard = document.getElementById("weather-card");
    const cityName = document.getElementById("city-name");
    const temperature = document.getElementById("temperature");
    const skyCondition = document.getElementById("sky-condition");
    const humidity = document.getElementById("humidity");
    const forecastContainer = document.getElementById("forecast");
    const loader = document.getElementById("loader");

    const PEXELS_API_KEY = "QOGz3xiVDAXPC5FrH5meL7dOvJRcqTj6zZGWGMJLwBAzbXtnWofCrtpA";

    async function fetchWeather(city) {
        try {
            loader.style.display = "block";
            weatherCard.style.display = "none";

            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                console.error("City not found");
                return;
            }

            const { latitude, longitude } = geoData.results[0];

            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
            );
            const weatherData = await weatherResponse.json();

            updateWeatherUI(city, weatherData);
            fetchCityImage(city, weatherData.current_weather.weathercode);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        } finally {
            loader.style.display = "none";
        }
    }

    function updateWeatherUI(city, data) {
        cityName.textContent = city;
        temperature.textContent = `Temperature: ${data.current_weather.temperature}°C`;
        skyCondition.textContent = `Condition: ${getWeatherDescription(data.current_weather.weathercode)}`;
        humidity.textContent = `Humidity: N/A`;

        weatherCard.style.display = "block";
        displayForecast(data.daily);
        updateFavoriteButton(city);
    }

    async function fetchCityImage(city, weatherCode) {
        const weatherCondition = getWeatherDescription(weatherCode).toLowerCase();
        const query = `${city} ${weatherCondition}`;

        try {
            const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            const data = await response.json();

            if (data.photos.length > 0) {
                document.body.style.backgroundImage = `url(${data.photos[0].src.landscape})`;
            }
        } catch (error) {
            console.error("Error fetching city image:", error);
        }
    }

    function getWeatherDescription(code) {
        const descriptions = {
            0: "Clear Sky",
            1: "Mainly Clear",
            2: "Partly Cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Rime Fog",
            51: "Light Drizzle",
            53: "Moderate Drizzle",
            55: "Dense Drizzle",
            61: "Light Rain",
            63: "Moderate Rain",
            65: "Heavy Rain",
            71: "Light Snow",
            73: "Moderate Snow",
            75: "Heavy Snow",
            95: "Thunderstorm"
        };
        return descriptions[code] || "Unknown";
    }

    function displayForecast(dailyData) {
        forecastContainer.innerHTML = "<h3>5-Day Forecast</h3>";
        for (let i = 0; i < 5; i++) {
            const forecastItem = document.createElement("p");
            forecastItem.textContent = `Day ${i + 1}: ${dailyData.temperature_2m_max[i]}°C / ${dailyData.temperature_2m_min[i]}°C`;
            forecastContainer.appendChild(forecastItem);
        }
    }

    window.getWeatherForCity = (city) => {
        fetchWeather(city);
    };
});
