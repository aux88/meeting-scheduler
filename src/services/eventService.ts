import { supabase } from "../lib/supabaseClient";
import { getLocalTimezoneOffset } from "../utils/time";
import type { EventInfo } from "../types/EventInfo";
import type { Candidate } from "../types/Candidate";

export const createEvent = async (eventInfo: EventInfo, candidates: Candidate[]): Promise<string> => {
    try {
        // 1. Insert into events table
        const { data: eventData, error: eventError } = await supabase
            .from("events")
            .insert({
                title: eventInfo.eventName,
                description: eventInfo.description,
                duration_minutes: eventInfo.duration,
            })
            .select()
            .single();

        if (eventError) throw eventError;

        const eventId = eventData.id;

        // 2. Insert into event_candidates table
        const timezoneOffset = getLocalTimezoneOffset();
        const candidatePromises = candidates.map((candidate) => {
            return supabase.from("event_candidates").insert({
                event_id: eventId,
                date: candidate.date,
                start_time: `${candidate.startTime}:00${timezoneOffset}`,
                end_time: `${candidate.endTime}:00${timezoneOffset}`,
            });
        });

        const candidateResults = await Promise.all(candidatePromises);
        const candidateErrors = candidateResults.map(res => res.error).filter(Boolean);

        if (candidateErrors.length > 0) {
            console.error("Error inserting candidates:", candidateErrors);
            // Revert event creation if candidates fail
            await supabase.from("events").delete().match({ id: eventId });
            throw new Error("候補日程の登録に失敗しました。");
        }

        return eventId;

    } catch (error: any) {
        console.error("Error creating event:", error);
        throw new Error("イベントの作成に失敗しました: " + error.message);
    }
};
