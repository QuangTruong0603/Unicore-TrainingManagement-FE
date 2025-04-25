import React from "react";

import DefaultLayout from "../../../layouts/default";

const ProgramSpecificationPage = () => {
  return (
    <DefaultLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Program Specification</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 mb-6">
            Program specifications and curriculum details will be displayed
            here.
          </p>
          {/* Content will be added here */}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProgramSpecificationPage;
