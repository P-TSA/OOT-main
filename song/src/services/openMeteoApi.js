// Open-Meteo API 서비스
// ✅ 완전 무료, API 키 불필요!

// 날씨 코드 → 한국어 설명 매핑 (겨울 버전)
const weatherCodeMap = {
  0: "맑음",
  1: "대체로 맑음",
  2: "부분적으로 흐림",
  3: "흐림",
  45: "안개",
  48: "서리 안개",
  51: "가랑눈 (약)",
  53: "가랑눈 (중간)",
  55: "가랑눈 (강)",
  56: "진눈깨비 (약)",
  57: "진눈깨비 (강)",
  61: "눈 (약)",
  63: "눈 (중간)",
  65: "눈 (강)",
  66: "진눈깨비 (약)",
  67: "진눈깨비 (강)",
  71: "눈 (약)",
  73: "눈 (중간)",
  75: "눈 (강)",
  77: "눈날림",
  80: "소낙눈 (약)",
  81: "소낙눈 (중간)",
  82: "소낙눈 (강)",
  85: "소낙눈 (약/중간)",
  86: "소낙눈 (강)",
  95: "눈보라",
  96: "눈보라 + 우박",
  99: "눈보라 + 강한 우박",
};

// 날씨 코드 → 이모지 매핑 (겨울 버전)
const weatherIconMap = {
  0: "☀️",     // 맑음
  1: "🌤️",     // 대체로 맑음
  2: "⛅",     // 부분적으로 흐림
  3: "☁️",     // 흐림
  45: "🌫️",    // 안개
  48: "🌫️",    // 서리 안개
  51: "🌨️",    // 가랑눈 (약)
  53: "🌨️",    // 가랑눈 (중간)
  55: "❄️",    // 가랑눈 (강)
  56: "🌨️",    // 진눈깨비 (약)
  57: "🌨️",    // 진눈깨비 (강)
  61: "🌨️",    // 눈 (약)
  63: "❄️",    // 눈 (중간)
  65: "❄️",    // 눈 (강)
  66: "🌨️",    // 진눈깨비 (약)
  67: "🌨️",    // 진눈깨비 (강)
  71: "🌨️",    // 눈 (약)
  73: "❄️",    // 눈 (중간)
  75: "❄️",    // 눈 (강)
  77: "🌨️",    // 눈날림
  80: "🌨️",    // 소낙눈 (약)
  81: "❄️",    // 소낙눈 (중간)
  82: "❄️",    // 소낙눈 (강)
  85: "🌨️",    // 소낙눈 (약/중간)
  86: "❄️",    // 소낙눈 (강)
  95: "🌨️",    // 눈보라
  96: "❄️",    // 눈보라 + 우박
  99: "❄️",    // 눈보라 + 강한 우박
};

// 한국 주요 도시 좌표
const CITIES = {
  서울: { lat: 37.5665, lon: 126.9780 },
  부산: { lat: 35.1796, lon: 129.0756 },
  인천: { lat: 37.4563, lon: 126.7052 },
  대구: { lat: 35.8714, lon: 128.6014 },
  대전: { lat: 36.3504, lon: 127.3845 },
  광주: { lat: 35.1595, lon: 126.8526 },
};

