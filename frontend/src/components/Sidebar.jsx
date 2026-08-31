import { NavLink } from "react-router";
import {
  Home,
  PlusCircle,
  Users,
  MessageSquare,
  Heart,
  CircleUserRound,
  Settings,
} from "lucide-react";
import WormTwisted from "../assets/worm-twisted-mono.svg";
import WormStraight from "../assets/worm-straight-mono.svg";
import CandyWorm from "../assets/candy-worm.svg";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const userId = user?.id || "me";

  const navItems = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/create", label: "Create", icon: PlusCircle },
    { to: "/users", label: "Users", icon: Users },
    { to: "/messages", label: "Message", icon: MessageSquare },
    { to: "/likes", label: "Likes", icon: Heart },
    { to: `/profile/${userId}`, label: "Profile", icon: CircleUserRound },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className="sticky top-0 self-start h-screen flex flex-col justify-between shrink-0
             w-20 lg:w-64 bg-base-100
             py-6 px-2 lg:px-4 overflow-hidden transition-[width] duration-300"
    >
      {/* Background watermark worms — clipped, oversized, behind everything */}
      <img
        src={WormTwisted}
        alt=""
        aria-hidden="true"
        className="absolute -top-10 -left-16 w-56 h-56 lg:w-72 lg:h-72
                   opacity-[0.09] rotate-12 pointer-events-none select-none z-0"
      />
      <img
        src={WormStraight}
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 -right-20 w-48 h-48 lg:w-64 lg:h-64
                   opacity-[0.05] -rotate-45 pointer-events-none select-none z-0"
      />
      <img
        src={CandyWorm}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-16 -left-10 w-52 h-52 lg:w-64 lg:h-64
                   opacity-[0.09] rotate-45 pointer-events-none select-none z-0"
      />

      {/* Nav sits above the watermark layer */}
      <nav className="relative z-10 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-box px-3 py-3 lg:px-4 font-bold
               transition-colors duration-200 justify-center lg:justify-start
               ${
                 isActive
                   ? "bg-neutral text-neutral-content"
                   : "text-base-content hover:bg-base-200"
               }`
            }
          >
            <Icon size={22} className="shrink-0" />
            <span className="hidden lg:inline whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
