interface ShareLinkSectionProps {
    children: React.ReactNode;
}

export const ShareLinkSection = ({children}:ShareLinkSectionProps) => {
    return(
        <div className="mb-4">
            <div className="mb-6 p-4 bg-base-200 rounded-lg">
                <p className="text-lg font-semibold mb-2">リンクを共有:</p>
                {children}
            </div>
        </div>

    )
}