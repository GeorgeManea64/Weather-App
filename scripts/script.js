document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("city-search");
    const suggestionsList = document.getElementById("suggestions");
    const favoritesList = document.getElementById("favorites-list");

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    function showFavorites() {
        favoritesList.innerHTML = "";
        if (favorites.length === 0) return;

        favorites.forEach(city => {
            const li = document.createElement("li");
            li.textContent = city;
            li.addEventListener("click", () => {
                searchInput.value = city;
                getWeatherForCity(city);
                favoritesList.style.display = "none";
            });
            favoritesList.appendChild(li);
        });

        favoritesList.style.display = "block";
    }

    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();
        suggestionsList.innerHTML = "";
        favoritesList.style.display = "none";

        if (query.length < 3) return;

        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`);
            const data = await response.json();

            if (!data.results) return;

            data.results.forEach((city) => {
                const li = document.createElement("li");
                li.textContent = `${city.name}, ${city.country}`;
                li.addEventListener("click", () => {
                    searchInput.value = city.name;
                    getWeatherForCity(city.name);
                    suggestionsList.style.display = "none";
                });
                suggestionsList.appendChild(li);
            });

            suggestionsList.style.display = "block";
        } catch (error) {
            console.error("Error fetching city data:", error);
        }
    });

    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim() === "") {
            showFavorites();
        }
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target)) {
            suggestionsList.style.display = "none";
            favoritesList.style.display = "none";
        }
    });

    window.updateFavoriteButton = function (city) {
        const btn = document.getElementById("favorite-btn");
        if (!btn) return;

        if (favorites.includes(city)) {
            btn.textContent = "💔";
            btn.title = "Remove from favorites";
        } else {
            btn.textContent = "❤️";
            btn.title = "Add to favorites";
        }

        btn.onclick = () => {
            const index = favorites.indexOf(city);
            if (index !== -1) {
                favorites.splice(index, 1);
            } else {
                favorites.push(city);
            }
            localStorage.setItem("favorites", JSON.stringify(favorites));
            updateFavoriteButton(city);
        };
    };
});