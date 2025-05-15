import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Location, LocationQuery } from "./location.schema";
import { locationService } from "./location.service";
import { 
  setLocations, 
  setError, 
  setLoading, 
  setTotal,
  setQuery as setLocationQuery
} from "@/store/slices/locationSlice";
import { CreateLocationData } from "./location.dto";

export const useReduxLocations = () => {
  const dispatch = useAppDispatch();
  const { locations, query, total, isLoading, error } = useAppSelector(
    (state) => state.location
  );

  const fetchLocations = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await locationService.getLocations(query);
      if (response && response.data) {
        dispatch(setLocations(response.data.data));
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

  const createLocation = useCallback(
    async (data: CreateLocationData) => {
      try {
        await locationService.createLocation(data);
        return await fetchLocations();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchLocations]
  );

  const activateLocation = useCallback(
    async (id: string) => {
      try {
        await locationService.activateLocation(id);
        return await fetchLocations();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchLocations]
  );

  const deactivateLocation = useCallback(
    async (id: string) => {
      try {
        await locationService.deactivateLocation(id);
        return await fetchLocations();
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      }
    },
    [dispatch, fetchLocations]
  );

  return {
    locations,
    query,
    total,
    isLoading,
    error,
    fetchLocations,
    createLocation,
    activateLocation,
    deactivateLocation,
    setQuery: (query: LocationQuery) => dispatch(setLocationQuery(query))
  };
};
