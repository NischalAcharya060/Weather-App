import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faCloudSun, faCloudRain, faSnowflake, faWind, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Typography, TextField, CircularProgress, Grid, Card, CardContent, Switch, FormControlLabel, IconButton, Tooltip } from '@mui/material';
import './Weather.css';

const Weather = () => {
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit

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
        if (location.lat && location.lon && !searchQuery) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=eefe7d9d5a2caef30480922620b18596&units=${unit}`
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
    }, [location, searchQuery, unit]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&appid=eefe7d9d5a2caef30480922620b18596&units=${unit}`
            );
            setWeatherData(response.data);
        } catch (error) {
            console.error('Error fetching searched weather data', error);
        } finally {
            setLoading(false);
        }
    };

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
        return weatherIcons[iconCode] || faSun;
    };

    const handleUnitChange = () => {
        setUnit(unit === 'metric' ? 'imperial' : 'metric');
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    if (loading) {
        return (
            <div className="weather-card loading">
                <CircularProgress />
                <Typography variant="body1">Loading...</Typography>
            </div>
        );
    }

    if (!weatherData) {
        return (
            <div className="weather-card">
                <Typography variant="body1">No weather data available</Typography>
            </div>
        );
    }

    const currentIconCode = weatherData.weather[0].icon;
    const currentIconComponent = getWeatherIcon(currentIconCode);

    return (
        <Card className="weather-card sky-background">
            <CardContent>
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={6} textAlign="center">
                        <Typography variant="h5" component="h1" gutterBottom>
                            Weather in {weatherData.name}
                        </Typography>
                        <div className="weather-icon">
                            <FontAwesomeIcon icon={currentIconComponent} size="3x" />
                        </div>
                        <Typography variant="body1" className="temperature">
                            Temperature: {weatherData.main.temp} °{unit === 'metric' ? 'C' : 'F'}
                        </Typography>
                        <Typography variant="body1" className="weather-description">
                            Weather: {weatherData.weather[0].description}
                        </Typography>
                        <Typography variant="body1">Humidity: {weatherData.main.humidity} %</Typography>
                        <Typography variant="body1">
                            Wind Speed: {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
                        </Typography>
                        <Typography variant="body1" className="current-time" gutterBottom>
                            Current Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} textAlign="center">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Search for a city"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                endAdornment: (
                                    <Tooltip title="Search">
                                        <IconButton onClick={handleSearch} color="primary">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </IconButton>
                                    </Tooltip>
                                ),
                            }}
                        />
                        <FormControlLabel
                            control={<Switch checked={unit === 'imperial'} onChange={handleUnitChange} />}
                            label={unit === 'metric' ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
                            style={{ marginTop: 10 }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default Weather;
