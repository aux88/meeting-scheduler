interface ParticipantNameInputPorps {
    participantName: string;
    onChangeParticipantName: (value: string)=>void;
}

export const ParticipantNameInput = ({participantName,onChangeParticipantName}:ParticipantNameInputPorps) => {

    return (
        <div>
            <label htmlFor="participantName" className="label">
                <span className="label-text text-lg font-semibold">あなたの名前</span>
            </label>
            <input
                id="participantName"
                type="text"
                value={participantName}
                onChange={(e) => onChangeParticipantName(e.target.value)}
                className="input input-bordered w-full"
                required
                placeholder="山田 太郎"
            />
        </div>
    );
}