import Link from "next/link";

import DefaultLayout from "../../layouts/default";

export default function sPage() {
  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/s/profile">
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <h2 className="text-xl font-semibold mb-2 text-blue-600">
                My Profile
              </h2>
              <p className="text-gray-600">
                View and manage your personal and academic information
              </p>
            </div>
          </Link>

          {/* More cards can be added here for other student functionalities */}
        </div>
      </div>
    </DefaultLayout>
  );
}
