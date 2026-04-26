# Angular Testing Patterns

## Component Test

```typescript
describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
      providers: [{ provide: UserService, useValue: mockUserService }]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display user name', () => {
    component.user = { id: 1, name: 'John' };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('John');
  });
});
```

## Service Test with HTTP

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch users', () => {
    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/users');
    req.flush([{ id: 1 }, { id: 2 }]);
  });
});
```

## Async Testing

```typescript
it('should load data', fakeAsync(() => {
  component.loadData();
  tick(1000); // Simulate async delay
  expect(component.data).toBeDefined();
}));
```
