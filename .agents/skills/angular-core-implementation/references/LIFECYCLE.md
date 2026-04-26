# Angular Lifecycle Hooks Quick Reference

## Hook Execution Order

```
1. constructor()
2. ngOnChanges()      ← Input changes
3. ngOnInit()         ← Initialize
4. ngDoCheck()        ← Every CD cycle
5. ngAfterContentInit()
6. ngAfterContentChecked()
7. ngAfterViewInit()
8. ngAfterViewChecked()
9. ngOnDestroy()      ← Cleanup
```

## When to Use Each Hook

| Hook | Use Case |
|------|----------|
| `ngOnInit` | Fetch data, initialize subscriptions |
| `ngOnChanges` | React to input changes |
| `ngAfterViewInit` | DOM manipulation, ViewChild access |
| `ngOnDestroy` | Cleanup subscriptions, remove listeners |

## Best Practices

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.data = data);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```
