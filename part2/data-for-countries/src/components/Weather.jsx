import { useState, useEffect } from "react";
import axios from "axios";

const Weather = ({ capital, latlng }) => {
  const [weather, setWeather] = useState(null);
  const api_key = import.meta.env.VITE_WEATHER_KEY;

  useEffect(() => {
    if (!capital || capital.length === 0) return;

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${capital[0]}&units=metric&appid=${api_key}`,
      )
      .then((response) => {
        setWeather(response.data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  }, [capital, api_key]);

  if (!weather) {
    return null;
  }

  const iconCode = weather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return (
    <div>
      <h3>Weather in {capital[0]}</h3>
      <p>temperature {weather.main.temp} Celsius</p>
      <img src={iconUrl} alt={weather.weather[0].description} />
      <p>wind {weather.wind.speed} m/s</p>
    </div>
  );
};

export default Weather;
