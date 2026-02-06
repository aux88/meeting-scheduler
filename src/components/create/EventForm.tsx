import type { Candidate } from "../../types/Candidate";
import type { Event } from "../../types/Event";
import { CandidateList } from "./CandidateList";
import { EventInfoFields } from "./EventInfoFields";

interface EventFormProps {
    handleSubmit: (e:React.FormEvent)=>void;
    eventInfo: Event;
    changeEventName: (value: string)=>void;
    changeDescription: (value: string)=>void;
    changeDuration: (value: number)=>void;
    candidates: Candidate[];
    addCandidate: ()=>void;
    changeCandidate: (index: number, field: keyof Candidate, value: string)=>void;
    removeCandidate: (id: string)=>void;
}

export const EventForm = ({
    handleSubmit,
    eventInfo,
    changeEventName,
    changeDescription,
    changeDuration,
    candidates,
    addCandidate,
    changeCandidate,
    removeCandidate,
}:EventFormProps) => {
    
    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">新しいイベントを作成</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <EventInfoFields
                    eventInfo ={eventInfo}
                    changeEventName = {changeEventName}
                    changeDescription = {changeDescription}
                    changeDuration = {changeDuration}            
                />
                <h2 className="text-xl font-bold mt-6">候補日程</h2>
                <CandidateList candidates={candidates} onChange={changeCandidate} onDelete={removeCandidate}/>
                <button type="button" onClick={addCandidate} className="btn btn-outline">
                    候補日程を追加
                </button>

                <div className="mt-6">
                    <button type="submit" className="btn btn-primary w-full">
                        イベントを作成
                    </button>
                </div>
            </form>
        </div>
    )
} 