// services/geoService.ts

export interface GeoLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code3: string;
  latitude: string; // GeoJS returns coordinates as strings
  longitude: string;
  timezone: string;
  organization_name?: string;
  asn?: string;
  organization?: string;
  continent_code?: string;
  accuracy?: number;
}

export const getUserLocation = async (): Promise<GeoLocation | null> => {
  try {
    // GeoJS is a public API and doesn't require an API key.
    // It infers location based on the IP making the request.
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (!response.ok) {
      console.error('GeoJS API request failed:', response.status, response.statusText);
      return null;
    }
    const data: GeoLocation = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user location from GeoJS:', error);
    return null;
  }
};
