import { useReducer } from "react";
import type { Event } from "../types/Event";

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

function reducer(state:Event, action:Action) {
    switch (action.type) {
        case `eventName`:{
            return {...state, title: action.newEventName};
        }
        case `description`:{
            return {...state, description: action.newEventDescription};
        }
        case `duration`:{
            return {...state, duration_minutes: action.newDuration};
        }
    }
}

export const useCreateEvenet = () => {

    const initialEventInfo: Event = {id:undefined,title:"",description:"",duration_minutes:30}
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