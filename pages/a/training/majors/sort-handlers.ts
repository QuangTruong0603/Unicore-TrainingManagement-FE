import { useCallback } from "react";

import { useAppDispatch } from "@/store/hooks";
import { setQuery as setMajorQuery } from "@/store/slices/majorSlice";
import { setQuery as setMajorGroupQuery } from "@/store/slices/majorGroupSlice";
import { setQuery as setDepartmentQuery } from "@/store/slices/departmentSlice";

export const useSortHandlers = (
  majorQuery: any,
  majorGroupQuery: any,
  departmentQuery: any
) => {
  const dispatch = useAppDispatch();

  // Helper function to handle nested property keys
  const handleNestedKey = (key: string) => {
    return key.includes(".") ? key.split(".")[0] : key;
  };

  // Major sort handler
  const handleMajorSort = useCallback(
    (key: string) => {
      const orderByKey = handleNestedKey(key);

      dispatch(
        setMajorQuery({
          ...majorQuery,
          orderBy: orderByKey,
          isDesc:
            majorQuery.orderBy === orderByKey ? !majorQuery.isDesc : false,
        })
      );
    },
    [dispatch, majorQuery]
  );

  // Major page change handler
  const handleMajorPageChange = useCallback(
    (page: number) => {
      dispatch(setMajorQuery({ ...majorQuery, pageNumber: page }));
    },
    [dispatch, majorQuery]
  );

  // Major Group sort handler
  const handleMajorGroupSort = useCallback(
    (key: string) => {
      const orderByKey = handleNestedKey(key);

      dispatch(
        setMajorGroupQuery({
          ...majorGroupQuery,
          orderBy: orderByKey,
          isDesc:
            majorGroupQuery.orderBy === orderByKey
              ? !majorGroupQuery.isDesc
              : false,
        })
      );
    },
    [dispatch, majorGroupQuery]
  );

  // Major Group page change handler
  const handleMajorGroupPageChange = useCallback(
    (page: number) => {
      dispatch(setMajorGroupQuery({ ...majorGroupQuery, pageNumber: page }));
    },
    [dispatch, majorGroupQuery]
  );

  // Department sort handler
  const handleDepartmentSort = useCallback(
    (key: string) => {
      const orderByKey = handleNestedKey(key);

      dispatch(
        setDepartmentQuery({
          ...departmentQuery,
          orderBy: orderByKey,
          isDesc:
            departmentQuery.orderBy === orderByKey
              ? !departmentQuery.isDesc
              : false,
        })
      );
    },
    [dispatch, departmentQuery]
  );

  // Department page change handler
  const handleDepartmentPageChange = useCallback(
    (page: number) => {
      dispatch(setDepartmentQuery({ ...departmentQuery, pageNumber: page }));
    },
    [dispatch, departmentQuery]
  );

  return {
    handleMajorSort,
    handleMajorPageChange,
    handleMajorGroupSort,
    handleMajorGroupPageChange,
    handleDepartmentSort,
    handleDepartmentPageChange,
  };
};
