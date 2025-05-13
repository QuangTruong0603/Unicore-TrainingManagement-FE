import { useCallback } from "react";

import { majorGroupService } from "./major-group.service";
import { CreateMajorGroupData, UpdateMajorGroupData } from "./major-group.dto";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setMajorGroups,
  setError,
  setLoading,
  setTotal,
} from "@/store/slices/majorGroupSlice";

export const useMajorGroups = () => {
  const dispatch = useAppDispatch();
  const { majorGroups, query, total, isLoading, error } = useAppSelector(
    (state) => state.majorGroup
  );
  const fetchMajorGroups = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await majorGroupService.getMajorGroupsPagination(query);

      if (response && response.data) {
        dispatch(setMajorGroups(response.data.data));
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
  const updateMajorGroup = useCallback(
    async (id: string, data: UpdateMajorGroupData) => {
      try {
        await majorGroupService.updateMajorGroup(id, data);

        return await fetchMajorGroups();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchMajorGroups]
  );
  const createMajorGroup = useCallback(
    async (data: CreateMajorGroupData) => {
      try {
        await majorGroupService.createMajorGroup(data);

        return await fetchMajorGroups();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchMajorGroups]
  );

  const deleteMajorGroup = useCallback(
    async (id: string) => {
      try {
        await majorGroupService.deleteMajorGroup(id);

        return await fetchMajorGroups();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchMajorGroups]
  );

  return {
    majorGroups,
    query,
    total,
    isLoading,
    error,
    fetchMajorGroups,
    updateMajorGroup,
    createMajorGroup,
    deleteMajorGroup,
  };
};
