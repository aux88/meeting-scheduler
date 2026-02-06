import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Event } from "../types/Event";
import type { Participant } from "../types/Participant";
import type { Availability } from "../types/Availability";
import type { Candidate } from "../types/Candidate";
import { fetchEventDetail } from "../services/eventService";
import { fetchParticipants } from "../services/participantService";
import { fetchAvailabilities } from "../services/availabilitiesService";
import { calculateAvailableMeetingSlots, type CalculatedSlot } from "../services/calculateMeeetingSlots";
import { ResultList } from "../components/result/ResultList";
import { ShareLinkSection } from "../components/common/ShareLinkSection";
import { ShareLinkItem } from "../components/common/ShareLinkItem";

const ResultPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
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
        const {event, candidates} = await fetchEventDetail(eventId);
        setEvent(event);
        setCandidates(candidates);

        // Fetch Participants
        const participants = await fetchParticipants(eventId);
        setParticipants(participants);

        // Fetch Participant Availabilities
        const availabilities = await fetchAvailabilities(candidates);
        setAvailabilities(availabilities);

      } catch (err: any) {
        console.error("Error fetching data:", err.message);
        setError("Failed to load event data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const calculatedMeetingSlots = useMemo(():CalculatedSlot[]=>{
    if (!event) return [];
    if (candidates.length === 0) return [];
    if (participants.length === 0) return [];
    if (availabilities.length === 0) return [];
    return calculateAvailableMeetingSlots(event,candidates,participants,availabilities);
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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">"{event.title}"の回答集計結果</h1>
      <p className="mb-4">{event.description}</p>
      <p className="mb-4">所要時間: {event.duration_minutes} 分</p>
      <ShareLinkSection>
        <ShareLinkItem label="回答用ページ:" eventId={eventId as string}/>
        <ShareLinkItem label="集計結果ページ:" eventId={eventId as string}/>
      </ShareLinkSection>

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
      <ResultList 
        candidates={candidates}
        availabilities={availabilities}
        participants={participants}
        calculatedMeetingSlots={calculatedMeetingSlots}
      />
    </div>
  );
};

export default ResultPage;
