import React from "react";
import { Button, Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import { Edit, Trash2, Download } from "lucide-react";

import { MaterialType } from "@/services/material-type/material-type.schema";
import { Material } from "@/services/material/material.schema";
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
            className="text-primary hover:underline text-sm"
            href={material.fileUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            View File
          </a>
        )}
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        {material.fileUrl && (
          <Button
            download
            isIconOnly
            as="a"
            color="primary"
            href={material.fileUrl}
            size="sm"
            target="_blank"
            variant="flat"
          >
            <Download size={16} />
          </Button>
        )}
        <Button
          isIconOnly
          color="warning"
          size="sm"
          variant="flat"
          onPress={() => onEdit(material)}
        >
          <Edit size={16} />
        </Button>
        <Button
          isIconOnly
          color="danger"
          size="sm"
          variant="flat"
          onPress={() => onDelete(material.id)}
        >
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};
