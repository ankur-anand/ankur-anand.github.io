---
title: "Communicating Sequential Processes in Go"
description: "A concise introduction to CSP through processes, synchronous input and output, guarded commands, and the ideas that shaped Go channels."
publishedAt: 2019-03-14
tags: ["Go","csp","paper"]
draft: false
canonicalUrl: "https://medium.com/@ankur_anand/communicating-sequential-processes-csp-for-go-developer-in-a-nutshell-866795eb879d"
originalUrl: "https://blog.ankuranand.com/2019/03/14/communicating-sequential-processes-csp-for-go-developer-in-a-nutshell/"
legacyUrls: ["https://blog.ankuranand.com/2019/03/14/communicating-sequential-processes-csp-for-go-developer-in-a-nutshell/","https://medium.com/@ankur_anand/communicating-sequential-processes-csp-for-go-developer-in-a-nutshell-866795eb879d"]
---

A simple and brief introduction to CSP, it’s terminology, and it’s similarities to Go.

**Communicating Sequential Processes (CSP)** for short, is what we hear whenever a Go concurrency is discussed and how it’s an elixir for concurrent programming. When I heard this term for the first time, I started to think that,
> Is CSP some sort of new technique or an algorithm that makes writing concurrent code so simple?

What turned out after reading the CSP original [paper](https://dl.acm.org/citation.cfm?doid=359576.359585) was nothing fancy — a simple concept (which was later formulated into the [Process calculus](https://en.wikipedia.org/wiki/Process_calculus) to reason about the program correctness) solving concurrency through two primitives of programming.

**1.** Input.

**2.** Output.

The paper abbreviates the term *processes* to any individual logic that needs input to run and produce output. (You can visualize this asGoroutine)

*process in CSP*
![process in CSP](/images/blog/communicating-sequential-processes-csp-for-go-developer-in-a-nutshell/image-01-123c734e.png)

**Multiple concurrent processes are allowed to synchronize(*communicate via named sources and destinations*) with each other by synchronizing their I/O. The paper describes this with commands.**

> ! for sending input into a process
> lineprinter!lineimage
> To lineprinter, send the value of lineimage for printing.

> ? for reading the output from a process
> cardreader?cardimage
> From cardreader, read a card and assign its value (an array of characters) to the variable cardimage.

The main Concept CSP describe is Synchronization and [Guarded command](https://en.wikipedia.org/wiki/Guarded_Command_Language).

### **Synchronization**

*Two Processes Communicating Under CSP (Example of Synchronization).*
![Two Processes Communicating Under CSP (Example of Synchronization).](/images/blog/communicating-sequential-processes-csp-for-go-developer-in-a-nutshell/image-02-2cc100b3.png)

In the above example of Synchronization,

**1.** Process **P1 **output value of “a” via output command (!) to Process **P2**.
**2.** Process **P2 **input value from Process **P2 **via input command (?) and assign it to “x”.

### Guarded Command →

Let's look at the definition of it on Wikipedia.

A guarded command is a [statement](https://en.wikipedia.org/wiki/Statement_(programming)) of the form G → S, where

* G is a [proposition](https://en.wikipedia.org/wiki/Proposition), called the guard

* S is a statement

So simply put the lefthand (G) side served as a conditional, or *guard* for the righthand (S) side.

Combining Guarded Command with I/O commands, CSP paper put an example as below.
> *[c:character; west?c → east!c]
> Read all the characters output by west, and output them one by one to east. The repetition terminates when the process west terminates.

Do you find some similarity with Go’s channels? Apparently, it’s is. Though solutions in Go are a bit longer, **Hoare’s I/O commands** with **Dijkstra Guarded Command **forms the foundation stone of Go’s channels.

```go
ch <- v    // Send v to channel ch.
v := <-ch  // Receive from ch, and
            // assign value to v.
```

Ever Read the below quote ([Share Memory By Communicating](https://blog.golang.org/share-memory-by-communicating))

> *Do not communicate by sharing memory; instead, share memory by communicating.*

and wondered why?

Look around CSP again and tell me what do you see. A Complex world interacting with independently behaving pieces through communication.
