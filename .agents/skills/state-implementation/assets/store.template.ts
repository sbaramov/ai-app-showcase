// NgRx Store Template
import { createAction, createReducer, createSelector, createFeatureSelector, on, props } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

// 1. State Interface
export interface {Feature}State extends EntityState<{Entity}> {
  loading: boolean;
  error: string | null;
}

// 2. Entity Adapter
export const adapter: EntityAdapter<{Entity}> = createEntityAdapter<{Entity}>({
  selectId: (entity) => entity.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

// 3. Initial State
export const initialState: {Feature}State = adapter.getInitialState({
  loading: false,
  error: null
});

// 4. Actions
export const load{Feature} = createAction('[{Feature}] Load');
export const load{Feature}Success = createAction('[{Feature}] Load Success', props<{ items: {Entity}[] }>());
export const load{Feature}Failure = createAction('[{Feature}] Load Failure', props<{ error: string }>());

// 5. Reducer
export const {feature}Reducer = createReducer(
  initialState,
  on(load{Feature}, state => ({ ...state, loading: true })),
  on(load{Feature}Success, (state, { items }) => adapter.setAll(items, { ...state, loading: false })),
  on(load{Feature}Failure, (state, { error }) => ({ ...state, error, loading: false }))
);

// 6. Selectors
export const select{Feature}State = createFeatureSelector<{Feature}State>('{feature}');
export const { selectAll, selectIds, selectEntities, selectTotal } = adapter.getSelectors(select{Feature}State);
export const selectLoading = createSelector(select{Feature}State, state => state.loading);
