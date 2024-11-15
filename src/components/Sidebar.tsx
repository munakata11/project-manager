import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  FolderKanban,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { icon: FolderKanban, label: "プロジェクト", path: "/projects" },
  { icon: Calendar, label: "カレンダー", path: "/calendar" },
  { icon: MessageSquare, label: "メッセージ", path: "/messages" },
  { icon: Users, label: "チーム", path: "/team" },
  { icon: Settings, label: "設定", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-white">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-purple-600">ワークフロー</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}