// IP 기반으로 현재 위치 가져오기
export const getCurrentLocation = async () => {
  try {
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();
    
    const [lat, lon] = data.loc.split(',').map(parseFloat);
    
    // 영어 지역명을 한글로 변환
    let cityName = data.city || '알 수 없음';
    
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.city)}&language=ko`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.results && geoData.results.length > 0) {
        cityName = geoData.results[0].name;
      }
    } catch (geoError) {
      console.warn('한글 지역명 변환 실패:', geoError);
    }
    
    return {
      lat,
      lon,
      city: cityName,
      region: data.region || '',
      country: data.country || '',
    };
  } catch (error) {
    console.error('위치 정보 가져오기 실패:', error);
    // 기본값으로 서울 반환
    return {
      lat: 37.5665,
      lon: 126.9780,
      city: '서울',
      region: 'Seoul',
      country: 'KR',
    };
  }
};

// 현재 날씨 데이터 가져오기
export const getCurrentWeather = async (cityName) => {
  const city = CITIES[cityName];
  if (!city) {
    throw new Error(`도시를 찾을 수 없습니다: ${cityName}`);
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=Asia/Seoul`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const current = data.current;
    const weatherCode = current.weather_code;
    
    // WeatherCard 컴포넌트가 기대하는 필드명으로 반환
    return {
      id: cityName,
      city: cityName,           // 한글 도시명
      cityEn: getCityEnglishName(cityName),  // 영문 도시명
      temp: Math.round(current.temperature_2m),
      feels_like: Math.round(current.apparent_temperature),  // 체감온도
      humidity: Math.round(current.relative_humidity_2m),
      wind_speed: Math.round(current.wind_speed_10m * 10) / 10,  // 풍속
      wind_deg: Math.round(current.wind_direction_10m),
      precipitation: current.precipitation || 0,
      weatherCode: weatherCode,
      weather: weatherCodeMap[weatherCode] || '알 수 없음',  // 영문 설명 (호환성)
      weatherKr: weatherCodeMap[weatherCode] || '알 수 없음',  // 한글 설명
      icon: weatherIconMap[weatherCode] || '☁️',
      pressure: Math.round(current.surface_pressure),
    };
  } catch (error) {
    console.error(`${cityName} 날씨 데이터 가져오기 실패:`, error);
    throw error;
  }
};

// 도시명의 영문 이름 반환
const getCityEnglishName = (cityName) => {
  const cityEnglishMap = {
    '서울': 'Seoul',
    '부산': 'Busan',
    '인천': 'Incheon',
    '대구': 'Daegu',
    '대전': 'Daejeon',
    '광주': 'Gwangju',
  };
  return cityEnglishMap[cityName] || cityName;
};

// 모든 도시의 날씨 데이터 가져오기
export const getAllCitiesWeather = async () => {
  const cityNames = Object.keys(CITIES);
  
  try {
    const promises = cityNames.map(city => getCurrentWeather(city));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('날씨 데이터 가져오기 실패:', error);
    throw error;
  }
};

// 시간별 예보 데이터 가져오기 (48시간)
export const getHourlyForecast = async (cityName = '서울', hours = 48) => {
  const city = CITIES[cityName] || CITIES['서울'];
  
  try {
    // 요청한 시간에 따라 필요한 일수 계산 (최소 3일, 최대 7일)
    const forecastDays = Math.min(Math.max(Math.ceil(hours / 24), 3), 7);
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&timezone=Asia/Seoul&forecast_days=${forecastDays}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const hourly = data.hourly;
    const forecast = [];
    
    // 현재 시각부터 요청한 시간만큼
    const now = new Date();
    const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    
    for (let i = 0; i < Math.min(hours, hourly.time.length); i++) {
      const time = new Date(hourly.time[i]);
      
      // 현재 시각 이후 데이터만
      if (time >= currentHour) {
        forecast.push({
          time: hourly.time[i],
          hour: time.getHours(),
          temp: Math.round(hourly.temperature_2m[i]),
          weatherCode: hourly.weather_code[i],
          icon: weatherIconMap[hourly.weather_code[i]] || '☁️',
          precipitation: Math.round(hourly.precipitation_probability[i] || 0),
          windSpeed: Math.round(hourly.wind_speed_10m[i] * 10) / 10,
        });
      }
      
      if (forecast.length >= hours) break;
    }
    
    return forecast.slice(0, hours);
  } catch (error) {
    console.error('시간별 예보 가져오기 실패:', error);
    throw error;
  }
};

