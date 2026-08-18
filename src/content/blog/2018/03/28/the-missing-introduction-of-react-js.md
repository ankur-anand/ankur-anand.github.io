---
title: "The Missing Introduction to React"
description: "Build the ideas behind React step by step: reusable components, state, setState, declarative rendering, and efficient DOM updates."
publishedAt: 2018-03-28
tags: ["JavaScript","React"]
draft: false
canonicalUrl: "https://medium.com/@ankur_anand/the-missing-introduction-of-react-js-b0d168d0622c"
originalUrl: "https://blog.ankuranand.com/2018/03/28/The-missing-introduction-of-React-js/"
legacyUrls: ["https://blog.ankuranand.com/2018/03/28/The-missing-introduction-of-React-js/","https://medium.com/@ankur_anand/the-missing-introduction-of-react-js-b0d168d0622c"]
---

# Why React?

Recently I’ve started learning `React.js` with my limited knowledge of the front-end, I stumbled upon `React.js` official site, and it presented me like this.

![reactjs-helloworld](/images/blog/the-missing-introduction-of-react-js/reactjs-hello-world.png)

Followed the instruction and I was greeted with `“Hello, World!”`. Awesome isn’t that something we can do directly in HTML ? What react do ?

I asked “Google” and here are few Terminology that were thrown at my face.

> reusable components, stateful components, virtual dom.

Having limited knowledge of the front-end and not used any front-end framework or library before, I completed the official tutorial but all the rich information at the official documentation or any other great article out on Internet was more difficult to understand for me, and there was few questions that i kept asking myself again and again

1. What led to the need for front-end pages to be componentized ?

2. What kind of problems non component front-end code face and how the React.js solves these problems ?

This post is my attempt to present that missing part of React.js with these two question in mind to novice like me in autodidact way.

All of the engineering marvels has came out of need so to understand the use of react.js lets present our-self with an problem.

How would we implement a simple upvote and downvote functionality like below.
![upvote-downvote](/images/blog/the-missing-introduction-of-react-js/upvote-and-downvote.png)

Even with my limited knowledge i can write HTML for this. Check the Result tab.

