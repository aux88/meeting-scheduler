import { supabase } from "../lib/supabaseClient";
import type { Availability } from "../types/Availability";
import { getLocalTimezoneOffset } from "../utils/time";

export const insertAvailabilities = async ( participantId :string, availabilities :Availability[]) => {
    const timezoneOffset = getLocalTimezoneOffset();
    const availabilityPromises = availabilities.map((avail) => {
        return supabase.from("participant_availabilities").insert({
            participant_id: participantId,
            candidate_id: avail.candidate_id,
            available_start: `${avail.start_time}:00${timezoneOffset}`,
            available_end: `${avail.end_time}:00${timezoneOffset}`,
        });
    });

    const availabilityResults = await Promise.all(availabilityPromises);
    const availabilityErrors = availabilityResults.map(res => res.error).filter(Boolean);

    if (availabilityErrors.length > 0) {
        console.error("Error inserting availabilities:", availabilityErrors);
        throw new Error("空き時間の登録中にエラーが発生しました。");
    }
}

