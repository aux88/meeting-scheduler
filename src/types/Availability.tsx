export type Availability = {
    id: string | undefined;
    participant_id: string | undefined;
    candidate_id: string;
    available_start: string;
    available_end: string;
};
