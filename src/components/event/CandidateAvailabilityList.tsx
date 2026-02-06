import type { Candidate } from "../../types/Candidate";
import { CandidateAvailabilityItem } from "./CandidateAvailabilityItem";

interface CandidateAvailabilityListProps {
    candidates: Candidate[]
    onChangeAvailabilities: (id: string, field: "available_start" | "available_end", value: string) =>void;
}

export const CandidateAvailabilityList = ({candidates,onChangeAvailabilities}:CandidateAvailabilityListProps) => {
    
    return (
        <div>
            <h2 className="text-xl font-bold mt-6 mb-4">あなたの空き時間を入力してください</h2>
            <div className="space-y-4">
                {candidates.map((candidate) => (
                    <CandidateAvailabilityItem 
                        key={candidate.id}
                        candidate={candidate}
                        onChange={onChangeAvailabilities}
                    />
                ))}
            </div>
        </div>
    );
}