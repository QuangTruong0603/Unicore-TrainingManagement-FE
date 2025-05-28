import { API_ENDPOINTS } from "../api/api-config";
import { courseClient } from "../api/http-client";
import { BaseResponse } from "../dto";
import {
  MaterialType,
  MaterialTypeListResponse,
  MaterialTypeQuery,
  MaterialTypeCreateDto,
  MaterialTypeUpdateDto,
} from "./material-type.schema";

class MaterialTypeService {
  async getMaterialTypes(query: MaterialTypeQuery): Promise<BaseResponse<MaterialTypeListResponse["data"]>> {
    let params: Record<string, string> = {
      "Pagination.PageNumber": query.pageNumber?.toString() || "1",
      "Pagination.ItemsPerpage": query.itemsPerpage?.toString() || "10",
    };

    // Add order parameters if provided
    if (query.orderBy) {
      params["Order.By"] =
        query.orderBy.charAt(0).toUpperCase() + query.orderBy.slice(1);
    }

    if (query.isDesc !== undefined) {
      params["Order.IsDesc"] = query.isDesc.toString();
    }

    // Add filters if provided
    if (query.filter) {
      if (query.filter.name) {
        params["Filter.Name"] = query.filter.name;
      }
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return courseClient.get(
      `${API_ENDPOINTS.COURSES}/material-types/page`,
      {
        params: searchParams,
        paramsSerializer: (params) => params.toString(),
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async createMaterialType(data: MaterialTypeCreateDto): Promise<BaseResponse<MaterialType>> {
    return courseClient.post(
      `${API_ENDPOINTS.COURSES}/material-types`,
      data,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async updateMaterialType(id: string, data: MaterialTypeUpdateDto): Promise<BaseResponse<MaterialType>> {
    return courseClient.put(
      `${API_ENDPOINTS.COURSES}/material-types/${id}`,
      data,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async activateMaterialType(id: string): Promise<BaseResponse<MaterialType>> {
    return courseClient.post(
      `${API_ENDPOINTS.COURSES}/material-types/${id}/activate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async deactivateMaterialType(id: string): Promise<BaseResponse<MaterialType>> {
    return courseClient.post(
      `${API_ENDPOINTS.COURSES}/material-types/${id}/deactivate`,
      {},
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async toggleStatus(id: string): Promise<BaseResponse<MaterialType>> {
    const materialType = await this.getMaterialTypeById(id);

    if (materialType.data.isActive) {
      return this.deactivateMaterialType(id);
    } else {
      return this.activateMaterialType(id);
    }
  }

  async getMaterialTypeById(id: string): Promise<BaseResponse<MaterialType>> {
    return courseClient.get(
      `${API_ENDPOINTS.COURSES}/material-types/${id}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async getAllMaterialTypes(): Promise<BaseResponse<MaterialType[]>> {
    return courseClient.get(
      `${API_ENDPOINTS.COURSES}/material-types`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }
}

export const materialTypeService = new MaterialTypeService(); 