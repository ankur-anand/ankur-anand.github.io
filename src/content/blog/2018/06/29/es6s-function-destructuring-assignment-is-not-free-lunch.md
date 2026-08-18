---
title: "The Cost of Parameter Destructuring in JavaScript"
description: "Compare ordinary parameters with object destructuring in Node.js through V8 bytecode, heap usage, garbage collection, and microbenchmarks."
publishedAt: 2018-06-29
tags: ["JavaScript"]
draft: false
canonicalUrl: "https://medium.com/@ankur_anand/es6s-function-destructuring-assignment-is-not-free-lunch-19caacc18137"
originalUrl: "https://blog.ankuranand.com/2018/06/29/es6s-function-destructuring-assignment-is-not-free-lunch/"
legacyUrls: ["https://blog.ankuranand.com/2018/06/29/es6s-function-destructuring-assignment-is-not-free-lunch/","https://medium.com/@ankur_anand/es6s-function-destructuring-assignment-is-not-free-lunch-19caacc18137"]
---

I completely agree with the fact that “premature optimization is the root of all evil (or at least most of it) in programming”. But it makes no harm sometimes to know the bits of your code that you write and how it affects the environment for which you are writing your code.

This post is more about learning some of these bits of JavaScript, especially in Node.js environment with v8 core not to favour this micro-optimization because business code is still more concerned about readability and maintainability.

So what exactly we are looking at?. For the legibility of the remaining article, we are comparing the ES6 way of destructing assignment and traditional way of passing parameters inside a function, from a perspective of its impact on performance CPU/Memory.

![ES6’s Function Destructuring vs function parameters Syntax](/images/blog/es6s-function-destructuring-assignment-is-not-free-lunch/image-01-205db752.png)

## Dissecting the performance from the V8 bytecode.

Let’s look at the byte code of _function parameters_ of the below sample code.

```js
function add(number1, number2) {
  return number1 + number2;
}

const result = add(1, 5);
```

ByteCode:

```sh
[generating bytecode for function: add]
Parameter count 3
Frame size 0
   74 E> 0x2a2a0affd2a2 @    0 : 91                StackCheck
   96 S> 0x2a2a0affd2a3 @    1 : 1d 02             Ldar a1
  111 E> 0x2a2a0affd2a5 @    3 : 2b 03 00          Add a0, [0]
  121 S> 0x2a2a0affd2a8 @    6 : 95                Return
Constant pool (size = 0)
Handler Table (size = 16)
```

So in the case of V8 have only 2 core instruction to execute `Ldar a1` and `Add a0,[0]`.

Let’s us rewrite the above `add` function using the _ES6’s Function Destructuring Assignment._

```js
function add({ number1, number2 }) {
  return number1 + number2;
}
const result = add({ number1: 1, number2: 5 });
```

ByteCode:

```text
[generating bytecode for function: add]
Parameter count 2
Frame size 40
   74 E> 0x2c1d63b7d312 @    0 : 91                StackCheck
         0x2c1d63b7d313 @    1 : 1f 02 fb          Mov a0, r0
         0x2c1d63b7d316 @    4 : 1d fb             Ldar r0
         0x2c1d63b7d318 @    6 : 89 06             JumpIfUndefined [6] (0x2c1d63b7d31e @ 12)
         0x2c1d63b7d31a @    8 : 1d fb             Ldar r0
         0x2c1d63b7d31c @   10 : 88 10             JumpIfNotNull [16] (0x2c1d63b7d32c @ 26)
         0x2c1d63b7d31e @   12 : 03 3f             LdaSmi [63]
         0x2c1d63b7d320 @   14 : 1e f8             Star r3
         0x2c1d63b7d322 @   16 : 09 00             LdaConstant [0]
         0x2c1d63b7d324 @   18 : 1e f7             Star r4
         0x2c1d63b7d326 @   20 : 53 e8 00 f8 02    CallRuntime [NewTypeError], r3-r4
   76 E> 0x2c1d63b7d32b @   25 : 93                Throw
   76 S> 0x2c1d63b7d32c @   26 : 20 fb 00 02       LdaNamedProperty r0, [0], [2]
         0x2c1d63b7d330 @   30 : 1e fa             Star r1
   85 S> 0x2c1d63b7d332 @   32 : 20 fb 01 04       LdaNamedProperty r0, [1], [4]
         0x2c1d63b7d336 @   36 : 1e f9             Star r2
   98 S> 0x2c1d63b7d338 @   38 : 1d f9             Ldar r2
  113 E> 0x2c1d63b7d33a @   40 : 2b fa 06          Add r1, [6]
  123 S> 0x2c1d63b7d33d @   43 : 95                Return
Constant pool (size = 2)
Handler Table (size = 16)
```

