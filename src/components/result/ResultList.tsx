import type { CalculatedSlot } from "../../services/calculateMeeetingSlots";
import type { Availability } from "../../types/Availability";
import type { Candidate } from "../../types/Candidate";
import type { Participant } from "../../types/Participant";
import { ResultItem } from "./ResultItem";

interface ResultListProps {
    candidates: Candidate[];
    availabilities: Availability[];
    participants: Participant[];
    calculatedMeetingSlots : CalculatedSlot[];
}


export const ResultList = ({candidates, availabilities, participants, calculatedMeetingSlots}:ResultListProps) =>{
    return (
        <>
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
                <ResultItem
                    key={candidate.id}
                    candidate={candidate}
                    participants={participants}
                    currentCandidateAvailabilities={currentCandidateAvailabilities}
                    calculatedSlot={calculatedSlot}
                />
                );
            })}
            </ul>
        ) : (
            <p>候補がありません。</p>
        )}
    </>
    );
}