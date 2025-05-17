import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";

import { API_URLS, COMMON_HEADERS, REQUEST_TIMEOUT } from "./api-config";

// API Error Response interface
interface ApiErrorResponse {
  message?: string;
  errors?: string[];
  [key: string]: any; // Allow for other properties
}

// Custom error interface for API errors
export interface ApiError {
  status: number;
  message: string;
  errors?: string[];
  timestamp?: string;
}

// Extend AxiosRequestConfig to include our custom properties
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  retryCount?: number;
  requestId?: string;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * HTTP Client service using axios with interceptors for centralized API calls
 */
class HttpClient {
  private instance: AxiosInstance;
  private cancelTokens: Map<string, CancelTokenSource> = new Map();

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: REQUEST_TIMEOUT,
      headers: COMMON_HEADERS,
    });

    this.initializeInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private initializeInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Create a unique request identifier
        const requestId = this.getRequestId(config);

        // Add request ID to headers for logging/tracking
        config.headers = config.headers || {};
        config.headers["X-Request-ID"] = requestId;

        // Get token from localStorage
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        // If token exists, add to Authorization header
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request (in development)
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `🚀 Request: ${config.method?.toUpperCase()} ${config.url}`,
            {
              params: config.params,
              data: config.data,
            }
          );
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `✅ Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
              status: response.status,
              data: response.data,
            }
          );
        }

        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        // Get request config
        const config = error.config as ExtendedAxiosRequestConfig;

        // Handle request cancellation
        if (axios.isCancel(error)) {
          console.log("Request cancelled:", error.message);

          return Promise.reject(error);
        }

        // Log error in development
        if (process.env.NODE_ENV !== "production") {
          console.error(
            `❌ Error: ${config?.method?.toUpperCase()} ${config?.url}`,
            {
              status: (error as AxiosError<ApiErrorResponse>).response?.status,
              statusText: (error as AxiosError<ApiErrorResponse>).response
                ?.statusText,
              data: (error as AxiosError<ApiErrorResponse>).response?.data,
            }
          );
        }

        // Handle common errors and retry logic
        if ((error as AxiosError<ApiErrorResponse>).response) {
          const { status } = (error as AxiosError<ApiErrorResponse>).response!;
          const errorData: ApiErrorResponse =
            (error as AxiosError<ApiErrorResponse>).response?.data || {};

          // Authentication errors
          if (status === 401) {
            // Unauthorized - clear local storage and redirect to login
            if (typeof window !== "undefined") {
              localStorage.clear();
              window.location.href = "/login";
            }
          }

          // Retry logic for certain status codes
          if (
            config &&
            DEFAULT_RETRY_CONFIG.retryStatusCodes.includes(status) &&
            config.retryCount !== undefined &&
            config.retryCount < DEFAULT_RETRY_CONFIG.retries
          ) {
            config.retryCount = config.retryCount + 1;

            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                DEFAULT_RETRY_CONFIG.retryDelay * (config.retryCount ?? 0)
              )
            );

            return this.instance(config);
          }

          // Format error response
          const apiError: ApiError = {
            status,
            message: errorData.message || "An error occurred",
            errors: errorData.errors,
            timestamp: new Date().toISOString(),
          };

          return Promise.reject(apiError);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate a unique request ID based on the request config
   */
  private getRequestId(config: AxiosRequestConfig): string {
    const method = config.method || "get";
    const url = config.url || "";
    const timestamp = Date.now();

    return `${method}-${url}-${timestamp}`;
  }

  /**
   * Create a cancel token for a request
   */
  private createCancelToken(requestId: string): CancelTokenSource {
    // Cancel existing request with same ID if it exists
    if (this.cancelTokens.has(requestId)) {
      this.cancelTokens
        .get(requestId)
        ?.cancel("Operation canceled due to new request");
    }

    // Create new cancel token
    const source = axios.CancelToken.source();

    this.cancelTokens.set(requestId, source);

    return source;
  }

  /**
   * Cancel a specific request
   */
  public cancelRequest(requestId: string): boolean {
    if (this.cancelTokens.has(requestId)) {
      this.cancelTokens.get(requestId)?.cancel(`Request ${requestId} canceled`);
      this.cancelTokens.delete(requestId);

      return true;
    }

    return false;
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(reason = "Operation canceled"): void {
    this.cancelTokens.forEach((source) => {
      source.cancel(reason);
    });
    this.cancelTokens.clear();
  }

  /**
   * Generate a cancelable config for a request
   */
  private getCancelableConfig(
    config?: AxiosRequestConfig
  ): ExtendedAxiosRequestConfig {
    const requestConfig = config || {};
    const requestId = this.getRequestId(requestConfig);
    const source = this.createCancelToken(requestId);

    return {
      ...requestConfig,
      cancelToken: source.token,
      requestId,
      retryCount: 0, // Initialize retry count
    };
  }

  /**
   * Generic request method
   */
  public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const cancelableConfig = this.getCancelableConfig(config);
    const response: AxiosResponse<T> =
      await this.instance.request(cancelableConfig);

    return response.data;
  }

  /**
   * GET method
   */
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "get", url });
  }

  /**
   * POST method
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "post", url, data });
  }

  /**
   * PUT method
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "put", url, data });
  }

  /**
   * DELETE method
   */
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "delete", url }); // Fixed: removed duplicate config parameter
  }

  /**
   * PATCH method
   */
  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "patch", url, data });
  }
}

// Create client instances for different services
export const courseClient = new HttpClient(API_URLS.COURSE);
export const authClient = new HttpClient(API_URLS.AUTH);
export const majorClient = new HttpClient(API_URLS.MAJOR);
export const batchClient = new HttpClient(API_URLS.BATCH);
export const studentClient = new HttpClient(API_URLS.AUTH);
export const locationClient = new HttpClient(API_URLS.LOCATION);
export const buildingClient = new HttpClient(API_URLS.LOCATION); // Using same base URL as location
export const floorClient = new HttpClient(API_URLS.LOCATION); // Using same base URL as location
export const roomClient = new HttpClient(API_URLS.LOCATION); // Using same base URL as location
