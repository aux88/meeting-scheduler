import { useReducer } from "react";
import type { EventInfo } from "../types/EventInfo";

type Action = |{
        type: `eventName`;
        newEventName: string;
    }|{
        type: `description`;
        newEventDescription: string;
    }|{
        type: `duration`;
        newDuration: number;
    };

function reducer(state:EventInfo, action:Action) {
    switch (action.type) {
        case `eventName`:{
            return {...state, eventName: action.newEventName};
        }
        case `description`:{
            return {...state, description: action.newEventDescription};
        }
        case `duration`:{
            return {...state, duration: action.newDuration};
        }
    }
}

export const useCreateEvenet = () => {

    const initialEventInfo: EventInfo = {eventName:"",description:"",duration:30}
    const [eventInfo, dispatch] = useReducer(reducer, initialEventInfo);
    const changeEventName = (newEventName:string) =>{
        dispatch({type:'eventName',newEventName:newEventName})
    }
    const changeDescription = (newDescription:string) =>{
        dispatch({type:'description',newEventDescription:newDescription})
    }
    const changeDuration = (newDuration:number) =>{
        dispatch({type:'duration',newDuration:newDuration})
    }

    return { eventInfo, changeEventName, changeDescription, changeDuration};
}