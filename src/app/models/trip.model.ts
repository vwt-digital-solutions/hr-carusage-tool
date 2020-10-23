import { Geometry } from './geometry.model';

export interface Trip {
  license: string;
  started_at: string;
  ended_at: string;
  driver_info: DriverInfo;
  locations: TripLocation[];
}

export interface TripLocation {
  geometry: Geometry;
  token: string;
  what: string;
  when: string;
}

export interface DriverInfo {
  department: number;
  function_name: string;
  initial: string;
  last_name: string;
  prefix: string;
  registration_number: number;
}
