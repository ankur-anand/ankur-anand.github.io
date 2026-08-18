---
title: "Understanding Python's Object Model, Part 1"
description: "An introduction to CPython's object representation through PyObject, PyVarObject, reference counting, type pointers, and variable-sized objects."
publishedAt: 2016-04-23
tags: ["Python","Object"]
draft: false
canonicalUrl: "https://blog.ankuranand.com/2016/04/23/Object-Mechanism-in-Python-part1/"
originalUrl: "https://blog.ankuranand.com/2016/04/23/Object-Mechanism-in-Python-part1/"
legacyUrls: ["https://blog.ankuranand.com/2016/04/23/Object-Mechanism-in-Python-part1/"]
---

## Introduction

>This is first part in the series of [object mechanism in python](/categories/Python-Object-Mechanism/) and assumes that people reading this are familiar with the basic python and is comfortable in reading some C code

When we say object the human mind , makes an image of this in a comparative concept but for computer, the object is actually an abstract concept. It doesn't understand anything apart from bytes. So on computer the object is just an allocated space which may be continuous or may be discrete, and this whole region of memory is what we consider and object.


In **Python everything is an object**, and since the python has been implemented in the ANSI C, Which is not an object- oriented language, so how the object mechanism has been achieved in python is really amazing.

## PyObject

Cometh the hour Cometh the `PyObject` the core of the python object mechanism. In Python, 
>The structure of the object is on heap, **exception being the `type object`,** which is statically initialized

objects do not float around in memory; once created and allocated the size and address of the object doesn't change, so object that need to accommodate variable length data can only maintain a pointer to a variable-size memory region within the object as it makes the object maintenance work very simple

## Understanding PyObject

Here the structure of the `PyObject` that forms the core foundation of Python Object Mechanism. It's defined in the `object.h` file of Python Core Library

**For objects that does not contain variable length data**
```c
typedef struct _object {
    PyObject_HEAD
} PyObject;
```

**For objects that contain variable length data**
```c
typedef struct {
    PyObject_VAR_HEAD
} PyVarObject;
```
And the macros definition of `PyObject_HEAD` and `PyObject_VAR_HEAD`
``` c
/* PyObject_HEAD defines the initial segment of every PyObject. */
#define PyObject_HEAD           /
  _PyObject_HEAD_EXTRA        /
  int ob_refcnt;          /
  struct _typeobject *ob_type;
 ```
 ``` c
#define PyObject_VAR_HEAD       /
  PyObject_HEAD           /
  int ob_size; /* Number of items in variable part */
```
As it can be seen, whether it's a variable size Python Object (`PyVarObject`) or or fixed size Python Object (`PyObject`), the `PyObject_HEAD` remains the same, and this makes the reference to objects very unified, We only need a `PyObject*` and we can reference any object.

## Reference Counting Mechanism

The Integer variable `int ob_refcnt` implements the reference counting mechanism. For an object A, Whenever there is new `PyObject*` reference the reference count of A is increased, and whenever it's is reduced the reference count should be decreased. If count reaches 0, A can be removed from the heap.

For Example when we write `a = b = c = []` we create one list and give it three different names. I.e we have bounded the newly instantiated list object to three different identifiers and binding is one of the way to increase the referent's reference count.

Let's us demonstrate this.
``` python
>>> import ctypes
>>> def get_reference_count(obj):
...   """ Function takes the object as input and returns the 
...   total number of reference count to it """
...   return ctypes.c_size_t.from_address(id(obj))
...
>>> l = [234,567,99999]
>>> l_ref_count= get_ref(l)
>>> l_ref_count
c_ulong(1)
>>> l1 = l
>>> l_ref_count
c_ulong(2)
>>> del l
>>> l_ref_count
c_ulong(1)

```

## PYObject_VAR_HEAD

For the variable length Object, the PyObject are usually container which holds the total number of elements that the container is going to contain in the `ob_size` variable

## Going Further

In Part 2
The Type of Object Mechanism of the PyObject_HEAD
``` c
struct _typeobject *ob_type 
```
