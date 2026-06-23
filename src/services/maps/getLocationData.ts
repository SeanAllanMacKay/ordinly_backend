const MAP_API_TOKEN = process.env.MAP_API_TOKEN!;

type LocationInput = {
  latitude: number;
  longitude: number;
  type: string;
};

export const getSingleProjectLocationData = async (location: LocationInput) => {
  const { latitude, longitude, type } = location;

  const url = new URL("https://mapbox.com");
  url.searchParams.append("longitude", longitude.toString());
  url.searchParams.append("latitude", latitude.toString());
  url.searchParams.append("access_token", MAP_API_TOKEN);
  url.searchParams.append("types", type);
  url.searchParams.append("limit", "1");
  url.searchParams.append("permanent", "false");

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mapbox Single Geocode Error: ${error}`);
  }

  const data = await response.json();

  if (data.features && data.features.length > 0) {
    return {
      ...location,
      ...data.features[0].properties,
    };
  }

  return location;
};
