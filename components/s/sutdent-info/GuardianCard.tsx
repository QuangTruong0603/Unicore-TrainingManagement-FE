import { Chip } from "@heroui/react";
import { User, Phone } from "lucide-react";

import { Guardian } from "./types";

interface GuardianCardProps {
  guardian: Guardian;
}

export const GuardianCard = ({ guardian }: GuardianCardProps) => (
  <div className="bg-purple-50 rounded-md p-4">
    <div className="flex justify-between items-start">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="text-purple-600 h-4 w-4" />
          <div>
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm text-gray-800">{guardian.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="text-purple-600 h-4 w-4" />
          <div>
            <p className="text-xs text-gray-500">Phone Number</p>
            <p className="text-sm text-gray-800">{guardian.phoneNumber}</p>
          </div>
        </div>
      </div>

      <Chip
        className="bg-purple-100 text-purple-700 border-none text-xs"
        size="sm"
      >
        {guardian.relationship}
      </Chip>
    </div>
  </div>
);
