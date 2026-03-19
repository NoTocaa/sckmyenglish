import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Answers } from "./pages/Answers";
import { Useful } from "./pages/Useful";
import { Rating } from "./pages/Rating";
import { GroupSelect } from "./pages/GroupSelect";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminHomework } from "./pages/admin/AdminHomework";
import { AdminUseful } from "./pages/admin/AdminUseful";
import { AdminSettings } from "./pages/admin/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "group", Component: GroupSelect },
      { path: "answers", Component: Answers },
      { path: "useful", Component: Useful },
      { path: "rating", Component: Rating },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "homework", Component: AdminHomework },
      { path: "useful", Component: AdminUseful },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);
