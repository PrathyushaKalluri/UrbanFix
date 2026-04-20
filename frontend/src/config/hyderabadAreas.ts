export type HyderabadArea = {
  name: string
  latitude: number
  longitude: number
}

export const HYDERABAD_AREAS: HyderabadArea[] = [
  { name: 'Madhapur', latitude: 17.4483, longitude: 78.3915 },
  { name: 'Gachibowli', latitude: 17.4401, longitude: 78.3489 },
  { name: 'Hitech City', latitude: 17.4435, longitude: 78.3772 },
  { name: 'Kukatpally', latitude: 17.4933, longitude: 78.4011 },
  { name: 'Ameerpet', latitude: 17.4374, longitude: 78.4482 },
  { name: 'Banjara Hills', latitude: 17.4138, longitude: 78.4398 },
  { name: 'Jubilee Hills', latitude: 17.4326, longitude: 78.4071 },
  { name: 'Begumpet', latitude: 17.444, longitude: 78.4627 },
  { name: 'Secunderabad', latitude: 17.4399, longitude: 78.4983 },
  { name: 'LB Nagar', latitude: 17.3457, longitude: 78.5522 },
  { name: 'Uppal', latitude: 17.4062, longitude: 78.5591 },
  { name: 'Mehdipatnam', latitude: 17.3959, longitude: 78.4331 },
]

export function getAreaByName(areaName?: string) {
  if (!areaName) {
    return null
  }

  return HYDERABAD_AREAS.find((area) => area.name === areaName) ?? null
}
