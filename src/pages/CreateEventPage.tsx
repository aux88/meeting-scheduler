import { useNavigate } from "react-router-dom";
import { useCandidate } from "../hooks/useCandidate";
import { useCreateEvenet } from "../hooks/useCreateEvent";
import { EventForm } from "../components/event/EventForm"
import { createEvent } from "../services/eventService";

const CreateEventPage = () => {
    const {eventInfo, changeEventName, changeDescription, changeDuration} = useCreateEvenet();
    const {candidates,addCandidate,changeCandidate,removeCandidate} = useCandidate();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const eventId = await createEvent(eventInfo, candidates);
            navigate(`/event/${eventId}`);
        } catch (error: any) {
            console.error("Error creating event:", error);
            alert(error.message);
        }
    };

    return (
        <EventForm 
            handleSubmit = {handleSubmit}
            eventInfo = {eventInfo}
            changeEventName = {changeEventName}
            changeDescription = {changeDescription}
            changeDuration = {changeDuration}
            candidates = {candidates}
            addCandidate = {addCandidate}
            changeCandidate = {changeCandidate}
            removeCandidate = {removeCandidate}
        />
    );
};

export default CreateEventPage;