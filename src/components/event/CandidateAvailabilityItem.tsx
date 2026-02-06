import type { Candidate } from "../../types/Candidate";

interface CandidateAvailabilityItemProps {
    candidate: Candidate;
    onChange: (id: string, field: "available_start" | "available_end", value: string) =>void;
}

export const CandidateAvailabilityItem = ({candidate, onChange}:CandidateAvailabilityItemProps) => {
    return(
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
                        onChange={(e) => onChange(candidate.id, 'available_start', e.target.value)}
                        className="input input-bordered w-full"
                    />
                </div>
                <div>
                    <label className="label">
                        <span className="label-text">終了OKな時間</span>
                    </label>
                    <input
                        type="time"
                        onChange={(e) => onChange(candidate.id, 'available_end', e.target.value)}
                        className="input input-bordered w-full"
                    />
                </div>
            </div>
        </div>
    );
}