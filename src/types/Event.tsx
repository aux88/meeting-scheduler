export type Event = {
    id: string | undefined; //DBに登録される前はundefined
    title: string;
    description: string;
    duration_minutes: number
}