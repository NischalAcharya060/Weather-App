import React, { useState, useEffect, useRef, useCallback } from 'react';

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; background: #0a0f1e; min-height: 100vh; color: #fff; overflow-x: hidden; }
  @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
  @keyframes pulse-ring { 0%{transform:scale(0.85);opacity:1} 100%{transform:scale(2.1);opacity:0} }
  @keyframes rain-drop { 0%{transform:translateY(-8px);opacity:0} 50%{opacity:1} 100%{transform:translateY(55px);opacity:0} }
  @keyframes snow-fall { 0%{transform:translateY(-8px) rotate(0deg);opacity:0} 50%{opacity:1} 100%{transform:translateY(55px) rotate(180deg);opacity:0} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes fade-up { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slide-in { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes lightning { 0%,90%,100%{opacity:0} 92%,96%{opacity:1} }
  input::placeholder { color: rgba(255,255,255,0.3); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
`;

const wmoToCondition = (code) => {
    if (code === 0) return 'clear';
    if ([1,2,3].includes(code)) return 'clouds';
    if ([45,48].includes(code)) return 'mist';
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'rain';
    if ([71,73,75,77,85,86].includes(code)) return 'snow';
    if ([95,96,99].includes(code)) return 'thunderstorm';
    return 'clear';
};

const wmoToLabel = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if ([45,48].includes(code)) return 'Foggy';
    if ([51,53,55].includes(code)) return 'Drizzle';
    if ([56,57].includes(code)) return 'Freezing Drizzle';
    if ([61,63,65].includes(code)) return 'Rain';
    if ([66,67].includes(code)) return 'Freezing Rain';
    if ([71,73,75].includes(code)) return 'Snowfall';
    if (code === 77) return 'Snow Grains';
    if ([80,81,82].includes(code)) return 'Rain Showers';
    if ([85,86].includes(code)) return 'Snow Showers';
    if (code === 95) return 'Thunderstorm';
    if ([96,99].includes(code)) return 'Hail Storm';
    return 'Unknown';
};

const CONDITIONS = {
    clear:        { gradient:'linear-gradient(135deg,#0d1b3e 0%,#1a2f5e 50%,#0f3460 100%)', accent:'#f59e0b', accent2:'#fcd34d', label:'Clear' },
    clouds:       { gradient:'linear-gradient(135deg,#1a1f35 0%,#2d3561 50%,#3a3a5c 100%)', accent:'#94a3b8', accent2:'#cbd5e1', label:'Cloudy' },
    rain:         { gradient:'linear-gradient(135deg,#0a0f1e 0%,#1e3a4a 50%,#1a4a6b 100%)', accent:'#38bdf8', accent2:'#7dd3fc', label:'Rainy' },
    snow:         { gradient:'linear-gradient(135deg,#0d1b2a 0%,#1b2a45 50%,#2a3f5f 100%)', accent:'#bae6fd', accent2:'#e0f2fe', label:'Snowy' },
    thunderstorm: { gradient:'linear-gradient(135deg,#08080f 0%,#1a1a2e 40%,#2d1b69 100%)', accent:'#a78bfa', accent2:'#c4b5fd', label:'Stormy' },
    mist:         { gradient:'linear-gradient(135deg,#1a2332 0%,#2a3a4a 50%,#3a4a5a 100%)', accent:'#9ca3af', accent2:'#d1d5db', label:'Misty' },
};

const WeatherIcon = ({ condition, size=80, accent='#f59e0b', accent2='#fcd34d' }) => {
    const s = { width:size, height:size };
    switch(condition) {
        case 'clear': return (
            <svg style={s} viewBox="0 0 80 80" fill="none">
                <defs><radialGradient id={`sg${size}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={accent2}/><stop offset="100%" stopColor={accent} stopOpacity="0.5"/>
                </radialGradient></defs>
                <circle cx="40" cy="40" r="34" fill={accent} fillOpacity="0.08" style={{animation:'pulse-ring 2.5s ease infinite'}}/>
                <circle cx="40" cy="40" r="20" fill={`url(#sg${size})`}/>
                {[0,45,90,135,180,225,270,315].map(a=>(
                    <line key={a} x1={40+26*Math.sin(a*Math.PI/180)} y1={40-26*Math.cos(a*Math.PI/180)}
                          x2={40+33*Math.sin(a*Math.PI/180)} y2={40-33*Math.cos(a*Math.PI/180)}
                          stroke={accent} strokeWidth="3" strokeLinecap="round"/>
                ))}
            </svg>
        );
        case 'clouds': return (
            <svg style={s} viewBox="0 0 80 80" fill="none">
                <ellipse cx="52" cy="50" rx="23" ry="16" fill={accent} fillOpacity="0.45"/>
                <ellipse cx="34" cy="48" rx="20" ry="15" fill={accent} fillOpacity="0.65"/>
                <ellipse cx="43" cy="37" rx="17" ry="14" fill={accent2}/>
            </svg>
        );
        case 'rain': return (
            <svg style={s} viewBox="0 0 80 80" fill="none">
                <ellipse cx="50" cy="30" rx="22" ry="15" fill={accent} fillOpacity="0.4"/>
                <ellipse cx="34" cy="28" rx="18" ry="13" fill={accent} fillOpacity="0.65"/>
                <ellipse cx="42" cy="20" rx="14" ry="12" fill={accent2} fillOpacity="0.9"/>
                {[24,36,48,60].map((x,i)=>(
                    <line key={x} x1={x} y1="48" x2={x-5} y2="66" stroke={accent2} strokeWidth="2.5" strokeLinecap="round"
                          style={{animation:`rain-drop 1.4s ease ${i*0.25}s infinite`}}/>
                ))}
            </svg>
        );
        case 'snow': return (
            <svg style={s} viewBox="0 0 80 80" fill="none">
                <ellipse cx="50" cy="28" rx="22" ry="15" fill={accent} fillOpacity="0.4"/>
                <ellipse cx="34" cy="26" rx="18" ry="13" fill={accent} fillOpacity="0.65"/>
                <ellipse cx="42" cy="18" rx="14" ry="12" fill={accent2} fillOpacity="0.9"/>
                {[26,42,58].map((x,i)=>(
                    <g key={x} style={{animation:`snow-fall 2.2s ease ${i*0.55}s infinite`}}>
                        <circle cx={x} cy="52" r="3.5" fill={accent2}/>
                    </g>
                ))}
            </svg>
        );
        case 'thunderstorm': return (
            <svg style={s} viewBox="0 0 80 80" fill="none">
                <ellipse cx="50" cy="26" rx="22" ry="15" fill={accent} fillOpacity="0.35"/>
                <ellipse cx="34" cy="24" rx="18" ry="13" fill={accent} fillOpacity="0.55"/>
                <ellipse cx="42" cy="16" rx="14" ry="12" fill={accent2} fillOpacity="0.8"/>
                <polyline points="44,36 36,52 44,52 30,70" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="0" y="0" width="80" height="80" fill="#fff" fillOpacity="0.05" rx="4" style={{animation:'lightning 4s ease infinite'}}/>
            </svg>
        );
        default: return (
            <svg style={s} viewBox="0 0 80 80" fill="none">
                <ellipse cx="46" cy="36" rx="28" ry="19" fill={accent} fillOpacity="0.5"/>
                <ellipse cx="32" cy="40" rx="20" ry="15" fill={accent2}/>
            </svg>
        );
    }
};

const StatCard = ({ label, value, icon, accent, delay=0 }) => (
    <div style={{background:'rgba(255,255,255,0.05)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.09)',
        borderRadius:18,padding:'15px 18px',display:'flex',alignItems:'center',gap:13,
        animation:`slide-in 0.5s ease ${delay}s both`,cursor:'default',transition:'all 0.2s'}}
         onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.transform='translateY(-3px)';}}
         onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.transform='translateY(0)';}}
    >
        <div style={{width:42,height:42,borderRadius:12,background:`${accent}22`,border:`1px solid ${accent}40`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>{icon}</div>
        <div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.45)',fontFamily:"'Space Mono',monospace",letterSpacing:1,textTransform:'uppercase'}}>{label}</div>
            <div style={{fontSize:17,fontWeight:600,color:'#fff',marginTop:3}}>{value}</div>
        </div>
    </div>
);

