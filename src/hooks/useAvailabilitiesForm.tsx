import { useReducer } from "react";
import type { Availability } from "../types/Availability";
import { AvailabilitiesForm } from "../components/event/AvailabilitiesForm";

type Action = | {
    type: `changeParticipant`;
    newParticipantName: string;
}|{
    type: `changeAvailabilities`;
    candidateId: string;
    field: "available_start" | "available_end";
    value: string;
}|{
    type: `setAvailabilities`;
    newAvailabilities: Availability[];
};

type AvailabilitiesForm = {
    participantName: string;
    availabilities: Availability[];
}

function reducer(state:AvailabilitiesForm, action:Action){
    switch (action.type) {
        case `changeParticipant`:{
            return {...state, participantName: action.newParticipantName};
        }
        case `changeAvailabilities`:{
            const newAvailabilities = state.availabilities.map(a =>
                a.candidate_id === action.candidateId ? { ...a, [action.field]: action.value } : a
            );
            return {...state, availabilities: newAvailabilities};
        }
        case `setAvailabilities`:{
            return {...state, availabilities: action.newAvailabilities};
        }
    }
}

export const useAvailabilitiesForm = () =>{

    const initialAvailabilitiesForm = {participantName:"",availabilities:[]}
    const [availabilitiesForm, dispatch] = useReducer(reducer, initialAvailabilitiesForm);
    const changeParticipantName = (value:string) =>{
        dispatch({type:'changeParticipant',newParticipantName:value})
    }
    const changeAvailabilities = (candidateId: string, field: "available_start" | "available_end", value: string) =>{
        dispatch({type:'changeAvailabilities',candidateId,field,value});
    }
    const setAvailabilities = (values:Availability[]) =>{
        dispatch({type:'setAvailabilities',newAvailabilities:values})
    }

    return { availabilitiesForm, changeParticipantName, changeAvailabilities, setAvailabilities};
}