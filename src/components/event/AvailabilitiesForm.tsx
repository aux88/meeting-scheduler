import type { Candidate } from "../../types/Candidate";
import { CandidateAvailabilityList } from "./CandidateAvailabilityList";
import { ParticipantNameInput } from "./ParticipantNameInput";

interface AvailabilitiesFormProps { 
    onSubmit : (e: React.FormEvent<Element>)=> void;
    onChangeParticipantName : (name : string)=> void;
    onChangeAvailabilities : (candidateId: string, field: "start_time" | "end_time", value: string)=> void;
    participantName :string;
    candidates: Candidate[];
}

export const AvailabilitiesForm = ({onSubmit, onChangeAvailabilities, onChangeParticipantName, participantName,candidates}:AvailabilitiesFormProps) =>{

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <ParticipantNameInput participantName={participantName} onChangeParticipantName={onChangeParticipantName} />
            <CandidateAvailabilityList candidates={candidates} onChangeAvailabilities={onChangeAvailabilities} />
            <div className="mt-8">
                <button type="submit" className="btn btn-primary w-full">
                    回答を送信
                </button>
            </div>
        </form>
    );
}