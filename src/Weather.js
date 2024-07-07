import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faCloudSun, faCloudRain, faSnowflake, faWind } from '@fortawesome/free-solid-svg-icons';
import './Weather.css';

const Weather = () => {
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Get current location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            setLocation({
                                lat: position.coords.latitude,
                                lon: position.coords.longitude,
                            });
                        },
                        (error) => {
                            console.error("Error fetching location", error);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        }
                    );
                } else {
                    console.error("Geolocation is not supported by this browser.");
                }
            } catch (error) {
                console.error("Error fetching location", error);
            }
        };

        fetchWeather();
    }, []);

    useEffect(() => {
        if (location.lat && location.lon) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=eefe7d9d5a2caef30480922620b18596&units=metric`
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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const weatherIcons = {
        '01d': faSun,     // clear sky day
        '01n': faSun,     // clear sky night
        '02d': faCloudSun, // few clouds day
        '02n': faCloudSun, // few clouds night
        '03d': faCloud,   // scattered clouds day
        '03n': faCloud,   // scattered clouds night
        '04d': faCloud,   // broken clouds day
        '04n': faCloud,   // broken clouds night
        '09d': faCloudRain, // shower rain day
        '09n': faCloudRain, // shower rain night
        '10d': faCloudRain, // rain day
        '10n': faCloudRain, // rain night
        '11d': faCloudRain, // thunderstorm day
        '11n': faCloudRain, // thunderstorm night
        '13d': faSnowflake, // snow day
        '13n': faSnowflake, // snow night
        '50d': faWind,     // mist day
        '50n': faWind      // mist night
    };

    const getWeatherIcon = (iconCode) => {
        return weatherIcons[iconCode] || faSun; // default to sun icon if no match found
    };

    if (loading) {
        return <div className="weather-card loading">Loading...</div>;
    }

    if (!weatherData) {
        return <div className="weather-card">No weather data available</div>;
    }

    const iconCode = weatherData.weather[0].icon;
    const IconComponent = getWeatherIcon(iconCode);

    return (
        <div className="weather-card">
            <h1>Weather in {weatherData.name}</h1>
            <div className="weather-icon">
                <FontAwesomeIcon icon={IconComponent} size="2x" />
            </div>
            <p className="temperature">Temperature: {weatherData.main.temp} °C</p>
            <p className="weather-description">Weather: {weatherData.weather[0].description}</p>
            <p>Humidity: {weatherData.main.humidity} %</p>
            <p>Wind Speed: {weatherData.wind.speed} m/s</p>
            <p className="current-time">Current Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    );
};

export default Weather;
