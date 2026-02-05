import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailPage from "./pages/EventDetailPage";
import ResultPage from "./pages/ResultPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/create",
        element: <CreateEventPage />,
    },
    {
        path: "/event/:eventId",
        element: <EventDetailPage />,
    },
    {
        path: "/result/:eventId",
        element: <ResultPage />,
    },
]);
