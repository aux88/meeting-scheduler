import type { Availability } from "../types/Availability";
import type { Participant } from "../types/Participant";
import type { Candidate } from "../types/Candidate";
import { getOverlap, mergeIntervals, minutesToTime, timeToMinutes } from "../utils/time";
import type { Event } from "../types/Event";

export interface CalculatedSlot {
    candidateId: string;
    candidateDate: string;
    availableSlots: { start: string; end: string }[];
}

export const calculateAvailableMeetingSlots = (event: Event, candidates:Candidate[], participants:Participant[], availabilities:Availability[]):CalculatedSlot[] => {
    const results: CalculatedSlot[] = [];

    candidates.forEach(candidate => {
        const candidateInterval: { start: number; end: number } = {
            start: timeToMinutes(candidate.start_time),
            end: timeToMinutes(candidate.end_time),
        };

        // Group participant availabilities by participant
        const participantAvailabilitiesMap = new Map<string, { start: number; end: number }[]>();
        availabilities.filter(av => av.candidate_id === candidate.id)
                        .forEach(av => {
                            const participantId = av.participant_id as string;
                            const start = timeToMinutes(av.available_start);
                            const end = timeToMinutes(av.available_end);
                            if (!participantAvailabilitiesMap.has(participantId)) {
                                participantAvailabilitiesMap.set(participantId, []);
                            }
                            participantAvailabilitiesMap.get(participantId)?.push({ start, end });
                        });

        let commonIntervals: { start: number; end: number }[] = [];

        // Initialize commonIntervals with the first participant's merged intervals within the candidate's time
        const firstParticipantId = participants[0]?.id;
        if (firstParticipantId && participantAvailabilitiesMap.has(firstParticipantId)) {
            const initialIntervals = participantAvailabilitiesMap.get(firstParticipantId)!
                .map(interval => getOverlap(interval, candidateInterval))
                .filter((interval): interval is { start: number; end: number } => interval !== null);
            commonIntervals = mergeIntervals(initialIntervals);
        } else if (participants.length > 0) {
            // If the first participant has no availability for this candidate, then no common intervals exist
            commonIntervals = [];
        } else {
            // No participants, so candidate's full interval is available (though this case should be handled by requiring participants)
            commonIntervals = [candidateInterval];
        }
            
        // Find intersection with subsequent participants
        for (let i = 1; i < participants.length; i++) {
            const currentParticipantId = participants[i].id;
            if (participantAvailabilitiesMap.has(currentParticipantId)) {
            const participantIntervals = mergeIntervals(
                participantAvailabilitiesMap.get(currentParticipantId)!
                    .map(interval => getOverlap(interval, candidateInterval))
                    .filter((interval): interval is { start: number; end: number } => interval !== null)
            );

            let newCommonIntervals: { start: number; end: number }[] = [];
            commonIntervals.forEach(commInterval => {
                participantIntervals.forEach(partInterval => {
                const overlap = getOverlap(commInterval, partInterval);
                if (overlap) {
                    newCommonIntervals.push(overlap);
                }
                });
            });
            commonIntervals = mergeIntervals(newCommonIntervals);
            } else {
                // If any participant has no availability for this candidate, then no common intervals exist
                commonIntervals = [];
                break;
            }
        }

        // Filter common intervals by required duration
        const suitableSlots = commonIntervals.flatMap(interval => {
            const duration = interval.end - interval.start;
            if (duration >= event.duration_minutes) {
            // If the common interval is long enough, it's a suitable slot.
            // We could potentially split it if needed, but for now, we'll just return the whole interval.
            // For simplicity, we'll just return the full overlapping duration if it meets the minimum.
            return [{ start: minutesToTime(interval.start), end: minutesToTime(interval.end) }];
            }
            return [];
        });
            
        results.push({
            candidateId: candidate.id,
            candidateDate: candidate.date,
            availableSlots: suitableSlots,
        });
    });
    return results;
}