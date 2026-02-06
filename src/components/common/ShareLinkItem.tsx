import CopyToClipboardButton from "./CopyToClipboardButton";

interface ShareLinkItemProps {
    label :string;
    eventId :string;
}

export const ShareLinkItem = ({label,eventId}:ShareLinkItemProps) => {

    return (
        <div className="mb-2">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/event/${eventId}`}
                    className="input input-bordered w-full input-sm"
                />
                <CopyToClipboardButton textToCopy={`${window.location.origin}/event/${eventId}`} buttonLabel="コピー" className="btn-sm" />
            </div>
        </div>
    );
}