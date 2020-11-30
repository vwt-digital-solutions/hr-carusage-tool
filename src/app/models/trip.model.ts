import { Geometry } from './geometry.model';

export interface Trip {
  checking_info: CheckingInfo;
  department: DepartmentInfo;
  driver_info: DriverInfo;
  ended_at: string;
  id: string | number;
  license: string;
  locations: TripLocation[];
  started_at: string;
}

export interface CheckingInfo {
  trip_kind: string;
  description: string;
}

export interface DepartmentInfo {
  department_id: number;
  department_name: string;
  department_parent_id: number;
  manager_id: number;
  manager_mail: string;
  manager_name: string;
}

export interface DriverInfo {
  car_brand_name: string;
  car_brand_type: string;
  department_id: number;
  department_name: string;
  driver_employee_number: number;
  driver_end_date: string;
  driver_first_name: string;
  driver_initials_name: string;
  driver_last_name: string;
  driver_mail: string;
  driver_prefix_name: string;
  driver_start_date: string;
  license: string;
}

export interface TripLocation {
  geometry: Geometry;
  token: string;
  what: string;
  when: string;
}
