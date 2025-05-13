import { useCallback } from "react";

import { Major } from "./major.schema";
import { majorService } from "./major.service";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setMajors,
  setError,
  setLoading,
  setTotal,
} from "@/store/slices/majorSlice";

export const useMajors = () => {
  const dispatch = useAppDispatch();
  const { majors, query, total, isLoading, error } = useAppSelector(
    (state) => state.major
  );
  const fetchMajors = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await majorService.getMajorsPagination(query);

      if (response && response.data) {
        dispatch(setMajors(response.data.data));
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

  const updateMajor = useCallback(
    async (id: string, data: Partial<Major>) => {
      try {
        await majorService.updateMajor(id, data);

        return await fetchMajors();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchMajors]
  );

  const createMajor = useCallback(
    async (data: Partial<Major>) => {
      try {
        await majorService.createMajor(data);

        return await fetchMajors();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchMajors]
  );

  const deleteMajor = useCallback(
    async (id: string) => {
      try {
        await majorService.deleteMajor(id);

        return await fetchMajors();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchMajors]
  );

  return {
    majors,
    query,
    total,
    isLoading,
    error,
    fetchMajors,
    updateMajor,
    createMajor,
    deleteMajor,
  };
};
