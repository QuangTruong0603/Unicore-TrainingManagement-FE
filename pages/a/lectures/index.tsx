import DefaultLayout from "@/layouts/default";

export default function LecturesPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Lectures Management</h1>
        <p className="text-gray-600">
          This page will contain the management of lectures. 
          Please use the navigation menu to access lecturer management or other features.
        </p>
      </div>
    </DefaultLayout>
  );
}