> In the case of ES6’s Function Destructuring Assignment we can see that the byteCode has increased significantly from 4 to 19 where most of the them are `JumpIfUndefined`, `CallRuntime`, `Throw` instructions.

## Dissecting the performance w.r.t the memory.

Generating too many function call to trace the GC.

_function parameters_

```js
function add(a,b) {
 return a + b
}

for (let i = 0; i < 1e8; i++){
 const d = add(1,2)
}
console.log(%GetHeapUsage())
```

Result of **`— trace-gc`**

`[1841:0x2555580] 82 ms: Scavenge 3.4 (6.3) -> 3.1 (7.3) MB, 1.9 / 0.0 ms allocation failure [1841:0x2555580] 102 ms: Scavenge 3.6 (7.3) -> 3.5 (8.3) MB, 1.9 / 0.0 ms allocation failure **4919768**`

_ES6’s Function Destructuring Assignment._

```js
function add({a,b}) {
 return a + b
}

for (let i = 0; i < 1e8; i++){
 const d = add({a:1,b:2})
}

console.log(%GetHeapUsage())
```

Result of **`— trace-gc`**

`[5054:0x245d570] 60 ms: Scavenge 3.4 (6.3) -> 3.1 (7.3) MB, 1.1 / 0.0 ms allocation failure [5054:0x245d570] 77 ms: Scavenge 3.6 (7.3) -> 3.5 (8.3) MB, 1.3 / 0.0 ms allocation failure [5054:0x245d570] 109 ms: Scavenge 4.8 (8.3) -> 4.6 (11.3) MB, 0.5 / 0.0 ms allocation failure **5762568**`

But does it means in _ES6’s Function Destructuring Assignment_ we have more memory allocation, **NO as here most of the memory difference is due to the object creation overhead in each loop.**

Because if we try to test the _ES6’s Function Destructuring Assignment_ with constant object outside the loop we would’t get much memory difference, from the _function parameters._

```js
const ob = { a: 1, b: 2 };
for (let i = 0; i < 1e8; i++) {
  const d = add(ob);
}
```

GC result when object was created only once.

```text
[6607:0x2f5c570]       43 ms: Scavenge 3.4 (6.3) -> 3.1 (7.3) MB, 0.8 / 0.0 ms  allocation failure
[6607:0x2f5c570]       52 ms: Scavenge 3.6 (7.3) -> 3.5 (8.3) MB, 0.8 / 0.0 ms  allocation failure
**4921672**
```

So we have almost the same memory utilization as the functional parameter case.

> So in the case of _ES6’s Function Destructuring Assignment_ the memory utilization difference is directly dependent upon how we are creating the object.

Also if we see verbose GC detailed information in the case of `const d = add({a:1,b:2})`, we will see that most of these allocation happens in new space region, so the cost of these clean-up is still relatively small (<1 ms), but this may impact the performance of the application (depending upon the application use case) because the Garbage Collector in V8 is **generational, stop-the-world garbage collector.**

