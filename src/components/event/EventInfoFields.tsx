import { memo } from "react";
import type { EventInfo } from "../../types/EventInfo";

interface EventInfoFieldsProps {
    eventInfo: EventInfo;
    changeEventName: (value:string) => void;
    changeDescription: (value:string) => void;
    changeDuration: (value:number) => void;
}

export const EventInfoFields = memo(({eventInfo, changeEventName, changeDescription, changeDuration}:EventInfoFieldsProps) =>{
    return (
        <>
            <div>
                <label className="label">
                    <span className="label-text">イベント名</span>
                </label>
                <input
                    type="text"
                    value={eventInfo.eventName}
                    onChange={(e)=>changeEventName(e.target.value)}
                    className="input input-bordered w-full"
                    required
                />
            </div>
            <div>
                <label className="label">
                    <span className="label-text">説明</span>
                </label>
                <textarea
                    value={eventInfo.description}
                    onChange={(e)=>changeDescription(e.target.value)}
                    className="textarea textarea-bordered w-full"
                ></textarea>
            </div>
            <div>
                <label className="label">
                    <span className="label-text">会議時間（分）</span>
                </label>
                <input
                    type="number"
                    value={eventInfo.duration}
                    onChange={(e)=>changeDuration(parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    required
                    min="1"
                />
            </div>
        </>
    );
})