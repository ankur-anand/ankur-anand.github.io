---
title: "A Closer Look at Go's Type System"
description: "A practical guide to Go's named, unnamed, and underlying types, with examples of assignability, conversion, type identity, and compatibility."
publishedAt: 2018-11-29
tags: ["Go","Type system"]
draft: false
canonicalUrl: "https://medium.com/@ankur_anand/a-closer-look-at-go-golang-type-system-3058a51d1615"
originalUrl: "https://blog.ankuranand.com/2018/11/29/a-closer-look-at-go-golang-type-system/"
legacyUrls: ["https://blog.ankuranand.com/2018/11/29/a-closer-look-at-go-golang-type-system/","https://medium.com/@ankur_anand/a-closer-look-at-go-golang-type-system-3058a51d1615"]
---

A detailed look of the Go type system, with examples

Let’s begin by asking a fundamental question.

## Why we need a type?

Before answering that, we need to look at some of the primitive abstracted layers of programming languages that we don’t usually deal with.

**How close can we get to a machine representation of data?**

![Binary 0s and 1s](/images/blog/a-closer-look-at-go-golang-type-system/image-01-f91ccdb3.jpg)

**Binary zeroes and 1’s.** That’s what a machine understands.

But does it make sense to us? It doesn’t to me until I’m someone who can see something like this. Matrix fanboy, anyone?

*What happens when you attain nirvana in computer science. (image source Martix movie)*
![What happens when you attain nirvana in computer science. (image source Martix movie)](/images/blog/a-closer-look-at-go-golang-type-system/image-02-7c7f8698.gif)

So we can abstract these binary 0's and 1's and move one step up in the ladder.

Consider this assembly fragment:

![Assembly add instruction that stores the sum of registers R2 and R3 in R1 without carrying type information](/images/blog/a-closer-look-at-go-golang-type-system/image-03-0761330f.png)

Can you tell the types of data in registers R1, R2, and R3?

You **might hope** that they’re integers because at the assembly language level it cannot be determined. There’s nothing that prevents R1, R2, and R3 from having arbitrary types. They’re just a bunch of registers with 0's and 1's in them. The add operation will be happy to take them and add them up even if it doesn’t make sense and produce a bit pattern that is then stored.

So this notion of **type **starts at an, even more, higher abstraction, in a higher level language like C, Go, Java, Python, andJavaScript , and is the feature of language itself.

Some languages perform this type checking at the runtime, while some perform it at the compile time.

## So what is a type?

The notion of type does vary from programming language to programming language. It can be expressed in a number of different ways, but roughly they all have some sort of consensus.

**1.** A type is a set of values.

**2.** A set of operations on those values. For example, with a type of integer we can add ( + ) and subtract ( — ). On the type of string we can concatenate, perform empty checks, and so forth.

**3.** Typing is checked by the compiler and/or runtime to ensure the integrity of the data and interpret the data as meant by the developer.

**So a language type system specifies which operations are valid for which types.**

The goal of type checking is to ensure that operations are used only with the correct types and the rules of the type system are respected by the program. This is done either by the compiler when converting the code, or by the runtime while executing the code. By doing this, type checking enforces the intended interpretation of values. Nothing else is going to check — once we get to machine level code, it’s just a lot of 0’s and 1’s. The machine will be happy to do whatever operations we tell it on those 0’s and 1’s.

A type system is there to enforce that the intended interpretations of those bit patterns. For example, it makes sure that a bit pattern for integers doesn’t have any non-integer operation performed on that — this would get something that is meaningless.

A type system consists of :

**1.** **Basic types — **Included in the programming language and available to any program written in that language. Go has various basic types(int8 , uint8 ( byte ), int16 , uint16 , int32 ( rune ), uint32) etc.

**2.** **Type constructors — **Way for a programmer to define new types.
Eg. Pointer to T, where T is a Type or Struct {a: T}

**3.** **Type Inference — **The compiler can infer the type of a variable or a function without us having to explicitly specify it. *Go has Uni-directional type inference.*

