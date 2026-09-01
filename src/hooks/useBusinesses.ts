import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessesApi } from '@/api/businesses'
import type { CreateBusinessPayload, UpdateBusinessPayload } from '@/types/business'

export function useBusinesses() {
  return useQuery({ queryKey: ['businesses'], queryFn: businessesApi.list })
}

export function useBusiness(slug: string) {
  return useQuery({
    queryKey: ['businesses', slug],
    queryFn: () => businessesApi.get(slug),
    enabled: !!slug,
  })
}

export function useCreateBusiness() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBusinessPayload) => businessesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businesses'] }),
  })
}

export function useUpdateBusiness(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateBusinessPayload) => businessesApi.update(slug, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['businesses'] }),
  })
}
