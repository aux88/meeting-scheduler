import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getLocalTimezoneOffset } from "../utils/time";


type Event = {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
};

type Candidate = {
    id: string;
    event_id: string;
    date: string;
    start_time: string;
    end_time: string;
};

type Availability = {
    candidate_id: string;
    start_time: string;
    end_time: string;
};

const EventDetailPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [participantName, setParticipantName] = useState("");
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!eventId) return;

            setLoading(true);
            try {
                // Fetch event details
                const { data: eventData, error: eventError } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", eventId)
                    .single();

                if (eventError) throw new Error(`イベントの取得に失敗しました: ${eventError.message}`);
                setEvent(eventData);

                // Fetch event candidates
                const { data: candidateData, error: candidateError } = await supabase
                    .from("event_candidates")
                    .select("*")
                    .eq("event_id", eventId)
                    .order("date", { ascending: true })
                    .order("start_time", { ascending: true });

                if (candidateError) throw new Error(`候補日程の取得に失敗しました: ${candidateError.message}`);
                setCandidates(candidateData);

                // Initialize availabilities state
                setAvailabilities(candidateData.map(c => ({
                    candidate_id: c.id,
                    start_time: "",
                    end_time: "",
                })));

            } catch (err) {
                setError((err as Error).message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);
    
    const handleAvailabilityChange = (candidateId: string, field: 'start_time' | 'end_time', value: string) => {
        setAvailabilities(prev => prev.map(a =>
            a.candidate_id === candidateId ? { ...a, [field]: value } : a
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId || !participantName) {
            alert("名前を入力してください。");
            return;
        }

        try {
            // 1. Insert participant
            const { data: participantData, error: participantError } = await supabase
                .from("participants")
                .insert({
                    event_id: eventId,
                    name: participantName,
                })
                .select()
                .single();

            if (participantError) throw participantError;

            const participantId = participantData.id;

            // 2. Filter and insert availabilities
            const validAvailabilities = availabilities.filter(a => a.start_time && a.end_time);
            
            if (validAvailabilities.length === 0) {
                // Navigate to result page even if no times are submitted
                navigate(`/result/${eventId}`);
                return;
            }

            const timezoneOffset = getLocalTimezoneOffset();
            const availabilityPromises = validAvailabilities.map((avail) => {
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
                // Basic error handling: log and alert
                console.error("Error inserting availabilities:", availabilityErrors);
                alert("空き時間の登録中にエラーが発生しました。");
                // TODO: Consider more robust error handling, e.g., deleting the created participant
                return;
            }

            // 3. Redirect to result page
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
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{event.description}</p>
                <p className="mb-6"><span className="font-bold">会議時間:</span> {event.duration_minutes}分</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="participantName" className="label">
                        <span className="label-text text-lg font-semibold">あなたの名前</span>
                    </label>
                    <input
                        id="participantName"
                        type="text"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        className="input input-bordered w-full"
                        required
                        placeholder="山田 太郎"
                    />
                </div>

                <div>
                    <h2 className="text-xl font-bold mt-6 mb-4">あなたの空き時間を入力してください</h2>
                    <div className="space-y-4">
                        {candidates.map((candidate) => (
                            <div key={candidate.id} className="p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg">{new Date(candidate.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</h3>
                                <p className="text-gray-500 mb-4">
                                    候補時間: {candidate.start_time.substring(0, 5)} 〜 {candidate.end_time.substring(0, 5)}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">
                                            <span className="label-text">開始OKな時間</span>
                                        </label>
                                        <input
                                            type="time"
                                            onChange={(e) => handleAvailabilityChange(candidate.id, 'start_time', e.target.value)}
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text">終了OKな時間</span>
                                        </label>
                                        <input
                                            type="time"
                                            onChange={(e) => handleAvailabilityChange(candidate.id, 'end_time', e.target.value)}
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <button type="submit" className="btn btn-primary w-full">
                        回答を送信
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventDetailPage;