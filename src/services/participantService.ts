import { supabase } from "../lib/supabaseClient";
import type { Participant } from "../types/Participant";

export const insertParticipant = async(eventId: string, participantName: string):Promise<Participant> => {

    const { data: participantData, error: participantError } = await supabase
                    .from("participants")
                    .insert({
                        event_id: eventId,
                        name: participantName,
                    })
                    .select()
                    .single();

    if (participantError) throw participantError;

    return participantData;
}

export const fetchParticipants = async(eventId: string):Promise<Participant[]> =>{
    const { data: participantsData, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .eq("event_id", eventId);

    if (participantsError) throw participantsError;
    
    return participantsData;
}