[Open this interactive example on JSFiddle](https://jsfiddle.net/ankuranand/6qz26n0k/)

How cool, **But how would be go on and use this functionality inside different page ?** Now we have a problem and to solve this we have to copy the whole button structure inside the another page. That what we have been doing traditionally.

# Building Block Components

Can we do a better job than copying the whole structure again and again. **Lets try to rewrite it in a way to make it reusable.** We can write a class that returns a string representation of the HTML structure, and using this class to build button instance and insert them into the DOM.

```js
class UpVoteButton {
  render() {
    return `
  	<button class='upvote-btn'>
    <span class='upvote-text'>Upvote</span>
    <span><i class="fa fa-thumbs-up" aria-hidden="true"></i></span>
    </button>
  `;
  }
}

class DownVoteButton {
  render() {
    return `
 	  <button class="downvote-btn">
      <span class="downvote-text">Downvote</span>
      <span><i class="fa fa-thumbs-down" aria-hidden="true"></i></span>
      </button>
`;
  }
}

// using this class to build the upVote and DownVote button and inserting them
// into the dom
const wrapper = document.querySelector(".wrapper");
const upVoteButton = new UpVoteButton();
wrapper.innerHTML = upVoteButton.render();

const downVoteButton = new DownVoteButton();
wrapper.innerHTML += downVoteButton.render();
```

[Open this interactive example on JSFiddle](https://jsfiddle.net/ankuranand/4xpe8frq/)

But now our event listener to the button are dead, as our class `UpVoteButton` and `DownVoteButton` are simply a string, and we can’t add events to a string. **To add event we need DOM structure.** Lets modify our class to create a DOM structure from string using the **DOM API**.

```js
const createDOMFromSring = domstring => {
  const div = document.createElement("div");
  div.innerHTML = domstring;
  return div;
};

class UpVoteButton {
  render() {
    this.elem = createDOMFromSring(`
  	<button class='upvote-btn'>
    <span class='upvote-text'>Upvote</span>
    <span><i class="fa fa-thumbs-up" aria-hidden="true"></i></span>
    </button>
  `);
    return this.elem;
  }
}

class DownVoteButton {
  render() {
    this.elem = createDOMFromSring(`
    <button class="downvote-btn">
    <span class="downvote-text">Downvote</span>
    <span><i class="fa fa-thumbs-down" aria-hidden="true"></i></span>
    </button>
    `);
    return this.elem;
  }
}

// as render() method now returns an Object of HTMLDivElement
// it cannot be appended like innerHTML, instead use DOM
// API to append it
const wrapper = document.querySelector(".wrapper");
const upVoteButton = new UpVoteButton();
wrapper.appendChild(upVoteButton.render());

const downVoteButton = new DownVoteButton();
wrapper.appendChild(downVoteButton.render());
```

[Open this interactive example on JSFiddle](https://jsfiddle.net/ankuranand/g48qv6q8/)

# The Why Of React State

Now we can add event Listener, to our custom class at the time of instantiation of our classes. But after the instantiation **we have to track if the button has been `upvoted` or `downvoted`, and for that we need state in our class that keeps track of all the state variable that our class instance depends upon**, and a method that can update the state based on the event when the button has been clicked.

> let’s put that state in our constructor to be accessible to all method and a method named `changeUpVotedText` to update the state based on events.

```js
class UpVoteButton {
  constructor() {
    this.state = { isUpVoted: false };
  }

  changeUpVotedText() {
    const upVotedText = this.elem.querySelector(".upvote-text");
    this.state.isUpVoted = !this.state.isUpVoted;
    upVotedText.innerHTML = this.state.isUpVoted ? "Upvote" : "Cancel";
  }

  render() {
    this.elem = createDOMFromSring(`
  	<button class='upvote-btn'>
    <span class='upvote-text'>Upvote</span>
    <span><i class="fa fa-thumbs-up" aria-hidden="true"></i></span>
    </button>
  `);
    this.elem.addEventListener("click", this.changeUpVotedText.bind(this));
    return this.elem;
  }
}
```

[Open this interactive example on JSFiddle](https://jsfiddle.net/ankuranand/Lfe7csp0/)

# The Why of setState Function

If we carefully look at our two method `changeUpVotedText` and `changeDownVotedText` containing the DOM operations. Right now these DOM operations are done on the one state, and with the change of state these methods are directly manipulating the DOM to update new content on the page.

Imagine if our components depends on a lot of state, this manual managing the relationship between data and DOM can lead to poor maintainability and error-prone code. [As The full implications of element.innerHTML=x are enormous. Rough overview:](https://stackoverflow.com/questions/6817093/but-whys-the-browser-dom-still-so-slow-after-10-years-of-effort)

1. parse x as HTML
2. ask browser extensions for permission
3. destroy existing child nodes of element
4. create child nodes
5. recompute styles which are defined in terms of parent-child relationships
6. recompute physical dimensions of page elements
7. notify browser extensions of the change
8. update Javascript variables which are handles to real DOM nodes

So we can imagine why doing this could be a performance disaster if the element we’re updating happens to have a few thousand children. **And also we don’t have any single place that manages the response to change in state and then apply this change back to DOM**.

> If we need another function that also responds to event and manipulate the DOM directly, their is high percentage of chance that we could have a race condition or our DOM becomes out of sync.

Can we do better ? Let’s Think this way

> Once the state is changed, build a new DOM element by calling render method again and Update the Page. This way we don’t have to maintain the relationship manually, and we get a single piece of code in our application, that deals with DOM API based on state.

In our case we name this method `setState` that is **solely responsible for changing the state of the object and re-rendering the DOM element again.**

```js
class UpVoteButton {
  constructor() {
    this.state = { isUpVoted: false };
  }

  // `setState` method is responsible for changing the state of the object
  // and re-rendering the DOM element again
  setState(state) {
    this.state = state;
    this.elem = this.render();
  }
  changeUpVotedText() {
    this.setState({
      isUpVoted: !this.state.isUpVoted
    });
  }

  render() {
    this.elem = createDOMFromSring(`
      <button class='upvote-btn'>
      <span class='upvote-text'>${
        this.state.isUpVoted ? "Cancel" : "UpVote"
      }</span>
      <span><i class="fa fa-thumbs-up" aria-hidden="true"></i></span>
      </button>
    `);
    this.elem.addEventListener("click", this.changeUpVotedText.bind(this));
    return this.elem;
  }
}
```

So `setState` method will be called whenever **user clicks on the button** an `click event` will fire up and that in turn will call `changeUpVotedText` and **it will build a new state objects, through call to the setState method that in turn will build the new DOM Object based on the new State.**

## Now how does one re-insert new DOM ?

Because the new element that we have created(`this.elem`) in the `setState` method is a instance of DOM element, but `setState` doesn’t have any way to communicate with the “Top Level API of DOM” which actually instructs our document (HTML Page) to make the necessary change in place. _We have to somehow communicate from our setState method to DOM API (outside our Component) and tell them to re-insert new DOM, in place of old DOM._

As here we are dealing with the DOM API directly with wrapper object representing the first element in the document that matches the specified set of CSS selectors.

```js
const wrapper = document.querySelector(".wrapper");
const upVoteButton = new UpVoteButton();
wrapper.appendChild(upVoteButton.render());
```

As our wrapper element is handling the DOM API, we can **attach a function to `upVoteButton` instance that is aware of the DOM element** where our new DOM element created in the setState method needs to be updated and calls the respective DOM API. All we have to do is call that function from our setState method.

```js
upVoteButton.onStateChange = (oldElem, newElem) => {
  wrapper.insertBefore(newElem, oldElem);
  wrapper.removeChild(oldElem);
}


setState(state) {
    const oldElem = this.elem;
    this.state = state;
    this.elem = this.render();
    // calling the instance method
    if(this.onStateChange) this.onStateChange(oldElem, this.elem)
  }
```

Our working model.

[Open this interactive example on JSFiddle](https://jsfiddle.net/ankuranand/8tvu5pye/)

It’s seems so clear that our setState right now add and delete DOM elements, causing the browser to do a lot of rearrangement, that seriously affect the performance.

> This is where the React.js uses their strategy called Virtual-DOM.

But setting a method `onStateChange` like this on every instance that we have created is troublesome process. Let’s _write a function called componentMount that will help us to automate this process of ours_.

```js
const componentMount = (component, container) => {
  container.appendChild(component.render());
  component.onStateChange = (oldElem, newElem) => {
    container.insertBefore(newElem, oldElem);
    container.removeChild(oldElem);
  };
};
```

Now all we have to do is pass the created component and container to the DOM.

```js
const wrapper = document.querySelector(".wrapper");
const upVoteButton = new UpVoteButton();
const downVoteButton = new DownVoteButton();
componentMount(upVoteButton, wrapper);
componentMount(downVoteButton, wrapper);
```

# Getting Further

Improving further we can abstract few things into a Component class that our custom component can inherits and make our life simpler.

```js
class Component {
  setState(state) {
    const oldElem = this.elem;
    this.state = state;
    this._renderDOM();
    if (this.onStateChange) this.onStateChange(oldElem, this.elem);
  }

  _renderDOM() {
    this.elem = createDOMFromString(this.render());
    if (this.onClick) {
      this.elem.addEventListener("click", this.onClick.bind(this));
    }
    return this.elem;
  }
}
```

Here we are tracking just `onClick` event-handler, but we get the idea **we can add method for different kind of event handler**.

Let’s refactor our UpVoteButton

```js
class UpVoteButton extends Component {
  constructor() {
    super();
    this.state = { isUpVoted: false };
  }

  onClick() {
    this.setState({
      isUpVoted: !this.state.isUpVoted
    });
  }

  render() {
    return `
      <button class='upvote-btn'>
      <span class='upvote-text'>${
        this.state.isUpVoted ? "Cancel" : "UpVote"
      }</span>
      <span><i class="fa fa-thumbs-up" aria-hidden="true"></i></span>
      </button>
    `;
  }
}
```

What if we want to pass some custom configuration data to our custom class. We can add props as configuration parameter in Component class and subclass so that when extended we get access to props using `this.props`.

```js
const createDOMFromString = domstring => {
  const div = document.createElement("div");
  div.innerHTML = domstring;
  return div;
};

class Component {
  constructor(props) {
    this.props = props;
  }
  setState(state) {
    const oldElem = this.elem;
    this.state = state;
    this._renderDOM();
    if (this.onStateChange) this.onStateChange(oldElem, this.elem);
  }

  _renderDOM() {
    this.elem = createDOMFromString(this.render());
    if (this.onClick) {
      this.elem.addEventListener("click", this.onClick.bind(this));
    }
    return this.elem;
  }
}

class UpVoteButton extends Component {
  constructor(props) {
    super(props);
    this.state = { isUpVoted: false };
  }

  onClick() {
    this.setState({
      isUpVoted: !this.state.isUpVoted
    });
  }

  render() {
    return `
      <button class='upvote-btn' style="background: ${this.props.bgColor}">
      <span class='upvote-text'>${
        this.state.isUpVoted ? "Cancel" : "UpVote"
      }</span>
      <span><i class="fa fa-thumbs-up" aria-hidden="true"></i></span>
      </button>
    `;
  }
}

const componentMount = (component, container) => {
  container.appendChild(component._renderDOM());
  component.onStateChange = (oldElem, newElem) => {
    container.insertBefore(newElem, oldElem);
    container.removeChild(oldElem);
  };
};

const wrapper = document.querySelector(".wrapper");
const upVoteButton = new UpVoteButton({ bgColor: "green" });
componentMount(upVoteButton, wrapper);
```

Our working model.

[Open this interactive example on JSFiddle](https://jsfiddle.net/ankuranand/8Lgqjoru/)

With that we have created our very own component system and learn’t how with Component based system we have solved some of the problem of re-usability in front-end. Every Component has its own DOM structure and its behavior and display style is determined by its own state and props. So when data changes the Component will automatically re-render the new Content.

# Conclusion

Well, with that hopefully you now have an answer to questions and a good overview of what kind of problem React.js component is fundamentally trying to solve, but in an extreme efficient way.

---

Disclaimer: This post is a summary of my knowledge that about React.js behavior that has came through my own learning, and must not be mistaken for “Oh so this is how React.js works under the hood”
There may inevitably be many error, here, and hope that everyone who find the error can help me with it. You can find the entire source code here.

[![ankur-anand/missing-intro-to-react](/images/blog/the-missing-introduction-of-react-js/missing-introduction-to-react.jpeg)](https://github.com/ankur-anand/missing-intro-to-react)

Please Send me Pull request if you feel the source needs to be or can still be improved, both in term of explanation and structure.

Time for me to head over to reactjs.org and learn React again with new enlightenment. 😅

---
