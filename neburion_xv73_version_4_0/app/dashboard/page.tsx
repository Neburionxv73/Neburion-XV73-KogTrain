import { AppShell } from "@/components/layout/AppShell";
import { PlatformDashboard } from "@/components/dashboard/PlatformDashboard";

export default function Dashboard() {
  return <AppShell sidebar><PlatformDashboard /></AppShell>;
}