const ForecastRow = ({ day, high, low, condition, precip, accent }) => (
    <div style={{display:'flex',alignItems:'center',gap:12,padding:'11px 18px',borderRadius:14,
        background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',transition:'background 0.2s',cursor:'default'}}
         onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.09)'}
         onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
    >
        <span style={{width:38,fontSize:13,color:'rgba(255,255,255,0.55)',fontFamily:"'Space Mono',monospace",flexShrink:0}}>{day}</span>
        <WeatherIcon condition={condition} size={30} accent={accent} accent2="#fff"/>
        <span style={{fontSize:11,color:'#38bdf8',width:34,flexShrink:0}}>{precip>0?`${precip}mm`:''}</span>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13,color:'rgba(255,255,255,0.45)',minWidth:28}}>{low}°</span>
            <div style={{flex:1,height:5,background:'rgba(255,255,255,0.1)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',background:`linear-gradient(90deg,rgba(255,255,255,0.25),${accent})`,
                    borderRadius:3,width:`${Math.max(10,Math.min(100,(high/45)*100))}%`}}/>
            </div>
            <span style={{fontSize:14,fontWeight:700,color:'#fff',minWidth:28,textAlign:'right'}}>{high}°</span>
        </div>
    </div>
);

const UVGauge = ({ value }) => {
    const pct = Math.min(value/11,1);
    const color = value<=2?'#22c55e':value<=5?'#f59e0b':value<=7?'#f97316':value<=10?'#ef4444':'#a855f7';
    const label = value<=2?'Low':value<=5?'Moderate':value<=7?'High':value<=10?'Very High':'Extreme';
    return (
        <div style={{textAlign:'center'}}>
            <svg width="88" height="52" viewBox="0 0 88 52">
                <path d="M6 46 A38 38 0 0 1 82 46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round"/>
                <path d="M6 46 A38 38 0 0 1 82 46" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${119.4*pct} 119.4`}/>
                <text x="44" y="44" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Outfit">{value}</text>
            </svg>
            <div style={{fontSize:11,color,fontWeight:600,marginTop:-6}}>{label}</div>
        </div>
    );
};

export default function Weather() {
    const [weather, setWeather]               = useState(null);
    const [forecast, setForecast]             = useState([]);
    const [hourly, setHourly]                 = useState([]);
    const [cityName, setCityName]             = useState('');
    const [coords, setCoords]                 = useState(null);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState('');
    const [searchQuery, setSearchQuery]       = useState('');
    const [suggestions, setSuggestions]       = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [unit, setUnit]                     = useState('celsius');
    const [activeTab, setActiveTab]           = useState('now');
    const [currentTime, setCurrentTime]       = useState(new Date());
    const [inputFocused, setInputFocused]     = useState(false);
    const searchTimeout                       = useRef(null);
    const searchWrapperRef                    = useRef(null);

    // ── Inject fonts ──────────────────────────────────────────────────────────
    useEffect(() => {
        const s = document.createElement('style');
        s.textContent = FONTS;
        document.head.appendChild(s);
        return () => document.head.removeChild(s);
    }, []);

    // ── Clock ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // ── Close dropdown on outside click ──────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── FIX 1: wrap fetchWeather in useCallback so it's a stable reference ──
    // This fixes: "React Hook useEffect has a missing dependency: 'fetchWeather'"
    const fetchWeather = useCallback(async (lat, lon) => {
        setLoading(true);
        setError('');
        const isF  = unit === 'fahrenheit';
        const tempU = isF ? 'fahrenheit' : 'celsius';
        const windU = isF ? 'mph' : 'ms';
        try {
            const url =
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,` +
                `wind_speed_10m,wind_direction_10m,surface_pressure,visibility,cloud_cover,uv_index` +
                `&hourly=temperature_2m,weather_code,precipitation_probability,relative_humidity_2m` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max` +
                `&wind_speed_unit=${windU}&temperature_unit=${tempU}&timezone=auto&forecast_days=7`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            const c = data.current;

            setWeather({
                temp:        Math.round(c.temperature_2m),
                feelsLike:   Math.round(c.apparent_temperature),
                humidity:    c.relative_humidity_2m,
                windSpeed:   c.wind_speed_10m,
                windDir:     c.wind_direction_10m,
                pressure:    Math.round(c.surface_pressure),
                visibility:  (c.visibility / 1000).toFixed(1),
                clouds:      c.cloud_cover,
                uvIndex:     Math.round(c.uv_index ?? 0),
                code:        c.weather_code,
                condition:   wmoToCondition(c.weather_code),
                description: wmoToLabel(c.weather_code),
            });

            const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            setForecast(data.daily.time.map((t, i) => ({
                day:       days[new Date(t).getDay()],
                high:      Math.round(data.daily.temperature_2m_max[i]),
                low:       Math.round(data.daily.temperature_2m_min[i]),
                condition: wmoToCondition(data.daily.weather_code[i]),
                precip:    Math.round(data.daily.precipitation_sum[i] ?? 0),
                sunrise:   data.daily.sunrise[i]?.split('T')[1] ?? '--',
                sunset:    data.daily.sunset[i]?.split('T')[1] ?? '--',
                uv:        Math.round(data.daily.uv_index_max[i] ?? 0),
            })));

            const now = new Date();
            setHourly(
                data.hourly.time
                    .map((t, i) => ({
                        time:   t,
                        temp:   Math.round(data.hourly.temperature_2m[i]),
                        code:   data.hourly.weather_code[i],
                        precip: data.hourly.precipitation_probability[i] ?? 0,
                    }))
                    .filter(h => new Date(h.time) >= now)
                    .slice(0, 8)
            );
        } catch {
            setError('Could not load weather. Please try another city.');
        }
        setLoading(false);
    }, [unit]); // unit is the only external variable used inside

    // ── Auto-detect location ──────────────────────────────────────────────────
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    reverseGeocode(lat, lon);
                    setCoords({ lat, lon });
                },
                () => loadCity('Kathmandu', 27.7172, 85.3240)
            );
        } else {
            loadCity('Kathmandu', 27.7172, 85.3240);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // ^ intentionally runs once on mount only; loadCity / reverseGeocode are stable helpers

    // ── Re-fetch when coords or unit changes ──────────────────────────────────
    useEffect(() => {
        if (coords) fetchWeather(coords.lat, coords.lon);
    }, [coords, fetchWeather]); // fetchWeather is now stable via useCallback

    const reverseGeocode = async (lat, lon) => {
        try {
            const r = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const d = await r.json();
            setCityName(d.city || d.locality || d.principalSubdivision || d.countryName || 'Your Location');
        } catch {
            setCityName('Your Location');
        }
    };

    const loadCity = (name, lat, lon) => {
        setCityName(name);
        setCoords({ lat, lon });
    };

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        clearTimeout(searchTimeout.current);
        if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        searchTimeout.current = setTimeout(async () => {
            try {
                const r = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=6&language=en&format=json`
                );
                const d = await r.json();
                const results = d.results ?? [];
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 350);
    };

    const selectSuggestion = (s) => {
        setShowSuggestions(false);
        setSuggestions([]);
        setSearchQuery('');
        loadCity(`${s.name}${s.country ? ', ' + s.country : ''}`, s.latitude, s.longitude);
    };

    const quickSearch = async (name) => {
        try {
            const r = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`
            );
            const d = await r.json();
            if (d.results?.[0]) selectSuggestion(d.results[0]);
        } catch {}
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const condKey      = weather?.condition ?? 'clear';
    const cond         = CONDITIONS[condKey];
    const tempSuffix   = unit === 'celsius' ? '°C' : '°F';
    const windSuffix   = unit === 'celsius' ? 'm/s' : 'mph';
    const today        = forecast[0];
    const windDirLabel = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N'][
        Math.round((weather?.windDir ?? 0) / 22.5)
        ];

    // ── Loading screen ────────────────────────────────────────────────────────
    if (!weather && loading) return (
        <div style={{minHeight:'100vh',background:'#0a0f1e',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20}}>
            <div style={{width:56,height:56,borderRadius:'50%',border:'3px solid rgba(255,255,255,0.08)',borderTop:'3px solid #38bdf8',animation:'spin 0.9s linear infinite'}}/>
            <p style={{color:'rgba(255,255,255,0.4)',fontFamily:'Outfit',fontSize:15}}>Detecting your location…</p>
            <p style={{color:'rgba(255,255,255,0.2)',fontFamily:'Outfit',fontSize:12}}>Powered by Open-Meteo · Free · No API key</p>
        </div>
    );

    return (
        <div style={{minHeight:'100vh',background:cond.gradient,transition:'background 1.2s ease',padding:'24px 16px 48px',fontFamily:'Outfit,sans-serif'}}>
            {/* Ambient blobs */}
            <div style={{position:'fixed',top:-120,right:-120,width:450,height:450,borderRadius:'50%',background:`${cond.accent}18`,filter:'blur(90px)',pointerEvents:'none',zIndex:0,transition:'background 1s'}}/>
            <div style={{position:'fixed',bottom:-160,left:-100,width:520,height:520,borderRadius:'50%',background:`${cond.accent2}0e`,filter:'blur(110px)',pointerEvents:'none',zIndex:0,transition:'background 1s'}}/>

            <div style={{maxWidth:920,margin:'0 auto',position:'relative',zIndex:1}}>

                {/* ── Header ── */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,animation:'fade-up 0.5s ease both'}}>
                    <div>
                        <h1 style={{fontSize:20,fontWeight:800,letterSpacing:-0.5,display:'flex',alignItems:'center',gap:8}}>
                            <span style={{color:cond.accent,fontSize:22}}>⛅</span> WeatherDeck
                        </h1>
                        <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',fontFamily:"'Space Mono',monospace",marginTop:3}}>
                            {currentTime.toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})}
                        </p>
                    </div>
                    <button
                        onClick={() => setUnit(u => u === 'celsius' ? 'fahrenheit' : 'celsius')}
                        style={{background:'rgba(255,255,255,0.07)',border:`1px solid ${cond.accent}44`,borderRadius:50,
                            padding:'9px 20px',color:'#fff',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,transition:'all 0.2s'}}
                        onMouseEnter={e => e.currentTarget.style.background = `${cond.accent}22`}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                    >
                        {unit === 'celsius' ? '°C → °F' : '°F → °C'}
                    </button>
                </div>

                {/* ── Search — z-index:9999 ensures dropdown floats above all cards ── */}
                <div
                    ref={searchWrapperRef}
                    style={{marginBottom:20,animation:'fade-up 0.5s ease 0.08s both',position:'relative',zIndex:9999}}
                >
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>

                        {/* Input + dropdown */}
                        <div style={{flex:'1 1 260px',position:'relative'}}>
                            {/*
                             * FIX 2: Removed duplicate onFocus prop.
                             * Previously there were TWO onFocus handlers on this input.
                             * Merged into a single onFocus that handles both border colour
                             * AND showing the suggestions dropdown.
                             */}
                            <input
                                value={searchQuery}
                                onChange={e => handleSearchInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Escape') setShowSuggestions(false);
                                    if (e.key === 'Enter' && suggestions.length > 0) selectSuggestion(suggestions[0]);
                                }}
                                placeholder="🔍  Search any city worldwide…"
                                style={{
                                    width:'100%',
                                    background:'rgba(255,255,255,0.07)',
                                    border: inputFocused ? `1px solid ${cond.accent}` : '1px solid rgba(255,255,255,0.13)',
                                    boxShadow: inputFocused ? `0 0 0 3px ${cond.accent}22` : 'none',
                                    borderRadius:14,
                                    padding:'13px 18px',
                                    color:'#fff',
                                    fontSize:15,
                                    outline:'none',
                                    fontFamily:'Outfit',
                                    transition:'border 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={() => {
                                    // Single onFocus — sets focus state AND shows dropdown if results exist
                                    setInputFocused(true);
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                onBlur={() => setInputFocused(false)}
                            />

                            {/* Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div style={{
                                    position:'absolute',
                                    top:'calc(100% + 8px)',
                                    left:0,
                                    right:0,
                                    background:'#141c30',
                                    border:`1px solid ${cond.accent}44`,
                                    borderRadius:16,
                                    overflow:'hidden',
                                    zIndex:99999,
                                    boxShadow:`0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)`,
                                    pointerEvents:'auto',
                                }}>
                                    <div style={{padding:'8px 18px 6px',fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'Space Mono',monospace",letterSpacing:1.5,textTransform:'uppercase',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                                        {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} found
                                    </div>
                                    {suggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            onMouseDown={e => { e.preventDefault(); selectSuggestion(s); }}
                                            style={{padding:'12px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:12,
                                                borderBottom: i < suggestions.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                                transition:'background 0.15s'}}
                                            onMouseEnter={e => e.currentTarget.style.background = `${cond.accent}18`}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{fontSize:16}}>📍</span>
                                            <div>
                                                <div style={{fontWeight:600,color:'#fff',fontSize:14}}>{s.name}</div>
                                                <div style={{color:'rgba(255,255,255,0.4)',fontSize:12,marginTop:1}}>
                                                    {[s.admin1, s.country].filter(Boolean).join(', ')}
                                                </div>
                                            </div>
                                            <div style={{marginLeft:'auto',fontSize:11,color:'rgba(255,255,255,0.25)',fontFamily:"'Space Mono',monospace"}}>
                                                {s.latitude?.toFixed(1)}°, {s.longitude?.toFixed(1)}°
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick city chips */}
                        {['London','Tokyo','New York','Dubai','Sydney'].map(c => (
                            <button key={c} onClick={() => quickSearch(c)}
                                    style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:50,
                                        padding:'9px 16px',color:'rgba(255,255,255,0.65)',cursor:'pointer',fontSize:13,transition:'all 0.2s',fontFamily:'Outfit',whiteSpace:'nowrap'}}
                                    onMouseEnter={e => {e.currentTarget.style.background=`${cond.accent}22`;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=`${cond.accent}66`;}}
                                    onMouseLeave={e => {e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.65)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}
                            >{c}</button>
                        ))}
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,
                        padding:'12px 18px',color:'#fca5a5',marginBottom:18,fontSize:14,animation:'fade-up 0.3s ease both'}}>
                        {error}
                    </div>
                )}

                {weather && (
                    <>
                        {/* ── Hero card ── */}
                        <div style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',
                            borderRadius:28,padding:'32px 28px',marginBottom:16,display:'grid',gridTemplateColumns:'1fr auto',
                            gap:16,alignItems:'center',animation:'fade-up 0.5s ease 0.15s both',position:'relative',zIndex:1,overflow:'hidden'}}>
                            <div style={{position:'absolute',right:-70,top:-70,width:300,height:300,borderRadius:'50%',border:`1px solid ${cond.accent}18`,pointerEvents:'none'}}/>
                            <div style={{position:'absolute',right:-40,top:-40,width:200,height:200,borderRadius:'50%',border:`1px solid ${cond.accent}10`,pointerEvents:'none'}}/>
                            <div>
                                <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:4,display:'flex',alignItems:'center',gap:6}}>
                                    <span>📍</span>{cityName}
                                </p>
                                <div style={{display:'flex',alignItems:'flex-end',gap:4}}>
                                    <span style={{fontSize:64,fontWeight:800,lineHeight:1,letterSpacing:-3}}>{weather.temp}</span>
                                    <span style={{fontSize:28,fontWeight:300,color:'rgba(255,255,255,0.5)',paddingBottom:8}}>{tempSuffix}</span>
                                </div>
                                <p style={{fontSize:18,color:'rgba(255,255,255,0.65)',marginTop:4}}>{weather.description}</p>
                                <div style={{display:'flex',gap:18,marginTop:12,flexWrap:'wrap'}}>
                                    <span style={{fontSize:14,color:cond.accent2,fontWeight:600}}>↑ {today?.high??'--'}{tempSuffix}</span>
                                    <span style={{fontSize:14,color:'rgba(255,255,255,0.4)'}}>↓ {today?.low??'--'}{tempSuffix}</span>
                                    <span style={{fontSize:14,color:'rgba(255,255,255,0.4)'}}>Feels {weather.feelsLike}{tempSuffix}</span>
                                </div>
                                <p style={{fontSize:12,color:'rgba(255,255,255,0.25)',fontFamily:"'Space Mono',monospace",marginTop:10}}>
                                    {currentTime.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                                </p>
                            </div>
                            <div style={{textAlign:'center',animation:'float 4s ease-in-out infinite'}}>
                                <WeatherIcon condition={condKey} size={115} accent={cond.accent} accent2={cond.accent2}/>
                                <p style={{fontSize:11,color:cond.accent,fontWeight:700,letterSpacing:2,textTransform:'uppercase',fontFamily:"'Space Mono',monospace",marginTop:8}}>{cond.label}</p>
                            </div>
                        </div>

                        {/* ── Stat cards ── */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:10,marginBottom:16,position:'relative',zIndex:1}}>
                            <StatCard label="Humidity"    value={`${weather.humidity}%`}               icon="💧" accent={cond.accent} delay={0.25}/>
                            <StatCard label="Wind"        value={`${weather.windSpeed} ${windSuffix}`}  icon="💨" accent={cond.accent} delay={0.3}/>
                            <StatCard label="Pressure"    value={`${weather.pressure} hPa`}            icon="📊" accent={cond.accent} delay={0.35}/>
                            <StatCard label="Visibility"  value={`${weather.visibility} km`}           icon="👁️" accent={cond.accent} delay={0.4}/>
                            <StatCard label="Cloud Cover" value={`${weather.clouds}%`}                icon="☁️" accent={cond.accent} delay={0.45}/>
                            <StatCard label="UV Index"    value={weather.uvIndex}                     icon="☀️" accent={cond.accent} delay={0.5}/>
                        </div>

                        {/* ── Sunrise / UV ── */}
                        {today && (
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16,animation:'fade-up 0.5s ease 0.45s both',position:'relative',zIndex:1}}>
                                <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:20,padding:'18px 22px',display:'flex',justifyContent:'space-around'}}>
                                    <div style={{textAlign:'center'}}>
                                        <div style={{fontSize:26}}>🌅</div>
                                        <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:"'Space Mono',monospace",letterSpacing:1,textTransform:'uppercase',marginTop:6}}>Sunrise</div>
                                        <div style={{fontSize:16,fontWeight:600,marginTop:3}}>{today.sunrise}</div>
                                    </div>
                                    <div style={{width:1,background:'rgba(255,255,255,0.08)'}}/>
                                    <div style={{textAlign:'center'}}>
                                        <div style={{fontSize:26}}>🌇</div>
                                        <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:"'Space Mono',monospace",letterSpacing:1,textTransform:'uppercase',marginTop:6}}>Sunset</div>
                                        <div style={{fontSize:16,fontWeight:600,marginTop:3}}>{today.sunset}</div>
                                    </div>
                                </div>
                                <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:20,padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-around'}}>
                                    <div>
                                        <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:"'Space Mono',monospace",letterSpacing:1,textTransform:'uppercase'}}>UV Index</div>
                                        <div style={{fontSize:28,fontWeight:800,marginTop:4,color:cond.accent}}>{weather.uvIndex}</div>
                                    </div>
                                    <UVGauge value={weather.uvIndex}/>
                                </div>
                            </div>
                        )}

                        {/* ── Tabs ── */}
                        <div style={{display:'flex',gap:3,marginBottom:14,background:'rgba(255,255,255,0.05)',
                            padding:4,borderRadius:14,width:'fit-content',animation:'fade-up 0.5s ease 0.55s both',position:'relative',zIndex:1}}>
                            {['now','hourly','7-day'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} style={{
                                    background: activeTab===t ? cond.accent : 'transparent',
                                    border:'none',borderRadius:10,padding:'8px 20px',
                                    color: activeTab===t ? '#000' : 'rgba(255,255,255,0.55)',
                                    fontWeight: activeTab===t ? 700 : 400,
                                    cursor:'pointer',fontFamily:'Outfit',fontSize:14,transition:'all 0.2s',
                                }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                            ))}
                        </div>

                        {/* ── Hourly tab ── */}
                        {activeTab==='hourly' && (
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:10,animation:'fade-up 0.4s ease both',position:'relative',zIndex:1}}>
                                {hourly.map((h, i) => (
                                    <div key={i} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',
                                        borderRadius:16,padding:'14px 10px',textAlign:'center',transition:'all 0.2s',cursor:'default'}}
                                         onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.transform='translateY(-3px)';}}
                                         onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.transform='translateY(0)';}}
                                    >
                                        <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:"'Space Mono',monospace"}}>
                                            {new Date(h.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                                        </div>
                                        <div style={{margin:'8px 0'}}>
                                            <WeatherIcon condition={wmoToCondition(h.code)} size={32} accent={cond.accent} accent2="#fff"/>
                                        </div>
                                        <div style={{fontSize:16,fontWeight:700}}>{h.temp}{tempSuffix}</div>
                                        <div style={{fontSize:11,color:'#38bdf8',marginTop:4}}>{h.precip}% 💧</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── 7-day tab ── */}
                        {activeTab==='7-day' && (
                            <div style={{display:'flex',flexDirection:'column',gap:8,animation:'fade-up 0.4s ease both',position:'relative',zIndex:1}}>
                                {forecast.map((d, i) => <ForecastRow key={i} {...d} accent={cond.accent}/>)}
                            </div>
                        )}

                        {/* ── Now tab ── */}
                        {activeTab==='now' && (
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,animation:'fade-up 0.4s ease both',position:'relative',zIndex:1}}>
                                <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:20,padding:20}}>
                                    <h3 style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:1.5,fontFamily:"'Space Mono',monospace",marginBottom:16}}>Atmosphere</h3>
                                    {[
                                        {label:'Humidity',       val:weather.humidity,                                                                    max:100, color:'#38bdf8'},
                                        {label:'Cloud Cover',    val:weather.clouds,                                                                       max:100, color:'#94a3b8'},
                                        {label:'Wind Intensity', val:Math.min((unit==='celsius' ? weather.windSpeed*6 : weather.windSpeed*3), 100),         max:100, color:cond.accent},
                                        {label:'UV Risk',        val:Math.min((weather.uvIndex/11)*100, 100),                                              max:100, color:'#f97316'},
                                    ].map(({label, val, max, color}) => (
                                        <div key={label} style={{marginBottom:14}}>
                                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                                                <span style={{fontSize:13,color:'rgba(255,255,255,0.55)'}}>{label}</span>
                                                <span style={{fontSize:13,fontFamily:"'Space Mono',monospace",color}}>{Math.round(val)}%</span>
                                            </div>
                                            <div style={{height:7,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
                                                <div style={{height:'100%',width:`${(val/max)*100}%`,background:color,borderRadius:4,transition:'width 1.2s ease'}}/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:20,padding:20}}>
                                    <h3 style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:1.5,fontFamily:"'Space Mono',monospace",marginBottom:12}}>Wind Compass</h3>
                                    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:145}}>
                                        <svg width="130" height="130" viewBox="0 0 130 130">
                                            <circle cx="65" cy="65" r="60" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                                            <circle cx="65" cy="65" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                                            <circle cx="65" cy="65" r="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                                            {['N','NE','E','SE','S','SW','W','NW'].map((d, i) => {
                                                const a = i*45, r = i%2===0 ? 63 : 55;
                                                return (
                                                    <text key={d}
                                                          x={65+r*Math.sin(a*Math.PI/180)}
                                                          y={65-r*Math.cos(a*Math.PI/180)}
                                                          textAnchor="middle" dominantBaseline="middle"
                                                          fill={i%2===0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}
                                                          fontSize={i%2===0 ? 11 : 8}
                                                          fontFamily="Outfit"
                                                          fontWeight={i%2===0 ? 600 : 400}>
                                                        {d}
                                                    </text>
                                                );
                                            })}
                                            <g transform={`rotate(${weather.windDir??0} 65 65)`}>
                                                <polygon points="65,16 70,56 65,50 60,56" fill={cond.accent} opacity="0.95"/>
                                                <polygon points="65,114 70,74 65,80 60,74" fill="rgba(255,255,255,0.18)"/>
                                            </g>
                                            <circle cx="65" cy="65" r="5" fill={cond.accent}/>
                                        </svg>
                                    </div>
                                    <p style={{textAlign:'center',fontSize:13,color:'rgba(255,255,255,0.45)'}}>
                                        {weather.windSpeed} {windSuffix} · {weather.windDir??0}°
                                    </p>
                                    <p style={{textAlign:'center',fontSize:14,color:cond.accent,fontWeight:700,marginTop:2}}>{windDirLabel}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <p style={{
                    textAlign:'center',color:'rgba(255,255,255,0.6)',fontSize:12,marginTop:32,
                    fontFamily:"'Space Mono',monospace",letterSpacing:'0.5px'
                }}>
                    Made with ❤️ by{' '}
                    <a href="https://acharyanischal.com.np" target="_blank" rel="noopener noreferrer"
                       style={{color:'#ffffff',textDecoration:'none',fontWeight:600,transition:'0.3s ease'}}
                       onMouseOver={e => (e.target.style.opacity='0.7')}
                       onMouseOut={e => (e.target.style.opacity='1')}>
                        Nischal Acharya
                    </a>{' '}
                    © {new Date().getFullYear()} All rights reserved.
                </p>
            </div>
        </div>
    );
}