"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

// export interface ApiError {
//     status: number
//     message: string
//     errors?: Record<string, string[]> // lỗi theo field
//     body?: any // full JSON từ backend
// }
//
// export interface ApiState<T> {
//     data: T | null
//     loading: boolean
//     error: ApiError | null
// }


// export function useApi<T>() {
//     const [state, setState] = useState<ApiState<T>>({
//         data: null,
//         loading: false,
//         error: null,
//     })
//
//     const execute = useCallback(
//         async (
//             apiCall: () => Promise<T>,
//             options?: {
//                 successMessage?: string
//                 errorMessage?: string
//                 onSuccess?: (data: T) => void
//                 onError?: (error: Error) => void
//             },
//         ) => {
//             setState((prev) => ({ ...prev, loading: true, error: null }))
//
//             try {
//                 const data = await apiCall()
//                 setState({ data, loading: false, error: null })
//
//                 if (options?.successMessage) {
//                     console.log("toast success:", options.successMessage)
//                     toast.success(options.successMessage)
//                 }
//
//                 if (options?.onSuccess) {
//                     options.onSuccess(data)
//                 }
//
//                 return data
//             } catch (error) {
//                 const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
//                 setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
//
//                 if (options?.errorMessage) {
//                     toast.error(options.errorMessage)
//                 } else {
//                     toast.error(errorMessage)
//                 }
//
//                 if (options?.onError) {
//                     options.onError(error instanceof Error ? error : new Error(errorMessage))
//                 }
//
//                 throw error
//             }
//         },
//         [],
//     )
//
//     const reset = useCallback(() => {
//         setState({ data: null, loading: false, error: null })
//     }, [])
//
//     return {
//         ...state,
//         execute,
//         reset,
//     }
// }

export interface ApiError {
    status?: number
    message: string
    errors?: Record<string, string[]>
    body?: any
}

export interface ApiState<T> {
    data: T | null
    loading: boolean
    error: ApiError | null
}

export function useApi<T>() {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    })

    const execute = useCallback(
        async (
            apiCall: () => Promise<T>,
            options?: {
                successMessage?: string
                errorMessage?: string
                onSuccess?: (data: T) => void
                onError?: (error: ApiError) => void
            },
        ) => {
            setState(prev => ({ ...prev, loading: true, error: null }))

            try {
                const data = await apiCall()
                setState({ data, loading: false, error: null })

                if (options?.successMessage) {
                    toast.success(options.successMessage)
                }
                options?.onSuccess?.(data)
                return data
            } catch (err: any) {

                let error: ApiError = {
                    message: "Đã xảy ra lỗi",
                }

                if (err instanceof Response) {
                    const body = await err.json().catch(() => null)

                    error = {
                        status: err.status,
                        message: body?.title || err.statusText || "Lỗi từ server",
                        errors: body?.errors || null,
                        body,
                    }
                    // console.log(error)
                } else if (err instanceof Error) {
                    error = {
                        message: err.message,
                    }
                }

                setState(prev => ({ ...prev, loading: false, error }))

                if (options?.errorMessage) {
                    toast.error(options.errorMessage)
                } else {
                    toast.error(error.message)
                }

                options?.onError?.(error)
                throw error
            }
        },
        [],
    )

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null })
    }, [])

    return {
        ...state,
        execute,
        reset,
    }
}

// Specialized hooks for different entities
export function useUsers() {
    return useApi<any>()
}

export function useRoles(){
    return useApi<any>()
}

export function useUser() {
    return useApi<any>()
}

export function useAddresses() {
    return useApi<any>()
}

export function useOrders() {
    return useApi<any>()
}

export function usePaymentMethods() {
    return useApi<any>()
}

export function useNotifications() {
    return useApi<any>()
}
