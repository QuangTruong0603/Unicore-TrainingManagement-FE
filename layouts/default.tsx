import Sidebar from "@/components/sidebar/sidebar";
import { Navbar } from "@/components/navbar/navbar";
import ConfirmDialog from "@/components/ui/confirm-dialog/confirm-dialog";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Sidebar on the left */}
      <div className="h-screen flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-grow">
        <Navbar />

        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 w-full overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* Global confirmation dialog */}
      <ConfirmDialog />
    </div>
  );
}
