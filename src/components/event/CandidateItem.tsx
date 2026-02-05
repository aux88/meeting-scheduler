import type { Candidate } from "../../types/Candidate";

export interface CandidateItemProps {
    index: number;
    candidate: Candidate;
    onChange: (index: number, field: keyof Candidate, value: string)=>void;
    onDelete: (id: string) => void;
}

export const CandidateItem = ({index, candidate, onChange, onDelete }:CandidateItemProps) => {
    
    return (
        <div className="p-4 border rounded-md space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">候補 {index + 1}</h3>
                    <button
                        type="button"
                        onClick={() => onDelete(candidate.id)}
                        className="btn btn-ghost btn-sm text-gray-400 hover:text-gray-700"
                        aria-label="削除">✕</button>
            </div>
            <div>
                <label className="label">
                    <span className="label-text">日付</span>
                </label>
                <input
                    type="date"
                    value={candidate.date}
                    onChange={(e) => onChange(index, "date", e.target.value)}
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
                    onChange={(e) => onChange(index, "startTime", e.target.value)}
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
                    onChange={(e) => onChange(index, "endTime", e.target.value)}
                    className="input input-bordered w-full"
                    required
                />
            </div>
        </div>
    );
}