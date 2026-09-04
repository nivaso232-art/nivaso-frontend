import { create } from 'zustand'
import type { Entitlements } from '@/types/entitlements'
import { flagEnabled, type FlagKey } from '@/types/entitlements'

interface EntitlementState {
  entitlements: Entitlements | null
  isLoaded: boolean
  setEntitlements: (e: Entitlements | null) => void
  setLoaded: (loaded: boolean) => void
  can: (flag: FlagKey) => boolean
}

export const useEntitlementStore = create<EntitlementState>((set, get) => ({
  entitlements: null,
  isLoaded: false,
  setEntitlements: (e) => set({ entitlements: e }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  can: (flag) => {
    const { entitlements, isLoaded } = get()
    if (!isLoaded) return false
    if (entitlements === null) return true  // fetch completed but failed — fail-open
    return flagEnabled(entitlements, flag)
  },
}))
