import { Sidebar } from "@/components/navigation/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="protected-layout">
      <Sidebar />
      <main className="protected-main">{children}</main>
    </div>
  );
}
