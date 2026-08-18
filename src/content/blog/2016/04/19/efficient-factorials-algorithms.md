---
title: "Efficient Factorial Algorithms"
description: "A comparison of recursive, iterative, paired-multiplication, and prime-decomposition approaches to computing large factorials in Python and Java."
publishedAt: 2016-04-19
tags: ["Factorial","Efficiency","Python","Java","Algorithms"]
draft: false
canonicalUrl: "https://blog.ankuranand.com/2016/04/19/EFFICIENT-FACTORIALS-ALGORITHMS/"
originalUrl: "https://blog.ankuranand.com/2016/04/19/EFFICIENT-FACTORIALS-ALGORITHMS/"
legacyUrls: ["https://blog.ankuranand.com/2016/04/19/EFFICIENT-FACTORIALS-ALGORITHMS/"]
---

## Factorial -

In mathematics, the factorial of a non-negative integer n, denoted by n!, is the product of all positive integers
less than or equal to n. For example,

$$ 5! = 5 \ast 4 \ast 3 \ast 2 \ast 1 = 120 $$

### Recursive Approach:

Based on the recurrence relation

$$ n! = \begin{cases}
1 & \text{if n = 0},\\
(n-1)! \ast n & \text{if n > 0}
 \end{cases} $$

``` python
def calculate_factorial_recursive(number):
    '''
    This function takes one agruments and
    returns the factorials of that number
    This is naive recursive approach
    '''
    #base case
    if number == 1 or number == 0:
        return 1
    return number * calculate_factorial_recursive(number - 1)
    ```

The Recursive approach is not the best approach. It will give RuntimeError: maximum recursion depth exceeded.
For large number as python doesn't have optimized [tail recursion](https://en.wikipedia.org/wiki/Tail_call), but it have been written for pedagogical purposes, to illustrate the effect of several fundamental algorithmic optimizations in the n factorial of a very large number.

### First Improvement :
### Successive Multiplicative Approach.
This function uses the approach successive multiplication like
$$ 8! = 8 \ast 7 \ast 6 \ast 5 \ast 4 \ast 3 \ast 2 \ast 1 $$

``` python
def calculate_factorial_multi(number):

    if number == 1 or number == 0:
        return 1

    result = 1 # variable to hold the result

    for x in xrange(1, number + 1, 1):
        result *= x
    return result
    ```
    
The profiled result for this function :
    
``` 
    for n = 1000 -- Total time: 0.001115 s
    for n = 10000 -- Total time: 0.035327 s
    for n = 100000 -- Total time: 3.77454 s.```

Now If we see the result from line_profiler we will see that most %time was spent in multiplication step of the above code i.e result *= x which is almost 98%.

### Second Improvement : 
###  Reduce the number of successive multiplication 
As the multiplication is very costly especially for a large number , we can use the pattern and reduces the number of multiplication by half. Lets group the above 8! example $ 8! = 8 \ast 7 \ast 6 \ast 5 \ast 4 \ast 3 \ast 2 \ast 1  $- together: $ 8! = (8 \ast 1) \ast (7 \ast 2) \ast (6 \ast 3) \ast (5 \ast 4) $ which can be written as $$ 8! = 8 \ast (8 + 6 = 14) \ast (14 + 4 = 18) \ast (18 + 2).$$
so first factor is the number we are taking. second factor is the first factor plus first factor minus two from the factor and then in next we multiply the result with added result. Odd number also follows the same pattern till even just handle the case of one odd.
Code to do the same:
``` python :
 def calculate_factorial_multi_half(number):

        if number == 1 or number == 0:
            return 1

        handle_odd = False
        upto_number = number

        if number & 1 == 1:
            upto_number -= 1
            print upto_number
            handle_odd = True

        next_sum = upto_number
        next_multi = upto_number
        factorial = 1

        while next_sum >= 2:
            factorial *= next_multi
            next_sum -= 2
            next_multi += next_sum

        if handle_odd:
            factorial *= number

        return factorial
        ```
        
The profiled result for this function :

```
For n = 1000 -- Total time: 0.00115 s
for n = 10000 -- Total time: 0.023636 s
for n = 100000 -- Total time: 3.65019 s
```
It is not optimised very much, but are at least not obscenely slow. It's shows some improvement in the mid range but didn't improved much with scaling. In this function too most of the %time is spent on multiplication:
Java Code for the same:
``` java
private static void calculateFactorial(int uptoValue) {
        BigInteger answer=BigInteger.ONE;
        boolean oddUptoValue=((uptoValue&1)==1);
        int tempUptoValue=uptoValue;
        if(oddUptoValue){
            tempUptoValue=uptoValue-1;
            }

        int nextSum = tempUptoValue;
        int nextMulti = tempUptoValue;
        while (nextSum >= 2){
            answer=answer.multiply(BigInteger.valueOf(nextMulti));
            nextSum -= 2;
            nextMulti += nextSum;
        //  long product=(tempUptoValue-i+1L)*i;

        }
        if(oddUptoValue){
            answer=answer.multiply(BigInteger.valueOf(uptoValue));
        }
        System.out.println(answer);
    }
    ```
### Further Improvement : 
### Using [prime decomposition](https://en.wikipedia.org/wiki/Integer_factorization) 
to reduce the total number of multiplication Since there are $$ \frac {number} {\ln number} $$ prime number smaller than number so we can further reduce the total number of multiplication

``` python
def calculate_factorial_prime_decompose(number):

    prime = [True]*(number + 1)
    result = 1
    for i in xrange (2, number+1):
        if prime[i]:
            #update prime table
            j = i+i
            while j <= number:
                prime[j] = False
                j += i
            sum = 0
            t = i
            while t <= number:
                sum += number/t
                t *= i
            result *= i**sum
    return result
    ```
```
The profiled result for this function :
n = 1000 -- Total time = 0.007484 s
n = 10000 -- Total time = 0.061662 s
n = 100000 -- Total time = 2.45769 s

```

You can see the detailed profiled result of all the discussed algorithms prepared here, in case if you want to see.
[Github Link](https://github.com/ankur-anand/Factorial-Algorithm)
