// src/utils/auth-guard.ts
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useIdentityStore } from 'src/stores/identity-store'

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const identityStore = useIdentityStore()
  await identityStore.checkLoggedIn()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // This route requires auth, check if logged in
    if (!identityStore.token) {
      // Not logged in, redirect to login page
      next({ name: 'login' })
    } else {
      next() // Logged in, proceed to route
    }
  } else if (to.matched.some((record) => record.meta.guestOnly)) {
    // Guest only routes (like login/register)
    if (identityStore.token) {
      // Logged in, redirect to index
      next({ name: 'index' })
    } else {
      next() // Not logged in, proceed to route
    }
  } else {
    next() // No auth requirements, proceed
  }
}
