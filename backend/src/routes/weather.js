import { Router } from "express";
import { resolveParish } from "../utils/parishes.js";

const router = Router();

function summarizeWeather(code) {
  if ([0, 1].includes(code)) return "Clear";
  if ([2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Storm";
  return "Unknown";
}

function buildAlerts(forecast) {
  const alerts = [];
  const rain = forecast.daily.precipitation_sum?.[0] || 0;
  const maxTemp = forecast.daily.temperature_2m_max?.[0] || 0;
  const wind = forecast.daily.wind_speed_10m_max?.[0] || 0;

  if (rain > 20) {
    alerts.push({
      id: "rain_heavy",
      type: "rain",
      severity: "high",
      message: "Heavy rain is expected. Inspect drainage and protect seedlings.",
    });
  }

  if (maxTemp > 35) {
    alerts.push({
      id: "heat",
      type: "drought",
      severity: "medium",
      message: "High temperature forecast. Increase irrigation checks.",
    });
  }

  if (wind > 30) {
    alerts.push({
      id: "wind",
      type: "storm",
      severity: "medium",
      message: "Strong winds expected. Secure temporary structures.",
    });
  }

  return alerts;
}

router.get("/current", async (req, res) => {
  const location = String(req.query.location || "").trim() || "Kingston";

  try {
    let place = null;
    const parish = resolveParish(location);
    if (parish) {
      place = {
        name: parish.name,
        country: "Jamaica",
        latitude: parish.lat,
        longitude: parish.lng,
      };
    } else {
      const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(`${location}, Jamaica`)}&count=5`);
      const geo = await geoResp.json();
      if (geo.results?.length) {
        place = geo.results.find((result) => String(result.country || "").toLowerCase() === "jamaica") || geo.results[0];
      }
    }

    if (!place) {
      return res.status(404).json({ message: "Location not found" });
    }

    const forecastResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max&timezone=auto`
    );
    const forecast = await forecastResp.json();

    const payload = {
      location: `${place.name}${place.country ? `, ${place.country}` : ""}`,
      current: {
        temp: forecast.current?.temperature_2m ?? 0,
        humidity: forecast.current?.relative_humidity_2m ?? 0,
        windSpeed: forecast.current?.wind_speed_10m ?? 0,
        condition: summarizeWeather(forecast.current?.weather_code ?? -1),
      },
      alerts: buildAlerts(forecast),
    };

    return res.json(payload);
  } catch {
    return res.status(500).json({ message: "Weather service unavailable" });
  }
});

export default router;
