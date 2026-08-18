---
title: "A Gentle Introduction to JavaScript Prototypes"
description: "How JavaScript's prototype chain works, how constructor prototype properties differ from object [[Prototype]] links, and how inheritance resolves properties."
publishedAt: 2017-12-28
tags: ["JavaScript","Prototype","Self notes","Node.js"]
draft: false
canonicalUrl: "https://blog.ankuranand.com/2017/12/28/Learning-Notes-JavaScript-Prototype/"
originalUrl: "https://blog.ankuranand.com/2017/12/28/Learning-Notes-JavaScript-Prototype/"
legacyUrls: ["https://blog.ankuranand.com/2017/12/28/Learning-Notes-JavaScript-Prototype/"]
---

## Prototype

Prototype is a regular object from which other objects inherit properties. Each Objects contains an internal `prototype` property which points to a prototype object from which it inherits all members.

```js
// A person constructor function
const Person = function() {};

// With a property called name with a default value Ankur
Person.prototype = {name: "Ankur"}

// Two instance of Person
const p1 = new Person();
const p2 = new Person();

// The name property is shared through prototypal inheritance
console.log(p1.name); // Ankur
console.log(p2.name); // Ankur

// Lets change the p1 name
p1.name = "Anand"

console.log(p1.name); // Anand
console.log(p2.name); // Ankur
```

> JavaScript only follows the prototype chain when getting a value not while setting the value. When setting the value if the property doesn't exist on the object itself, it simply creates the property

## Prototype Object

Any Object that is not primitive (eg, number, string, Boolean, null, undefined) can be a `prototype object`.

*p1(instance) -> Person.prototype -> Object.prototype -> undefined*

The Person.prototype object itself is an object and therefore has its own prototype, default object called `Object.prototype` which doesn't have a prototype and is undefined.


```js
const firstObject = {}
console.log(firstObject.prototype) // undefined
```
`firstObject` doesn't have any prototype ?

It has one, the `true prototype reference` which is an internal property called `[[Prototype]]` and is not directly accessible, because there is no properties named `prototype` except in the constructor function.

>constructor property that sits on prototype objects points back to the function that create it

```js
console.log(firstObject.__proto__)
console.log(firstObject.constructor.prototype)
```

>Only function objects have prototype properties, but no other objects

```js
const secondObject = function() {}
console.log(secondObject.prototype); // secondObject {}
```

The `prototype`property of a constructor function is the prototype that will be assigned as a prototype to all the newly created objects. This property is only used to assign a prototype to a newly created object.

>Constructor functions use this prototype property to assign prototypes to newly created object and these prototype object can be customized with properties and  methods

Since constructor function is an object itself, it will have it's own `[[Prototype]]`

```js
console.log(secondObject.__proto__)
```

**object's true property as __proto__ has nothing do with the prototype property of an constructor function**

>`Object.prototype` is a root object of all objects in JavaScript

```js
const firstObject = {}
console.log(firstObject.__proto__)

const secondObject = function() {}
console.log(secondObject.__proto__.__proto__);
```
