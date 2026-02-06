interface EventHeaderProps {
    title: string;
    description: string;
    duration_minutes: number;        
}

export const EventHeader = ({title,description,duration_minutes}:EventHeaderProps) => {

    return (
        <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-lg text-gray-600 mb-4">{description}</p>
            <p className="mb-6"><span className="font-bold">会議時間:</span> {duration_minutes}分</p>
        </header>
    );
}