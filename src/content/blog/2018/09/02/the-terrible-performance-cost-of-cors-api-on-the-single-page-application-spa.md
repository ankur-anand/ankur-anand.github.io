---
title: "The Performance Cost of CORS in Single-Page Applications"
description: "How CORS preflight requests add latency to cross-origin APIs, why URL-specific preflight caching may not help, and what SPA designers should consider."
publishedAt: 2018-09-02
tags: ["JavaScript","spa","cors","performance"]
draft: false
canonicalUrl: "https://medium.com/@ankur_anand/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa-6fcf71e50147"
originalUrl: "https://blog.ankuranand.com/2018/09/02/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa/"
legacyUrls: ["https://blog.ankuranand.com/2018/09/02/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa/","https://medium.com/@ankur_anand/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa-6fcf71e50147"]
---

## Introduction

The title may lead you to think that this post is another ranting post about the downside of a “Single Page Application”. It is more about shedding some light on the *performance perspective to keep in mind while designing the SPA. *Especially if* *your* *SPA consumes APIs from different domain services.

If you are designing an SPA which consumes the API from the same domain of the SPA, then great. You should skip this article if your SPA only pulls from the API on the same domain.

## Cost

Most SPAs involve “microservices.” They consume different endpoints of services serving by different domains within the SPA. This adds resilience, fault tolerance, and an improved user experience of our product. Multiple domain requests become inevitable until and unless we strictly adhere to the same domain app **API Gateway — Microservices Pattern** for our SPA.

![SPA + Cors does not always reduce the latency.](/images/blog/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa/image-01-5be9d45f.png)

*SPA + Cors does not always reduce the latency.*

Let’s Imagine we have a `GET API /users/report/:id` served from domain `api.example.com`. Our SPA is served from spa.example.com. **The :id means its a value that can change for every request**.

Can you guess the issue with the above API design with respect to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (Cross-Origin Resource Sharing) and its impact on the performance of our SPA?

Here’s a brief Introduction of CORS from [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS):

![Definition of CORS with an example request from a web application on one domain to an API on another domain](/images/blog/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa/image-02-b885ad41.png)

CORS is all good while it’s a [simple request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests) that doesn’t trigger a [CORS ](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Preflighted_requests)preflight. But most often we make requests that are not a “ [simple request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests).”

This is due to the fact that we need to send a header that is not [CORS-safelisted-request-header](https://fetch.spec.whatwg.org/#cors-safelisted-request-header). An example header is Authorization, x-corelation-id. Frequently our Content-Type header value is application/json. This is not an allowed value for the [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header for [cors-safelisted-request-header](https://fetch.spec.whatwg.org/#cors-safelisted-request-header).

If our api.example.com server accepts content-type of application/json, our SPA domain spa.example.com will first send an HTTP request by the [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) method. It is sent to the resource `/users/report/12345` on the other domain api.example.com. To determine whether the actual request is safe to send, the option is sent preflighted. Cross-site requests are always preflighted like this, since they may have implications for user data.

It’s the job of api.example.com server to let the other domain spa.example.com know it’s safe to send the data. You might have done something similar to this for CORS inside your Application.

![Allowing CORS on Express.js Server](/images/blog/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa/image-03-2b94ed31.png)

*Allowing CORS on Express.js Server*

Once the api.example.com server sends the proper response from “OPTIONS” method to other domain spa.example.com then only the actual data with the request you were trying to make is done.
> *So to access a resource api.example.com/users/report/12345 **two actual requests were performed.***

You might say yes. We can use the [Access-Control-Max-Age header ](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Preflighted_requests#Access-Control-Max-Age)to cache the results of a preflight request. The next time we access the resource api.example.com/users/report/12345 from spa.example.com there is no preflight request.

Yes, that’s true, but then remember the title — The terrible performance cost of **CORS **requests on the single-page application (SPA). This comes from the API that we’re are consuming and the way it’s been designed. In our example, we designed our API `/users/report/:id`, where `:id` means its a value that can change.
> *The way preflight cache works is per URL, not just the origin. This means that any change in the path (which includes query parameters) warrants another preflight request.*

**So in our case, to access resource api.example.com/users/report/12345 and api.example.com/users/report/123987, it will trigger four requests from our SPA in total.**

If you have a slow network, this could be a huge setback. Especially when an OPTIONS request takes 2 seconds to respond, and another 2 for the data.

**Now imagine your SPA application making millions of such requests for different domains. **It will have a terrible impact on your SPA’s performance. You’re doubling the latency of every request.
> *SPAs are great in their own domain. But for consuming different domains they come with their own cost. If the API is poorly designed, the latency issues of your SPA can hurt more than the benefits they provide.*

There is no solution or technology that is wholly good or bad. Knowing its shortcoming and what it takes to make it work are what matters. This is what differentiates your Application from the others.
