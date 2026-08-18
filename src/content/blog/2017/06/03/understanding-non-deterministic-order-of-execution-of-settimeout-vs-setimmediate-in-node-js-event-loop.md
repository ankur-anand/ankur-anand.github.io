---
title: "setTimeout vs setImmediate in Node.js"
description: "Why setTimeout(0) and setImmediate() can run in either order, explained through Node.js event-loop phases, libuv, clock updates, and process timing."
publishedAt: 2017-06-03
tags: ["JavaScript","event-loop","Node.js","libuv","setImmediate","setTimeout"]
draft: false
canonicalUrl: "https://medium.com/@ankur_anand/understanding-non-deterministic-order-of-execution-of-settimeout-vs-setimmediate-in-node-js-49e8d5956cab"
originalUrl: "https://blog.ankuranand.com/2017/06/03/Understanding-Non-deterministic-order-of-execution-of-setTimeout-vs-setImmediate-in-node-js-event-loop/"
legacyUrls: ["https://blog.ankuranand.com/2017/06/03/Understanding-Non-deterministic-order-of-execution-of-setTimeout-vs-setImmediate-in-node-js-event-loop/","https://medium.com/@ankur_anand/understanding-non-deterministic-order-of-execution-of-settimeout-vs-setimmediate-in-node-js-49e8d5956cab"]
---

## Introduction

The Nodejs docs on [The Node.js Event Loop, Timers, and process.nextTick](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick) explains the concept well on the
event loop.

But at the end of the doc while explaning  [setImmediate() vs setTimeout()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#setimmediate-vs-settimeout) it gave an example code, 

```js
// timeout_vs_immediate.js
setTimeout(function timeout () {
  console.log('timeout');
},0);

setImmediate(function immediate () {
  console.log('immediate');
});
```
```bash
$ node timeout_vs_immediate.js
timeout
immediate

$ node timeout_vs_immediate.js
immediate
timeout
```
and left with this line 
>"the order in which the two timers are executed is non-deterministic, as it is bound by the performance of the process:".

This post is an attempt to trying to figure out what it is meant by "bound by the performance of the process."

### Event-loop and phases once again

Oh no Again? Bear with me i'm not repating things that has already been covered in much more details on many post. 

Every event in node.js is driven by `uv_run()` function of libuv. Partial Code

```c
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
  int timeout;
  int r;
  int ran_pending;

  r = uv__loop_alive(loop);
  if (!r)
    uv__update_time(loop);

  while (r != 0 && loop->stop_flag == 0) {
    uv__update_time(loop);
    uv__run_timers(loop);
    ran_pending = uv__run_pending(loop);
    uv__run_idle(loop);
    uv__run_prepare(loop);

    ......

    uv__io_poll(loop, timeout);
    uv__run_check(loop);
    uv__run_closing_handles(loop);
    ............
```

So As explained by the node.js Doc, we can match each Phase of the event loop in the code.

**Timer Phase** `uv__run_timers(loop);`

**I/O Callback** `ran_pending = uv__run_pending(loop);`

**idle/ prepare** `uv__run_idle(loop); uv__run_prepare(loop);`

**poll**  `uv__io_poll(loop, timeout);`

**check** `uv__run_check(loop);`

**close callbacks**  `uv__run_closing_handles(loop);`

### More than phase

But if we see the code closely before the loop goes to timer phase, it calls 
`uv__update_time(loop);`  to initialize the loop time.

```c
void uv_update_time(uv_loop_t* loop) {
   uv__update_time(loop);
}
```

What happens is `uv__update_time(loop)` calls an function `uv__hrtime`

```c
UV_UNUSED(static void uv__update_time(uv_loop_t* loop)) {
  /* Use a fast time source if available.  We only need millisecond precision.
   */
  loop->time = uv__hrtime(UV_CLOCK_FAST) / 1000000;
}
```

This call to `uv__hrtime` is platform dependent and is cpu-time-consuming work as it makes system
call to [clock_gettime](https://linux.die.net/man/3/clock_gettime). It's is impacted by other application running on the machine.

```c
#define NANOSEC ((uint64_t) 1e9)
uint64_t uv__hrtime(uv_clocktype_t type) {
  struct timespec ts;
  clock_gettime(CLOCK_MONOTONIC, &ts);
  return (((uint64_t) ts.tv_sec) * NANOSEC + ts.tv_nsec);
}
```

Once this is returned Timer phase is called in the event loop.

```c
void uv__run_timers(uv_loop_t* loop) {
  ...
  for (;;) {
    ....
    handle = container_of(heap_node, uv_timer_t, heap_node);
    if (handle->timeout > loop->time)
      break;
      ....
    uv_timer_again(handle);
    handle->timer_cb(handle);
  }
}

```

The callback in the Timer phase is run if the current time of loop is greater than the timeout. 
One more important things to note is `setTimeout` when set to `0` is internally converted to `1`.
Also as the `hr_time` return time in Nanoseconds, this behaviour as shown by the `timeout_vs_immediate.js` becomes more explanatory now.



If the preparation before the first loop took more than `1ms` then the `Timer` Phase calls the callback associated with it. If it's is less than `1ms` Event-loop continues to next phase and runs the `setImmediate` callback in check phase of the loop and `setTimeout` in the
next tick of the loop.

Hopefully this clarifies the way around the non-deterministic behaviour of `setTimeout` and `setImmediate` when both are called from within the main module.
