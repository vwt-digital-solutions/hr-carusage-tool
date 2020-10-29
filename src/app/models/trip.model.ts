import { Geometry } from './geometry.model';

export interface Trip {
  checking_info: CheckingInfo;
  driver_info: DriverInfo;
  ended_at: string;
  id: string | number;
  license: string;
  locations: TripLocation[];
  started_at: string;
}

export interface CheckingInfo {
  checked: boolean;
  correct: boolean;
  reason: string;
}

export interface DriverInfo {
  department: number;
  function_name: string;
  initial: string;
  last_name: string;
  prefix: string;
  registration_number: number;
}

export interface TripLocation {
  geometry: Geometry;
  token: string;
  what: string;
  when: string;
}
