import { useCallback } from "react";

import { Department } from "./department.schema";
import { departmentService } from "./department.service";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setDepartments,
  setError,
  setLoading,
  setTotal,
} from "@/store/slices/departmentSlice";

export const useDepartments = () => {
  const dispatch = useAppDispatch();
  const { departments, query, total, isLoading, error } = useAppSelector(
    (state) => state.department
  );
  const fetchDepartments = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await departmentService.getDepartmentsPagination(query);

      if (response && response.data) {
        dispatch(setDepartments(response.data.data));
        if (response.data.total !== undefined) {
          dispatch(setTotal(response.data.total));
        }
      }
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [query, dispatch]);

  const updateDepartment = useCallback(
    async (id: string, data: Partial<Department>) => {
      try {
        await departmentService.updateDepartment(id, data);

        return await fetchDepartments();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchDepartments]
  );

  const createDepartment = useCallback(
    async (data: Partial<Department>) => {
      try {
        await departmentService.createDepartment(data);

        return await fetchDepartments();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchDepartments]
  );

  const deleteDepartment = useCallback(
    async (id: string) => {
      try {
        await departmentService.deleteDepartment(id);

        return await fetchDepartments();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchDepartments]
  );
  const activateDepartment = useCallback(
    async (id: string) => {
      try {
        await departmentService.activateDepartment(id);

        return await fetchDepartments();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchDepartments]
  );

  const deactivateDepartment = useCallback(
    async (id: string) => {
      try {
        await departmentService.deactivateDepartment(id);

        return await fetchDepartments();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchDepartments]
  );

  return {
    departments,
    query,
    total,
    isLoading,
    error,
    fetchDepartments,
    updateDepartment,
    createDepartment,
    deleteDepartment,
    activateDepartment,
    deactivateDepartment,
  };
};
