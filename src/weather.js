import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react';

// WMO weather codes used by Open-Meteo: [codes, label, day icon, night icon].
const weatherCodes = [
  [[0], 'Clear', Sun, Moon], [[1, 2], 'Partly cloudy', CloudSun, CloudMoon], [[3], 'Cloudy', Cloud, Cloud], [[45, 48], 'Fog', CloudFog, CloudFog],
  [[51, 53, 55, 56, 57], 'Drizzle', CloudDrizzle, CloudDrizzle], [[61, 63, 65, 66, 67, 80, 81, 82], 'Rain', CloudRain, CloudRain],
  [[71, 73, 75, 77, 85, 86], 'Snow', CloudSnow, CloudSnow], [[95, 96, 99], 'Thunderstorms', CloudLightning, CloudLightning],
];

export function describeWeather(code, isDay = true) {
  const [, label, dayIcon, nightIcon] = weatherCodes.find(([codes]) => codes.includes(code)) || weatherCodes[2];
  return { label, Icon: isDay ? dayIcon : nightIcon };
}

export const forecastUrl = (lat, lon, params) => `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({ latitude: lat, longitude: lon, timezone: 'auto', ...params })}`;
