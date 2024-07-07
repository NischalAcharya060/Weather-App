import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Weather = () => {
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            });
        }
    }, []);

    useEffect(() => {
        if (location.lat && location.lon) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=54284c1ca833c8beae11a7a3f462a87e&units=metric`
                    );
                    setWeatherData(response.data);
                } catch (error) {
                    console.error('Error fetching weather data', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [location]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!weatherData) {
        return <div>No weather data available</div>;
    }

    return (
        <div>
            <h1>Weather in {weatherData.name}</h1>
            <p>Temperature: {weatherData.main.temp} °C</p>
            <p>Weather: {weatherData.weather[0].description}</p>
            <p>Humidity: {weatherData.main.humidity} %</p>
            <p>Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
    );
};

export default Weather;