```text
[21108:0x3618540] Shrinking page 0x2197c4500000: end 0x2197c4580000 -> 0x2197c454f000
[21108:0x3618540] Shrinking page 0x7900a700000: end 0x7900a780000 -> 0x7900a705000
[21108:0x3618540] Fast promotion mode: false survival rate: 61%
[21108:0x3618540]       32 ms: Scavenge 3.4 (6.3) -> 3.1 (7.3) MB, 0.8 / 0.0 ms  allocation failure
[21108:0x3618540] Memory allocator,   used:   7504 KB, available: 1458864 KB
[21108:0x3618540] New space,          used:    652 KB, available:    354 KB, committed:   2048 KB
[21108:0x3618540] Old space,          used:   1066 KB, available:     46 KB, committed:   1340 KB
[21108:0x3618540] Code space,         used:   1191 KB, available:      0 KB, committed:   2048KB
[21108:0x3618540] Map space,          used:    240 KB, available:      0 KB, committed:    532 KB
[21108:0x3618540] Large object space, used:      0 KB, available: 1458343 KB, committed:      0 KB
[21108:0x3618540] All spaces,         used:   3150 KB, available: 1458744 KB, committed:   5968KB
[21108:0x3618540] External memory reported:      8 KB
[21108:0x3618540] External memory global 0 KB
[21108:0x3618540] Total time spent in GC  : 0.8 ms
[21108:0x3618540] Fast promotion mode: false survival rate: 88%
[21108:0x3618540]       42 ms: Scavenge 3.6 (7.3) -> 3.5 (8.3) MB, 1.3 / 0.0 ms  allocation failure
[21108:0x3618540] Memory allocator,   used:   8528 KB, available: 1457840 KB
[21108:0x3618540] New space,          used:    273 KB, available:    733 KB, committed:   2048 KB
[21108:0x3618540] Old space,          used:   1838 KB, available:    438 KB, committed:   2364 KB
[21108:0x3618540] Code space,         used:   1191 KB, available:      0 KB, committed:   2048KB
[21108:0x3618540] Map space,          used:    261 KB, available:      0 KB, committed:    532 KB
[21108:0x3618540] Large object space, used:      0 KB, available: 1457319 KB, committed:      0 KB
[21108:0x3618540] All spaces,         used:   3565 KB, available: 1458491 KB, committed:   6992KB
[21108:0x3618540] External memory reported:      8 KB
[21108:0x3618540] External memory global 0 KB
[21108:0x3618540] Total time spent in GC  : 2.0 ms
[21108:0x3618540] Fast promotion mode: false survival rate: 38%
[21108:0x3618540]       65 ms: Scavenge 4.8 (8.3) -> 4.6 (11.3) MB, 0.7 / 0.0 ms  allocation failure
[21108:0x3618540] Memory allocator,   used:  11600 KB, available: 1454768 KB
[21108:0x3618540] New space,          used:    549 KB, available:   1464 KB, committed:   4096 KB
[21108:0x3618540] Old space,          used:   2580 KB, available:    736 KB, committed:   3388 KB
[21108:0x3618540] Code space,         used:   1193 KB, available:      0 KB, committed:   2048KB
[21108:0x3618540] Map space,          used:    361 KB, available:      0 KB, committed:    532 KB
[21108:0x3618540] Large object space, used:      0 KB, available: 1454247 KB, committed:      0 KB
[21108:0x3618540] All spaces,         used:   4684 KB, available: 1456448 KB, committed:  10064KB
[21108:0x3618540] External memory reported:      8 KB
[21108:0x3618540] External memory global 0 KB
[21108:0x3618540] Total time spent in GC  : 2.7 ms
```

![Annotated Node.js trace_gc output showing the process, timestamp, garbage collection type, heap sizes, pause time, and reason](/images/blog/es6s-function-destructuring-assignment-is-not-free-lunch/image-02-00e7da61.png)

How to Read — trace_gc flag node.js

> Though we have a **evident Computational penalty of using ES6’s Function Destructuring Assignment,** the memory penalty depends upon the use case.

At first glance, we might be tempted to do premature optimization but for business we should prefer the readability, and also in this case for the code sample above, we have seen the results, still there is a very high probability that final benchmark will differ from project to project in real world because V8 performs lots of optimization with different mechanism eg. [escape analysis](https://v8project.blogspot.com/2017/09/disabling-escape-analysis.html) on destructuring, and we might never have to worry about this in most of the cases.

---