// 주간 예보 데이터 가져오기 (7일)
export const getWeeklyForecast = async (cityName = '서울') => {
  const city = CITIES[cityName] || CITIES['서울'];
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Seoul&forecast_days=7`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('🔍 Open-Meteo API 원본 응답:', data);
    
    const daily = data.daily;
    const forecast = [];
    
    console.log('📅 일별 데이터 개수:', daily.time.length);
    
    for (let i = 0; i < daily.time.length; i++) {
      const date = new Date(daily.time[i]);
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      
      const item = {
        date: daily.time[i],
        dayOfWeek: dayOfWeek,
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        weatherCode: daily.weather_code[i],
        icon: weatherIconMap[daily.weather_code[i]] || '☁️',
        precipitation: Math.round(daily.precipitation_probability_max[i] || 0),
      };
      
      console.log(`📊 ${i}일차 (${daily.time[i]}):`, item);
      forecast.push(item);
    }
    
    console.log('✅ 최종 반환 데이터:', forecast);
    return forecast;
  } catch (error) {
    console.error('주간 예보 가져오기 실패:', error);
    throw error;
  }
};

// 상세 날씨 정보 가져오기
export const getDetailedWeather = async (cityName = '서울') => {
  const city = CITIES[cityName] || CITIES['서울'];
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=visibility,dew_point_2m,cloud_cover,uv_index&timezone=Asia/Seoul`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const current = data.current;
    const hourly = data.hourly;
    
    // 현재 시각에 가장 가까운 시간별 데이터 찾기
    const now = new Date();
    const currentTimeStr = now.toISOString().slice(0, 13) + ':00';
    const currentIndex = hourly.time.findIndex(t => t === currentTimeStr);
    const idx = currentIndex >= 0 ? currentIndex : 0;
    
    return {
      feels_like: Math.round(current.apparent_temperature),
      temp: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      pressure: Math.round(current.surface_pressure),
      visibility: Math.round(hourly.visibility[idx] || 10000),
      wind_speed: Math.round(current.wind_speed_10m * 10) / 10,
      wind_deg: Math.round(current.wind_direction_10m),
      uv_index: Math.round(hourly.uv_index[idx] || 0),
      dew_point: Math.round(hourly.dew_point_2m[idx]),
      clouds: Math.round(hourly.cloud_cover[idx] || 0),
    };
  } catch (error) {
    console.error('상세 날씨 데이터 가져오기 실패:', error);
    throw error;
  }
};

// 일출/일몰 데이터 가져오기
export const getSunriseSunset = async (cityName = '서울') => {
  const city = CITIES[cityName] || CITIES['서울'];
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=sunrise,sunset&timezone=Asia/Seoul&forecast_days=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const daily = data.daily;
    const sunriseTime = new Date(daily.sunrise[0]);
    const sunsetTime = new Date(daily.sunset[0]);
    
    const dayLength = (sunsetTime - sunriseTime) / (1000 * 60 * 60);
    
    return {
      sunrise: sunriseTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      sunset: sunsetTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      dayLength: `${Math.floor(dayLength)}시간 ${Math.round((dayLength % 1) * 60)}분`,
    };
  } catch (error) {
    console.error('일출/일몰 데이터 가져오기 실패:', error);
    throw error;
  }
};

// 대기질 데이터 (Open-Meteo는 대기질 API가 별도)
export const getAirQuality = async (cityName = '서울') => {
  const city = CITIES[cityName] || CITIES['서울'];
  
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi&timezone=Asia/Seoul`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const current = data.current;
    const aqi = current.european_aqi || 50;
    
    // AQI 상태 판단
    let status = '좋음';
    if (aqi > 100) status = '매우나쁨';
    else if (aqi > 75) status = '나쁨';
    else if (aqi > 50) status = '보통';
    
    return {
      aqi: Math.round(aqi),
      pm25: Math.round(current.pm2_5 || 0),
      pm10: Math.round(current.pm10 || 0),
      o3: Math.round(current.ozone || 0),
      no2: Math.round(current.nitrogen_dioxide || 0),
      so2: Math.round(current.sulphur_dioxide || 0),
      co: Math.round(current.carbon_monoxide / 100) / 10, // μg/m³ → ppm 변환
      status: status,
    };
  } catch (error) {
    console.error('대기질 데이터 가져오기 실패:', error);
    // 실패 시 기본값 반환
    return {
      aqi: 45,
      pm25: 12,
      pm10: 25,
      o3: 35,
      no2: 18,
      so2: 8,
      co: 0.4,
      status: '좋음',
    };
  }
};