**4.** **Type Compatibility — **Which assignments are allowed by the type system? a int; b int8; a = b; ?
How to determine if two types are equal? In Go [assignability](https://golang.org/ref/spec#Assignability) is what mostly determines whether types can be used interchangeably. We will look at this later in details.

## The type system in Go

There are some fundamental specs that govern the type system In Go. We will be looking at some of the important ones.

But, instead of just putting down all of the concepts at once, here I will have different examples covering some fundamental concepts of the Go type system. I will walk you through these examples while explaining some of the essential concepts.

Have a moment and look at these code snippets. Which one of these will compile, and why or why not?

![type system in go](/images/blog/a-closer-look-at-go-golang-type-system/image-04-53339767.png)
![Type system in Go.](/images/blog/a-closer-look-at-go-golang-type-system/image-05-b38dc773.png)

I would like you to note down your answer and reasons, so in the end, we can reason about this together.

### Named types

Types with names such as int, int64, float32, string, and boolare predeclared. **All of the predeclared boolean, numeric and string types are named types.**

Also, any type that we create using the type declaration is a named type.
```go
var i int // named type
type myInt int // named type
var b bool // named type
```

**A named, defined types are always different from any other type.**

### Unnamed types

**Composite types** — array, struct, pointer, function, interface, slice, map, and channel types — are all unnamed types.

```go
[]string // unnamed type
map[string]string // unnamed type
[10]int // unnamed type
```

The type literal above (a **literal** is a notation for representing a fixed value) describe how composite types are to be structured, it’s says nothing about its name.

### Underlying types

Each type, T , has an underlying type.

If T is one of the predeclared boolean, numeric, or string types, or a type literal, the corresponding underlying type is T itself. Otherwise, T's underlying type is the one which T refers to in its [type declaration](https://golang.org/ref/spec#Type_declarations).

![Go declarations illustrating named string, map, pointer, and composite types and their underlying types](/images/blog/a-closer-look-at-go-golang-type-system/image-06-4f2e5dbe.png)

So type by line number:

* **3 and 8:** We have a predeclared type of string , so the underlying type will be T itself — string

* **5 and 7:** We have a type literal, so the underlying type will be T itself — map[string]int and *N pointer. **Note** these type literals are also unnamed type

* **4, 6, and 10:** T's underlying type is the underlying type which T refers to in its [type declaration](https://golang.org/ref/spec#Type_declarations). For example,B refers to A, hence B is a string.

The case that needs to be looked again is on line number** 9, **type T map[S]int.

S has an underlying type of string. Shouldn’t the underlying type of type `T map[S]int` be map[string]int instead of map[S]int? Here we are talking about the **underlying unnamed type map[S]int **and underlying type stop at first unnamed type ( or as the specs say “*If T is a type literal, the corresponding underlying type is T itself*” ).

You might be wondering why I’m putting so much stress on these specs of unnamed type, named (defined) type and underlying type. The reason is that these play an important role in the specs that we are going to discuss further. These help us understand why the code snippets posted above will compile, or will not even when the intents are mostly same.

### Assignability

This occurs when a variable v can be assigned to a variable to type T.

![Assignability specs Golang.](/images/blog/a-closer-look-at-go-golang-type-system/image-07-77c3c725.png)

*Assignability specs Golang.*

While the conditions are self-explanatory, let’s look at one of the rules.

**Rule:** When assigning, both should have the same underlying type, and at least one of then is not a named type.

Let's look at the snippet problem of Figures 4 and 5 again.

```go
package main

type aInt int

func main() {
	var i int = 10
	var ai aInt = 100
	i = ai
	printAiType(i)
}

func printAiType(ai aInt) {
	print(ai)
}
```

So the above code will not compile and will give us a compile-time error.
```text
8:4: cannot use ai (type aInt) as type int in assignment
9:13: cannot use i (type int) as type aInt in argument to printAiType
```

**Reason:** the i is of a named type int and ai is of a named type aInt , even though their underlying type is the same.

```go
package main

type MyMap map[int]int

func main() {
	m := make(map[int]int)
	var mMap MyMap
	mMap = m
	printMyMapType(mMap)
	print(m)
}

func printMyMapType(mMap MyMap) {
	print(mMap)
}
```

snippet4 above **will** compile, **because** m is of unnamed type and the underlying type of both m and mMap is the same.

### Type Conversion

![Type conversion specs.](/images/blog/a-closer-look-at-go-golang-type-system/image-08-30ae6a1b.png)

*Type conversion specs.*

Look at the code from Figure 3.

```go
package main

type Meter int64

type Centimeter int32

func main() {
	var cm Centimeter = 1000
	var m Meter
	m = Meter(cm)
	print(m)
	cm = Centimeter(m)
	print(cm)
}
```

The above code **will** compile as **both** Meter and Centimeter are of integers type** **and their underlying type value are convertable between each other.

Before we look into the code from Figures 1 and 2, let’s take a look at one more fundamental spec governing the type system in Go.

### Type identity

**Two types are either identical or different.**

In general type system, there are two standard ways to determine whether two types are considered the same: **name equivalence** and **structural equivalence**.

**Name equivalence** is the most straightforward: *two types are equal if, and only if, they have the same name.*

In Go**, A defined type is always different from any other type (named equivalence)**.

**Structural equivalence:** *two types are equal if, and only if, they have the same “structure”*, which can be interpreted in different ways.

In Go, two types are identical if their underlying type literals are **structurally equivalent and are not of named types**.

So even predeclared named/defined types such as int and int64 are not identical. Also, the assignability of interfaces types in Go is determined by the [Structural Type System](https://en.wikipedia.org/wiki/Structural_type_system). **There is No Duck Typing in Go**.

[View the referenced post on X](https://x.com/in_aanand/status/1072476894308773888)

So, looking at the rule for conversion for struct:

**Rule:** ignoring struct tags, x's type and T have identical underlying types.

```go
package main

type Meter struct {
	value int64
}

type Centimeter struct {
	value int32
}

func main() {
	cm := Centimeter{
		value: 1000,
	}

	var m Meter
	m = Meter(cm)
	print(m.value)
	cm = Centimeter(m)
	print(cm.value)
}
```

Notice the term **identical underlying types**. Since the underlying type of field Meter.value is of int64 and field Centimeter.value is of int32 they are **not identical** as **a** **defined type is always different from any other type**.

So we will get the compilation error for the snippet code from Figure 2.

The snippet code of Figure 1:

```go
package main

type Meter struct {
	value int64
}

type Centimeter struct {
	value int64
}

func main() {
	cm := Centimeter{
		value: 1000,
	}

	var m Meter
	m = Meter(cm)
	print(m.value)
	cm = Centimeter(m)
	print(cm.value)
}
```

has the underlying type of field Meter.value to be int64 and the field Centimeter.value isint64. So they are **identical**. Hence there is conversion without any compilation error.

I hope this article proves helpful to you at providing some insights into the Go type system, as it’s has been for me while writing.
