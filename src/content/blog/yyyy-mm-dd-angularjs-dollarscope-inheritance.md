---
title: AngularJs $scope inheritance
published: false
tags: angular, scope, inheritance
---

It's 2021, and I still write AngularJs (yes, first version)

- child parent `$scope` inheritance
- `Object.prototype.hasOwnProperty`
- `$scope`
- `$rootScope`

https://github.com/angular/angular.js/wiki/Understanding-Scopes

Example using JavaScript object inheritance.

```typescript
const ParentScope = {
	someField: "parent",
};

const ChildScope = Object.create(ParentScope);

console.log(ChildScope.someField); // parent
console.log(ChildScope.hasOwnProperty("someField")); // false
console.log("someField" in ChildScope); // true

ChildScope.someField = "child override";

console.log(ChildScope.someField); // child override
console.log(ChildScope.hasOwnProperty("someField")); // true
console.log("someField" in ChildScope); // true
```

Using class inheritance does not work, because all fields exists in all inherited child

```typescript
class Parent {
	someField = "parent";
}
class Child extends Parent {}

const child = new Child();

console.log(child.someField); // parent
console.log(child.hasOwnProperty("someField")); // true
console.log("someField" in child); // true

child.someField = "child override";

console.log(child.someField); // child override
console.log(child.hasOwnProperty("someField")); // true
console.log("someField" in child); // true
```
