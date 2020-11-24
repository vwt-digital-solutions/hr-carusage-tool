import { DriverInfo } from './trip.model';

export interface FrequentOffender {
  id: string | number;
  offender_info: DriverInfo;
  trips: OffenderTrip[];
}

export interface OffenderTrip {
  ended_at: string;
  started_at: string;
  trip_description: string;
  trip_kind: string;
}
