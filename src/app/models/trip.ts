import { Geometry } from './geometry';

export interface Trip {
    license: string;
    started_at: string;
    ended_at: string;
    locations: TripLocations;
}

export interface TripLocations {
    geometry: Geometry;
    token: string;
    what: string;
    when: string;
}
