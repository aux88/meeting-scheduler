import type { CalculatedSlot } from "../../services/calculateMeeetingSlots";
import type { Availability } from "../../types/Availability";
import type { Candidate } from "../../types/Candidate";
import type { Participant } from "../../types/Participant";
import { formatDateToJapanese, formatTimeToJapanese, timeToMinutes } from "../../utils/time";

export interface ResultItemProps {
    candidate: Candidate;
    participants: Participant[];
    currentCandidateAvailabilities: Availability[];
    calculatedSlot: CalculatedSlot | undefined;
}

export const ResultItem = ({candidate,participants,currentCandidateAvailabilities,calculatedSlot}:ResultItemProps) => {

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
}