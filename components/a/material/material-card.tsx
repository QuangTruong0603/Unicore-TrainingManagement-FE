import React from "react";
import { Button, Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import { Edit, Trash2 } from "lucide-react";

import { MaterialType } from "@/services/material-type/material-type.schema";
import {
  Material,
} from "@/services/material/material.schema";
interface MaterialCardProps {
  material: Material;
  materialType?: MaterialType;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  materialType,
  onEdit,
  onDelete,
}) => {
  return (
    <Card key={material.id} className="shadow-sm">
      <CardHeader className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{material.name}</h3>
          <span className="text-xs bg-orange-100 text-primary px-2 py-1 rounded-full">
            {materialType?.name || "Unknown Type"}
          </span>
        </div>
      </CardHeader>
      <CardBody>
        {material.fileUrl && (
          <a
            href={material.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            View File
          </a>
        )}
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="warning"
          onPress={() => onEdit(material)}
        >
          <Edit size={16} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="danger"
          onPress={() => onDelete(material.id)}
        >
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};
