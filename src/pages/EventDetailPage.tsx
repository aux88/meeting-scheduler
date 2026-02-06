import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Event } from "../types/Event";
import type { Candidate } from "../types/Candidate";
import { EventHeader } from "../components/event/EventHeader";
import { useAvailabilitiesForm } from "../hooks/useAvailabilitiesForm";
import { AvailabilitiesForm } from "../components/event/AvailabilitiesForm";
import { fetchEventDetail } from "../services/eventService";
import { insertParticipant } from "../services/participantService";
import { insertAvailabilities } from "../services/availabilitiesService";
import { ShareLinkSection } from "../components/common/ShareLinkSection";
import { ShareLinkItem } from "../components/common/ShareLinkItem";

const EventDetailPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { availabilitiesForm, changeParticipantName, changeAvailabilities, setAvailabilities} = useAvailabilitiesForm();

    useEffect(() => {
        const fetch = async () => {
            if (!eventId) return;

            setLoading(true);
            try {
                const { event, candidates } = await fetchEventDetail(eventId);

                setEvent(event);
                setCandidates(candidates);

                // Initialize availabilities state
                setAvailabilities(candidates.map(c => ({
                    id: undefined,
                    participant_id: undefined,
                    candidate_id: c.id,
                    available_start: "",
                    available_end: "",
                })));

            } catch (err) {
                setError((err as Error).message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId || !availabilitiesForm.participantName) {
            alert("名前を入力してください。");
            return;
        }

        try {
            // 1. Insert participant
            const participantData = await insertParticipant(eventId,availabilitiesForm.participantName); 
            const participantId = participantData.id;

            // 2. Filter and insert availabilities
            const validAvailabilities = availabilitiesForm.availabilities.filter(a => a.available_start && a.available_end);
            
            if (validAvailabilities.length === 0) {
                // Navigate to result page even if no times are submitted
                navigate(`/result/${eventId}`);
                return;
            }

            await insertAvailabilities( participantId, validAvailabilities );
            navigate(`/result/${eventId}`);

        } catch (error) {
            console.error("Error submitting response:", error);
            alert("回答の送信中にエラーが発生しました。");
        }
    };

    if (loading) {
        return <div className="container mx-auto p-4"><span className="loading loading-spinner"></span> 読み込み中...</div>;
    }
    if (error) {
        return <div className="container mx-auto p-4"><div className="alert alert-error">{error}</div></div>;
    }
    if (!event) {
        return <div className="container mx-auto p-4">イベントが見つかりません。</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <EventHeader title={event.title} description={event.description} duration_minutes={event.duration_minutes} />
            <ShareLinkSection>
                <ShareLinkItem label="このリンクを参加者に共有してください" eventId={eventId as string}/>
            </ShareLinkSection>
            <AvailabilitiesForm 
                onSubmit = {handleSubmit}
                onChangeAvailabilities= {changeAvailabilities}
                onChangeParticipantName={changeParticipantName}
                participantName={availabilitiesForm.participantName}
                candidates={candidates}
            />
        </div>
    );
};

export default EventDetailPage;