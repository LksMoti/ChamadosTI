import { createBrowserRouter } from "react-router";
import { ProfileSelector } from "./pages/ProfileSelector";
import { ClientLayout } from "./components/ClientLayout";
import { TechnicianLayout } from "./components/TechnicianLayout";
import { ClientDashboard } from "./pages/client/ClientDashboard";
import { ClientNewTicket } from "./pages/client/ClientNewTicket";
import { ClientTicketDetails } from "./pages/client/ClientTicketDetails";
import { TechnicianDashboard } from "./pages/technician/TechnicianDashboard";
import { TechnicianTickets } from "./pages/technician/TechnicianTickets";
import { TechnicianTicketDetails } from "./pages/technician/TechnicianTicketDetails";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ProfileSelector,
  },
  {
    path: "/cliente",
    Component: ClientLayout,
    children: [
      { index: true, Component: ClientDashboard },
      { path: "novo-chamado", Component: ClientNewTicket },
      { path: "chamado/:id", Component: ClientTicketDetails },
    ],
  },
  {
    path: "/tecnico",
    Component: TechnicianLayout,
    children: [
      { index: true, Component: TechnicianDashboard },
      { path: "chamados", Component: TechnicianTickets },
      { path: "chamado/:id", Component: TechnicianTicketDetails },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);