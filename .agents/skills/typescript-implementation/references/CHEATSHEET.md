# TypeScript Cheatsheet for Angular

## Type Annotations

```typescript
// Primitives
let name: string = "Angular";
let version: number = 18;
let isActive: boolean = true;

// Arrays
let items: string[] = ["a", "b"];
let numbers: Array<number> = [1, 2];

// Objects
interface User {
  id: number;
  name: string;
  email?: string; // Optional
}

// Functions
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Arrow functions
const add = (a: number, b: number): number => a + b;
```

## Utility Types

| Type | Description | Example |
|------|-------------|---------|
| `Partial<T>` | All properties optional | `Partial<User>` |
| `Required<T>` | All properties required | `Required<User>` |
| `Readonly<T>` | All properties readonly | `Readonly<User>` |
| `Pick<T, K>` | Select properties | `Pick<User, 'id' \| 'name'>` |
| `Omit<T, K>` | Exclude properties | `Omit<User, 'email'>` |
| `Record<K, T>` | Object type | `Record<string, User>` |

## Generics

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Generic interface
interface Repository<T> {
  getAll(): T[];
  getById(id: number): T | undefined;
}

// Generic class
class DataStore<T> {
  private items: T[] = [];
  add(item: T): void { this.items.push(item); }
  getAll(): T[] { return this.items; }
}
```

## Type Guards

```typescript
// typeof guard
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value * 2;
}

// instanceof guard
class Dog { bark() {} }
class Cat { meow() {} }

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// Custom type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

## Angular-Specific Types

```typescript
// Component input/output
@Input() data!: User;
@Output() selected = new EventEmitter<User>();

// Observable typing
users$: Observable<User[]>;

// Form typing
form: FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
}>;
```
