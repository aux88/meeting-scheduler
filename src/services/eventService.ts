import { supabase } from "../lib/supabaseClient";
import { getLocalTimezoneOffset } from "../utils/time";
import type { Event } from "../types/Event";
import type { Candidate } from "../types/Candidate";

export const createEvent = async (eventInfo: Event, candidates: Candidate[]): Promise<string> => {
    try {
        // 1. Insert into events table
        const { data: eventData, error: eventError } = await supabase
            .from("events")
            .insert({
                title: eventInfo.title,
                description: eventInfo.description,
                duration_minutes: eventInfo.duration_minutes,
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
                start_time: `${candidate.start_time}:00${timezoneOffset}`,
                end_time: `${candidate.end_time}:00${timezoneOffset}`,
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

export const fetchEventDetail = async (eventId: string):Promise<{event:Event,candidates:Candidate[]}> => {
    // Fetch event details
    const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (eventError) throw new Error(`イベントの取得に失敗しました: ${eventError.message}`);
    
    // Fetch event candidates
    const { data: candidateData, error: candidateError } = await supabase
        .from("event_candidates")
        .select("*")
        .eq("event_id", eventId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

    if (candidateError) throw new Error(`候補日程の取得に失敗しました: ${candidateError.message}`);
                
    return {
        event: eventData,
        candidates: candidateData,
    }
}
