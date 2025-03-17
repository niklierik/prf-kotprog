import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { PermissionLevel } from '@kotprog/common';

export function hasPermissionGuard(
  permissionLevel: PermissionLevel,
): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const payload = authService.payload();
    if (!payload) {
      return router.createUrlTree(['login']);
    }

    if (!payload.permissionLevel) {
      return router.createUrlTree(['home']);
    }

    if (payload.permissionLevel < permissionLevel) {
      return router.createUrlTree(['home']);
    }

    return true;
  };
}
