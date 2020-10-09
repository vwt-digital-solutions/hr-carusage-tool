import { Geometry } from './geometry';

export interface Trip {
    license: string;
    started_at: string;
    ended_at: string;
    locations: TripLocation[];
}

export interface TripLocation {
    geometry: Geometry;
    token: string;
    what: string;
    when: string;
}
