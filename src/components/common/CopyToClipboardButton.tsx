import { useState } from 'react';

interface CopyToClipboardButtonProps {
    textToCopy: string;
    buttonLabel?: string;
    className?: string;
}

const CopyToClipboardButton = ({ textToCopy, buttonLabel = "コピー", className = "" }:CopyToClipboardButtonProps) => {
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setShowCopiedMessage(true);
        setTimeout(() => {
            setShowCopiedMessage(false);
        }, 2000); // Hide "Copied!" message after 2 seconds
    };

    return (
        <div className="relative flex items-center flex-col">
            <button
                className={`btn btn-primary btn-sm w-16 ${className}`}
                onClick={handleCopy}
            >
                {buttonLabel}
            </button>
            {showCopiedMessage && (
                <div
                    className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2
                    whitespace-nowrap rounded-md bg-gray-400 px-3 py-1 text-xs text-white">
                    コピーしました！
                    <div
                    className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2
                    h-2 w-2 rotate-45 bg-gray-400">
                    </div>
                </div>
            )}
        </div>
    );
};

export default CopyToClipboardButton;