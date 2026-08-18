---
title: "The Basic Relational Mathematics Behind SQL"
description: "A short introduction to relations, Cartesian products, schemas, attributes, and how those mathematical ideas are represented as SQL tables."
publishedAt: 2016-06-18
tags: ["SQL","Mathematics","Self notes","Programming Paradigms"]
draft: false
canonicalUrl: "https://blog.ankuranand.com/2016/06/18/The-Basic-Mathematics-of-SQL/"
originalUrl: "https://blog.ankuranand.com/2016/06/18/The-Basic-Mathematics-of-SQL/"
legacyUrls: ["https://blog.ankuranand.com/2016/06/18/The-Basic-Mathematics-of-SQL/"]
---

## Introduction

Formally, we know a **relation** is a subset of a [Cartesian Products](https://en.wikipedia.org/wiki/Cartesian_product) of sets. i.e $ R \\in ( A X B ) $
For Example.
$$ A = \\{ 1, 3 \\} , B = \\{ 2, 5 \\} $$
Cartesian Product of set A and B will be
$$ P = \\{ (1,2),(3,2),(1,5),(3,5)\\} $$

Out of that there are three pair that observe the $ < $ relationship
$$ R = \\{ (1,2), (1,5), (3,5)\\} $$
Or we can 1 is related to 5 by relation R ($<$)

In real world we name each relation by name which makes sense for others,
and with each relation name we associate its schema - which is a sequence of
attributes(i.e a column in Table)

For Example for above set we have a relation of $ R (A,B) $ which we can write more as
* lessthan(A,B)
In Real world we represent the relation in Table with attributes as column
* Student(Id, FirstN, LastN)

| ID  | FirstN | LastN |
| --- | :----: | ----- |:|
| 101 |   John   |  Deo  |
| 102 |   Jane   |  Deo  |
| 103 |   Jhonny |  Deo  |

Note : Attributes names in relation schema must be different
