import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-base-100 flex justify-center">
      <div className="flex w-full max-w-6xl">
        <Sidebar />
        <main className="flex-1 min-w-0 border-x border-base-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
