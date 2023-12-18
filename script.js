const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY ="1bfd5e1cd29a5f16b8cc042ee624d752";

const createWeatherCard = (cityName, weatherItem, index)=>{
    if(index === 0){    //main weather
        return `<div class="current-details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="//openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else{ //5day weather
        return `<li class="cards">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h2>
                <img src="//openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
    
}

const getWeatherDetails = (cityName,lat,lon)=>{
    const WEATHER_API_URL =`//api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res=> res.json()).then(data=>{
       
        //fetch one forcaste per day
        const uniqueForcastDays =[];
       const fiveDaysForecast = data.list.filter(forcast =>{
            const forcastDate = new Date(forcast.dt_txt).getDate();
            if(!uniqueForcastDays.includes(forcastDate)){
                return uniqueForcastDays.push(forcastDate);
            }
        });

        //clear previous data
        cityInput.value = "";
        currentWeatherDiv.innerHTML="";
        weatherCardsDiv.innerHTML = "";

        //adding to Html DOM
        fiveDaysForecast.forEach((weatherItem, index)=>{
            if(index===0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index));
            } else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index));
            }  
        });

    }).catch(()=>{
        alert("An error occured while fetching the weather forecast!");
    });
}

const getCityCoordinates = ()=>{
    const cityName =cityInput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL =`//api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(GEOCODING_API_URL).then(res=>res.json()).then(data=>{
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const {name, lat, lon} = data[0];
        getWeatherDetails(name,lat,lon);
    }).catch(()=>{
        alert("An error occured while fetching the cordinates!");
    });
}

const getUserCoordinates =()=>{
    navigator.geolocation.getCurrentPosition(
        position=>{
            const {latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL= `//api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            //getting city name from coordinates using reverse geocording
            fetch(REVERSE_GEOCODING_URL).then(res=>res.json()).then(data=>{
                const {name} = data[0];
                getWeatherDetails(name,latitude, longitude);
            }).catch(()=>{
                alert("An error occured while fetching the city!");
            });
        },
        error=>{
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.")
            }
        }
    );
}
locationButton.addEventListener('click',getUserCoordinates);
searchButton.addEventListener('click',getCityCoordinates);
cityInput.addEventListener("keyup", e=> e.key === "Enter" && getCityCoordinates());
