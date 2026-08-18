---
title: "Private Fields Are Class-Private in Java"
description: "Why code inside a Java class can access private fields on another instance of the same class, with examples using mutation and equals()."
publishedAt: 2016-04-23
tags: ["Java","OOP","Encapsulation"]
draft: false
canonicalUrl: "https://blog.ankuranand.com/2016/04/23/private-access-in-java/"
originalUrl: "https://blog.ankuranand.com/2016/04/23/private-access-in-java/"
legacyUrls: ["https://blog.ankuranand.com/2016/04/23/private-access-in-java/"]
---

### Introduction

We all know to access the private member variable of a class we need an public helper function in Java.

### The Unforeseen

But seems One Object can access a private variable of another object of the same class.
>Private means "private to the class", NOT "private to the object. 
So two Object of the same class could access each other's private member variable directly

### Code 
```java
 public class FirstClass {
  
  private int privateNum;
  
  public FirstClass(int privateNum) {
    this.privateNum = privateNum;
  }

  // a method that will change the private variable
  // of the object that is passed as parameter
  public void changeNum(FirstClass Obj){
    
    Obj.privateNum = 100;
  }
  
  // A working Example
  
  public static void main(String...strings){
    // Creating a first class object
    FirstClass fc1 = new FirstClass(1);
    
    // as we are inside the same class we can
    // access the private variable
    System.out.println(fc1.privateNum);
    
    // lets create a new Obect of the First class
    FirstClass fc2 = new FirstClass(2);
    
    // changing the value of the privateNum in the fc1 instance
    // from the fc2 instance
    
    fc2.changeNum(fc1);
    System.out.println(fc1.privateNum);
    // Hola the output is 100
    
    }

}
```
### Why we should know this

So Java private access modifier means only private for a class. The instance of this class can access the private members of another instance of that class without any helper method and this features allow us to write methods that accept an instance of the class as an arguments for `equals(Object other)`, `compareTo(Object other)` without relying on the class having non private getters for all the  private properties that need to be accessed.

### Example code for equals

We often write code like this while overriding the `equals` methods in Java Class

```java
// Overriding equals() to compare two FirstClass object based on the value of 
// privateNum
    @Override
    public boolean equals(Object o) {
 
        // If the object is compared with itself then return true  
        if (o == this) {
            return true;
        }
 
        /* Check if o is an instance of FirstClass or not
          "null instanceof [type]" also returns false */
        if (!(o instanceof FirstClass)) {
            return false;
        }
         
        // typecast o to FirstClass so that we can compare data members 
        FirstClass c = (FirstClass) o;
         
        // Compare the data members and return accordingly 
        return this.privateNum == c.privateNum;
    }
}
```

So remember **private means private to class not to instance of that class**
