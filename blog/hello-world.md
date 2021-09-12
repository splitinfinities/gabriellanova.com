---
title: This is my first post!
name: Split Infinities
description: Well hello there
image: /assets/img/midwest/full.jpg
date: 2021-09-11
tags:
  - engineering
  - design
layout: layouts/post.njk
---
I finally decided to make a blog, which... might be good? I haven't blogged since Xanga was a thing. 

A lot has changed in my life this year. I'm engaged to the love of my life (❤️ u Gab!), I moved to Austin, I met my father for the first time, I switched back to Engineering from Product Design, then within a month switched to Product Management (I'm the Product Manager for Ionic's Stencil!) So, suffice it to say, I have plenty to blab about here. 

## Built with Eleventy + Stencil

BTW, this site is built with Eleventy and some Stencil built web components. For all this, I'm going to keep updating the features of this little site, especially as new things come out of the Stencil team's super hard work. I also want to try out Eleventy's SSR and prerendering features. I'm not quite launching with that, but I'll be trying to figure it out. 

The [404 page](/404.html) is from an unused concept while I was doing freelance... Initially this little amorphous person was going to be falling into the screen while things passed you by. Since it got nixed, I decided to keep the behavior. I don't know where the best place to use it is, so I decided to put it on the 404. It's a pretty neat couple of little web components that modify transforms based on scroll position. 

## Code Samples too!

Since I'll also be talking about engineering, I added some code samples to the site that I spent a little too long on, frankly. And the tabbing still doesn't keep how I want it to lol. 

<midwest-grid>

::: code (typescript) Stencil Component Definition
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-first-component',
})
export class MyComponent {

  // Indicate that name should be a public property on the component
  @Prop() name: string;

  render() {
    return (
      <p>
        My name is {this.name}
      </p>
    );
  }
}
:::


::: code (html) Live rendering too!
<midwest-grid>
  <midwest-button color="blue" block>Incorrect</midwest-button> <!-- incorrect -->
  <midwest-button class="theme-blue" block>Correct!</midwest-button> <!-- correct! -->
</midwest-grid>
:::

</midwest-grid>

## Credits

This site was built based on [this eleventy template](https://github.com/11ty/eleventy-base-blog). It's not bad! It's been a bit since I've worked with eleventy, but I love it!
