import { useState, useEffect, useCallback } from "react";
import { AxiosRequestConfig } from "axios";

import { ApiError } from "./http-client";

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  execute: () => Promise<T | null>;
  reset: () => void;
}

interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiMutationResult<T, D> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  mutate: (data: D) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for making GET requests
 */
export function useApiGet<T = any>(
  apiClient: any,
  url: string,
  config?: AxiosRequestConfig,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData = null, onSuccess, onError, enabled = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = (await apiClient.get(url, config)) as T;

      setData(response);
      onSuccess?.(response);

      return response;
    } catch (err) {
      const apiErr = err as ApiError;

      setError(apiErr);
      onError?.(apiErr);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, url, config, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  useEffect(() => {
    if (enabled) {
      execute();
    }
  }, [enabled, execute]);

  return { data, isLoading, error, execute, reset };
}

/**
 * Custom hook for making POST requests (mutations)
 */
export function useApiPost<T = any, D = any>(
  apiClient: any,
  url: string,
  config?: AxiosRequestConfig,
  options: UseApiMutationOptions<T> = {}
): UseApiMutationResult<T, D> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (mutationData: D): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = (await apiClient.post(url, mutationData, config)) as T;

        setData(response);
        onSuccess?.(response);

        return response;
      } catch (err) {
        const apiErr = err as ApiError;

        setError(apiErr);
        onError?.(apiErr);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, url, config, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, mutate, reset };
}

/**
 * Custom hook for making PUT requests
 */
export function useApiPut<T = any, D = any>(
  apiClient: any,
  url: string,
  config?: AxiosRequestConfig,
  options: UseApiMutationOptions<T> = {}
): UseApiMutationResult<T, D> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (mutationData: D): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.put(url, mutationData, config);

        setData(response);
        onSuccess?.(response);

        return response;
      } catch (err) {
        const apiErr = err as ApiError;

        setError(apiErr);
        onError?.(apiErr);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, url, config, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, mutate, reset };
}

/**
 * Custom hook for making DELETE requests
 */
export function useApiDelete<T = any>(
  apiClient: any,
  url: string,
  config?: AxiosRequestConfig,
  options: UseApiMutationOptions<T> = {}
): UseApiMutationResult<T, void> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = (await apiClient.delete(url, config)) as T;

      setData(response);
      onSuccess?.(response);

      return response;
    } catch (err) {
      const apiErr = err as ApiError;

      setError(apiErr);
      onError?.(apiErr);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, url, config, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, mutate, reset };
}

/**
 * Custom hook for making any API request with dynamic method
 */
export function useApiRequest<T = any, D = any>(
  apiClient: any,
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  config?: AxiosRequestConfig,
  options: UseApiMutationOptions<T> = {}
): UseApiMutationResult<T, D> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (mutationData?: D): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        let response;

        switch (method) {
          case "get":
            response = (await apiClient.get(url, config)) as T;
            break;
          case "post":
            response = await apiClient.post(url, mutationData, config);
            break;
          case "put":
            response = await apiClient.put(url, mutationData, config);
            break;
          case "delete":
            response = (await apiClient.delete(url, config)) as T;
            break;
          case "patch":
            response = (await apiClient.patch(url, mutationData, config)) as T;
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        setData(response);
        onSuccess?.(response);

        return response;
      } catch (err) {
        const apiErr = err as ApiError;

        setError(apiErr);
        onError?.(apiErr);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, method, url, config, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, mutate, reset };
}
