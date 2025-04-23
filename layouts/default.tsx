import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";

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

      {/* Main content area with navbar and content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* <Head /> */}
        <Navbar />

        <main className="flex-1 w-full overflow-y-auto">{children}</main>

        <footer className="flex-shrink-0 w-full flex items-center justify-center py-3">
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://www.heroui.com"
            title="heroui.com homepage"
          >
            <span className="text-default-600">Powered by</span>
            <p className="text-primary">HeroUI</p>
          </Link>
        </footer>
      </div>
    </div>
  );
}
