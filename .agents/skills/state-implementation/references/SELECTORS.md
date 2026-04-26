# NgRx Selectors Reference

## Selector Creation

```typescript
// Feature selector
export const selectUserState = createFeatureSelector<UserState>('users');

// Basic selector
export const selectAllUsers = createSelector(
  selectUserState,
  state => state.users
);

// Derived selector
export const selectActiveUsers = createSelector(
  selectAllUsers,
  users => users.filter(u => u.active)
);

// Parameterized selector
export const selectUserById = (id: number) => createSelector(
  selectAllUsers,
  users => users.find(u => u.id === id)
);
```

## Entity Adapter Selectors

```typescript
const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors(selectFeatureState);
```

## Usage in Component

```typescript
users$ = this.store.select(selectAllUsers);
loading$ = this.store.select(selectLoading);
user$ = this.store.select(selectUserById(this.userId));
```
