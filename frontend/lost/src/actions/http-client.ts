import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios'
import { isEmpty } from 'lodash'
import { API_URL } from '../lost_settings'

class HttpClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        this.client.interceptors.request.use(this.handleRequest.bind(this), (error) =>
            Promise.reject(error),
        )

        this.client.interceptors.response.use(
            (response: AxiosResponse) => response,
            this.handleResponseError.bind(this),
        )
    }

    private handleRequest(
        config: InternalAxiosRequestConfig,
    ): InternalAxiosRequestConfig {
        const token =
            localStorage.getItem('token') === null ? '' : localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    }

    private handleResponseError(error: AxiosError): Promise<never> {
        return Promise.reject(error)
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config)
        return response.data
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config)
        return response.data
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config)
        return response.data
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config)
        return response.data
    }

    getFormattedQueryParams(obj: object) {
        const toSnakeCase = (str: string): string => {
            return str.replace(/([A-Z])/g, '_$1').toLowerCase()
        }

        const queryParams = Object.entries(obj).flatMap(([key, value]) => {
            const snakeCaseKey = toSnakeCase(key)

            if (
                value == undefined ||
                value == null ||
                (Array.isArray(value) && isEmpty(value))
            ) {
                return []
            }

            if (Array.isArray(value)) {
                return value.map((v) => `${snakeCaseKey}=${encodeURIComponent(v)}`)
            }

            return `${snakeCaseKey}=${encodeURIComponent(value)}`
        })

        return queryParams.join('&')
    }
}

const httpClient = new HttpClient()
export { HttpClient, httpClient }
