import { memo } from "react";
import type { Candidate } from "../../types/Candidate"
import { CandidateItem } from "./CandidateItem";

interface CandidateListProps {
    candidates: Candidate[];
    onChange: (index: number, field: keyof Candidate, value: string)=>void;
    onDelete: (id: string) => void;
}

export const CandidateList = memo(({candidates, onChange, onDelete}:CandidateListProps) =>{
    return (
        <>
            {candidates.map((candidate, index) => (
            <CandidateItem key={candidate.id} index={index} candidate={candidate} onChange={onChange} onDelete={onDelete}/>
            ))}
        </>       
)})