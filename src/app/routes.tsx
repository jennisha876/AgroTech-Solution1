import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { DashboardRouter } from "./components/DashboardRouter";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { NotFound } from "./components/NotFound";
import { ResetPassword } from "./components/ResetPassword";
import { AdminDashboard } from "./components/AdminDashboard";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { HelpCenter } from "./components/HelpCenter";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "help-center", Component: HelpCenter },
      { path: "reset-password", Component: ResetPassword },
      { path: "dashboard", Component: DashboardRouter },
      { path: "admin", Component: AdminDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);
