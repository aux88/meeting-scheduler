import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { timeToMinutes, minutesToTime, getOverlap, mergeIntervals, formatDateToJapanese, formatTimeToJapanese } from "../utils/time";
import type { Event } from "../types/Event";

interface EventCandidate {
  id: string;
  event_id: string;
  date: string; // YYYY-MM-DD
  start_time: string;     // HH:MM:SS+TZ
  end_time: string;       // HH:MM:SS+TZ
}

interface Participant {
  id: string;
  event_id: string;
  name: string;
}

interface ParticipantAvailability {
  id: string;
  participant_id: string;
  candidate_id: string;
  available_start: string; // HH:MM:SS+TZ
  available_end: string;   // HH:MM:SS+TZ
}

interface CalculatedSlot {
  candidateId: string;
  candidateDate: string;
  availableSlots: { start: string; end: string }[];
}

const ResultPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [candidates, setCandidates] = useState<EventCandidate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [availabilities, setAvailabilities] = useState<ParticipantAvailability[]>([]);
  const [calculatedMeetingSlots, setCalculatedMeetingSlots] = useState<CalculatedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (!eventId) {
        setError("Event ID is missing.");
        setLoading(false);
        return;
      }

      try {
        // Fetch Event
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Fetch Event Candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("event_candidates")
          .select("*")
          .eq("event_id", eventId);

        if (candidatesError) throw candidatesError;
        setCandidates(candidatesData);

        // Fetch Participants
        const { data: participantsData, error: participantsError } = await supabase
          .from("participants")
          .select("*")
          .eq("event_id", eventId);

        if (participantsError) throw participantsError;
        setParticipants(participantsData);

        // Fetch Participant Availabilities
        const candidateIds = candidatesData.map((c) => c.id);
        const { data: availabilitiesData, error: availabilitiesError } = await supabase
          .from("participant_availabilities")
          .select("*")
          .in("candidate_id", candidateIds);
        
        if (availabilitiesError) throw availabilitiesError;
        setAvailabilities(availabilitiesData);

      } catch (err: any) {
        console.error("Error fetching data:", err.message);
        setError("Failed to load event data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (event && candidates.length > 0 && participants.length > 0 && availabilities.length > 0) {
      const calculateAvailableMeetingSlots = () => {
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
                            const participantId = av.participant_id;
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
        setCalculatedMeetingSlots(results);
      };
      calculateAvailableMeetingSlots();
    }
  }, [event, candidates, participants, availabilities]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading results...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!event) {
    return <div className="container mx-auto p-4">Event not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">"{event.title}"の回答集計結果</h1>
      <p className="mb-4">{event.description}</p>
      <p className="mb-4">所要時間: {event.duration_minutes} 分</p>

      <h2 className="text-2xl font-semibold mb-4">回答者:</h2>
      {participants.length > 0 ? (
        <ul className="list-disc pl-5 mb-6">
          {participants.map((participant) => (
            <li key={participant.id}>{participant.name}</li>
          ))}
        </ul>
      ) : (
        <p>回答がありません。</p>
      )}

      <h2 className="text-2xl font-semibold mb-4">回答結果:</h2>
      {candidates.length > 0 ? (
        <ul className="list-none mb-6"> {/* Changed to list-none to remove default bullet points */}
          {candidates.map((candidate) => {
            const currentCandidateAvailabilities = availabilities.filter(
              (av) => av.candidate_id === candidate.id
            );
            const calculatedSlot = calculatedMeetingSlots.find(
              (slot) => slot.candidateId === candidate.id
            );
            return (
              <li key={candidate.id} className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {formatDateToJapanese(candidate.date)} {formatTimeToJapanese(candidate.date,candidate.start_time)} - {formatTimeToJapanese(candidate.date,candidate.end_time)}
                </h3>
                
                {currentCandidateAvailabilities.length > 0 ? (
                  <div className="pl-4 mb-3">
                    <h4 className="text-lg font-medium mb-2 text-gray-700">参加者の回答:</h4>
                    <ul className="list-disc pl-5 text-gray-600">
                      {currentCandidateAvailabilities.map((av) => {
                        const participantName =
                          participants.find((p) => p.id === av.participant_id)?.name ??
                          "Unknown";
                        return (
                          <li key={av.id}>
                            {participantName}: {formatTimeToJapanese(candidate.date,av.available_start)} - {formatTimeToJapanese(candidate.date,av.available_end)} 
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <p className="pl-4 text-gray-500">この候補日には誰も回答していません。</p>
                )}

                {calculatedSlot && calculatedSlot.availableSlots.length > 0 && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                    <h4 className="text-lg font-medium mb-2 text-green-800">
                      <span role="img" aria-label="sparkles">✨</span> 調整可能な時間帯:
                    </h4>
                    <ul className="list-disc pl-5 text-green-700">
                      {calculatedSlot.availableSlots.map((slot, index) => (
                        <li key={index}>
                          {slot.start} - {slot.end} (所要時間:{" "}  
                          {timeToMinutes(slot.end) - timeToMinutes(slot.start)} 分)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {calculatedSlot && calculatedSlot.availableSlots.length === 0 && (
                  <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
                    <p className="text-red-700">
                      この候補日には調整可能な時間帯が見つかりませんでした。
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>候補がありません。</p>
      )}
    </div>
  );
};

export default ResultPage;
