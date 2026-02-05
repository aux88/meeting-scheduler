import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getLocalTimezoneOffset } from "../utils/time";

type Candidate = {
    date: string;
    startTime: string;
    endTime: string;
};

const CreateEventPage = () => {
    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(30);
    const [candidates, setCandidates] = useState<Candidate[]>([{ date: "", startTime: "", endTime: "" }]);

    const navigate = useNavigate();

    const handleAddCandidate = () => {
        setCandidates([...candidates, { date: "", startTime: "", endTime: "" }]);
    };

    const handleCandidateChange = (index: number, field: keyof Candidate, value: string) => {
        const newCandidates = [...candidates];
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 1. Insert into events table
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .insert({
                    title: eventName,
                    description: description,
                    duration_minutes: duration,
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
                // TODO: Handle potential partial success? For now, just log the errors.
                console.error("Error inserting candidates:", candidateErrors);
                // Maybe delete the event if candidates fail to insert?
                await supabase.from("events").delete().match({ id: eventId });
                alert("候補日程の登録に失敗しました。");
                return;
            }

            // 3. Redirect to the event page
            navigate(`/event/${eventId}`);

        } catch (error) {
            console.error("Error creating event:", error);
            alert("イベントの作成に失敗しました。");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">新しいイベントを作成</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">
                        <span className="label-text">イベント名</span>
                    </label>
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                <div>
                    <label className="label">
                        <span className="label-text">説明</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="textarea textarea-bordered w-full"
                    ></textarea>
                </div>
                <div>
                    <label className="label">
                        <span className="label-text">会議時間（分）</span>
                    </label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        required
                        min="1"
                    />
                </div>

                <h2 className="text-xl font-bold mt-6">候補日程</h2>
                {candidates.map((candidate, index) => (
                    <div key={index} className="p-4 border rounded-md space-y-2">
                        <h3 className="font-semibold">候補 {index + 1}</h3>
                        <div>
                            <label className="label">
                                <span className="label-text">日付</span>
                            </label>
                            <input
                                type="date"
                                value={candidate.date}
                                onChange={(e) => handleCandidateChange(index, "date", e.target.value)}
                                className="input input-bordered w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text">開始時刻</span>
                            </label>
                            <input
                                type="time"
                                value={candidate.startTime}
                                onChange={(e) => handleCandidateChange(index, "startTime", e.target.value)}
                                className="input input-bordered w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text">終了時刻</span>
                            </label>
                            <input
                                type="time"
                                value={candidate.endTime}
                                onChange={(e) => handleCandidateChange(index, "endTime", e.target.value)}
                                className="input input-bordered w-full"
                                required
                            />
                        </div>
                    </div>
                ))}
                <button type="button" onClick={handleAddCandidate} className="btn btn-outline">
                    候補日程を追加
                </button>

                <div className="mt-6">
                    <button type="submit" className="btn btn-primary w-full">
                        イベントを作成
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEventPage;