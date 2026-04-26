# Angular Route Guards Reference

## Guard Types

| Guard | Purpose | Interface |
|-------|---------|-----------|
| `canActivate` | Protect route | `CanActivate` |
| `canDeactivate` | Prevent leaving | `CanDeactivate` |
| `canMatch` | Prevent loading | `CanMatch` |
| `resolve` | Preload data | `Resolve` |

## Functional Guard (Angular 15+)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login']);
};

// Usage
{ path: 'admin', canActivate: [authGuard] }
```

## Resolve Guard

```typescript
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.params['id']);
};

// Component
this.route.data.subscribe(data => {
  this.user = data['user'];
});
```
