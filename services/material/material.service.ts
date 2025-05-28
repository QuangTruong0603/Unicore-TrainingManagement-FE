import { API_ENDPOINTS } from "../api/api-config";
import { courseClient } from "../api/http-client";
import { BaseResponse } from "../dto";
import {
  Material,
  MaterialListResponse,
  MaterialQuery,
  MaterialCreateDto,
  MaterialUpdateDto,
} from "./material.schema";

class MaterialService {
  async getMaterials(
    courseId: string,
    query: MaterialQuery
  ): Promise<BaseResponse<MaterialListResponse["data"]>> {
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

      if (query.filter.materialTypeId) {
        params["Filter.MaterialTypeId"] = query.filter.materialTypeId;
      }

      if (query.filter.hasFile !== undefined) {
        params["Filter.HasFile"] = query.filter.hasFile.toString();
      }

      if (query.filter.courseId) {
        params["Filter.CourseId"] = query.filter.courseId;
      }
    }

    // Add direct filters
    if (query.materialTypeId) {
      params["Filter.MaterialTypeId"] = query.materialTypeId;
    }

    if (query.hasFile !== undefined) {
      params["Filter.HasFile"] = query.hasFile.toString();
    }

    // Create URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add all params to searchParams
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return courseClient.get(
      `${API_ENDPOINTS.COURSES}/${courseId}/course-materials/page`,
      {
        params: searchParams,
        paramsSerializer: (params) => params.toString(),
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async createMaterial(
    courseId: string,
    data: MaterialCreateDto
  ): Promise<BaseResponse<Material>> {
    return courseClient.post(
      `${API_ENDPOINTS.COURSES}/${courseId}/course-materials`,
      data,
      {
        headers: {
          accept: "text/plain",
          "Content-Type": "application/json"
        },
      }
    );
  }

  async updateMaterial(
    courseId: string,
    id: string,
    data: MaterialUpdateDto
  ): Promise<BaseResponse<Material>> {
    console.log(data);
    const formData = new FormData();
    formData.append('Name', data.name);
    
    if (data.materialTypeId) {
      formData.append('MaterialTypeId', data.materialTypeId);
    }
    
    if (data.file) {
      formData.append('File', data.file, data.file.name);
    }

    return courseClient.put(
      `${API_ENDPOINTS.COURSES}/${courseId}/course-materials/${id}`,
      formData,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async deleteMaterial(courseId: string, id: string): Promise<void> {
    // Validate parameters
    if (!courseId) {
      throw new Error("Course ID is required");
    }
    
    if (!id) {
      throw new Error("Material ID is required");
    }
    
    console.log(`Deleting material with ID: ${id} from course: ${courseId}`);
    
    await courseClient.delete(
      `${API_ENDPOINTS.COURSES}/${courseId}/course-materials/${id}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async getMaterialById(
    courseId: string,
    id: string
  ): Promise<BaseResponse<Material>> {
    return courseClient.get(
      `${API_ENDPOINTS.COURSES}/${courseId}/course-materials/${id}`,
      {
        headers: {
          accept: "text/plain",
        },
      }
    );
  }

  async getAllMaterials(
    courseId: string,
    materialTypeId?: string
  ): Promise<BaseResponse<Material[]>> {
    let url = `${API_ENDPOINTS.COURSES}/${courseId}/course-materials`;
    const params = new URLSearchParams();

    if (materialTypeId) {
      params.append("materialTypeId", materialTypeId);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return courseClient.get(url, {
      headers: {
        accept: "text/plain",
      },
    });
  }

  async createMaterialWithFile(
    courseId: string,
    name: string,
    file: File,
    materialTypeId: string
  ): Promise<BaseResponse<Material>> {
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('File', file, file.name);
    formData.append('MaterialTypeId', materialTypeId);

    return courseClient.post(
      `${API_ENDPOINTS.COURSES}/${courseId}/course-materials`,
      formData,
      {
        headers: {
          accept: "text/plain"
        }
      }
    );
  }

  /**
   * @deprecated Use updateMaterial instead which now supports file uploads
   */
  async updateMaterialWithFile(
    courseId: string,
    id: string,
    name: string,
    file?: File,
    materialTypeId?: string
  ): Promise<BaseResponse<Material>> {
    const formData = new FormData();
    formData.append('Name', name);
    
    if (file) {
      formData.append('File', file, file.name);
    }
    
    if (materialTypeId) {
      formData.append('MaterialTypeId', materialTypeId);
    }

    return courseClient.put(
      `${API_ENDPOINTS.COURSES}/${courseId}/course-materials/${id}`,
      formData,
      {
        headers: {
          accept: "text/plain"
        }
      }
    );
  }
}

export const materialService = new MaterialService();
