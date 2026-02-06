import { useCallback, useState } from "react";
import type { Candidate } from "../types/Candidate";

export const useCandidate = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([{ id: crypto.randomUUID(), date: "", start_time: "", end_time: "", event_id: undefined }]);

    const addCandidate = useCallback(() => {
        setCandidates((prev) => [
        ...prev,
        { id: crypto.randomUUID(), date: "", start_time: "", end_time: "", event_id: undefined }
        ]);
    },[]);

    const changeCandidate = useCallback((index: number, field: keyof Candidate, value: string) => {
        setCandidates((prev) => {
            const newCandidates = [...prev];
            newCandidates[index] = { ...newCandidates[index], [field]: value };
            return newCandidates;
        });
    },[]);

    const removeCandidate = useCallback((id: string) => {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
    },[]);

    return { candidates, addCandidate, changeCandidate, removeCandidate};
}