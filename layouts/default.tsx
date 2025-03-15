import { Link } from "@heroui/link";
import { Head } from "./head";
import { Navbar } from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen">
      {/* Sidebar on the left */}
      <div className="h-screen">
        <Sidebar />
      </div>
      
      {/* Main content area with navbar and content */}
      <div className="flex flex-col flex-grow">
        {/* <Head /> */}
        <Navbar />
        
        <main className="container mx-auto max-w-7xl flex-grow overflow-y-auto">
          {children}
        </main>
        
        <footer className="w-full flex items-center justify-center py-3">
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