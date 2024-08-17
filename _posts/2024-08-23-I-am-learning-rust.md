---
layout: post
title: "I love learning and I am learning Rust"
category: "learnings"
---

Rust is not used much in the scientific computing field. I had never programmed in Rust but had watched a bunch of videos of people talking about how cool yet challenging it is, and I always wanted to give it a try. The best way to learn a new language, especially when you have a decent experience with programming is to skim through basic language syntax and features, jump into a project, and learn on the go. But you can't understand both the project and the language simultaneously. You either pick a project you already know and write it in the new language, or pick a language you know and work on a new project.

## My plan

Sometime back, I came across this [GitHub page](https://github.com/codecrafters-io/build-your-own-x) which seemed like a cool collection of resources to learn technologies by building them from scratch. I quickly explored the 3D renderer project link which led to me to this amazing book available for free online - [*Physically based rendering: From theory to Implementation*](https://pbr-book.org/4ed/contents). The book is also written with academic rigor and the implementation is in C++ which I like. I thought: I knew the theory behind the geometry module of the 3D renderer: vectors, matrices, transformations, etc. So I could start by implementing them in Rust and learn Rust while doing so. By the time I finish this, I will know enough Rust to smoothly transition into a period of learning both the language and theory of any project simultaneously. In the end, I will hopefully become fluent enough in Rust to implement the advanced things needed for any project I wish to work on. I will also expand my C++ knowledge by looking at the implementations in the book and trying to replicate the functionality myself in a completely different language as it would force me to understand exactly what is being done and how. I am excited to document my progress and learnings here. It would be cool to look back at this and see how my learning accumulates.


## Learnings so far...

I mostly program in C++ and Python for my work. When I started learning Rust, my wife asked how they differ. I said something like:

*Python* is like a millennial parent practicing gentle parenting - "*Oh my sweet baby. Did my munchkin do a boo-boo?? Don't worry love! I am gonna clean it up for you. I love you!!*"

*C++* be like - "*I don't care. You know what? You have not been careful, so take this gun and shoot yourself in the foot*"

*Rust* is like my parents - "*Well. Do you think you are correct? Think again. See, here is the problem. Go fix it. Fixed it? Good job!*"

I will end this post by summarizing the most important things I learned about Rust and programming in general while coding in Rust. I might be wrong in my understanding and conclusions. I will revisit these as I learn more. I am not giving detailed explanations as each point here would require a whole post. I am sure most of them will be a recurring topic in my future posts as I discuss my progress. I intend to continue sharing my learnings here and see you next time!

### What I (kinda) understood about Rust in the first few days

- Unless borrowed, the ownership of data transfers to the function you pass the data to. Once the function executes, its scope ends, and the data *dies along with it. You can't use that data after the function call.
- You can borrow the data instead of taking ownership. You also have to be explicit about your intentions i.e. does the function have side effects and change this data? if so borrow mutable references. If not, borrow an immutable reference.
- Because we care about who is manipulating data, we can only have either several immutable references to a given data OR a single mutable reference to that data. Else, the data might be changed by some while others don't expect it to change. So Rust doesn't allow that scenario.
- This behavior made me reflect on C++'s pass-by-value and pass-by-reference better. When passed by value, C++ makes an explicit copy of the data within the function and the data passed in is available after the function call. It gives an illusion of using the same data. But Rust makes it explicit so that you understand exactly what is happening. If you want to access the data after the function call, you pass a clone of the data to the function. Being immutable by default, Rust also makes the intention explicit unlike C++, when things are passed by reference which I like.
- Another big difference is how Rust outright denies performing type promotions for you, unlike C++. By doing so, the programmer has an explicit understanding of what he/she is trying to do and what is being done. You cannot add a `f64` to a `f32`. You need to explicitly cast the operands into consistent types which I think is very cool. In a way, I felt closer to the code I was writing when writing in Rust than when writing C++.
- Rust wants you to think of object-oriented programming with the lens of `has a` instead of `is a`. A Rust struct contains other structs and fields. Structs get behaviors by implementing traits.
- Because of this philosophy, Rust doesn't have the concept of inheritance. You can achieve something similar to that by clearly separating behaviors and attributes.
- Another major thing about Rust I noticed is that you cannot do type specialization - yet. 
- Rust doesn't have negative trait bounds - yet. I cannot say something like: *Implement these behaviors for types of kind A, and implement these other behaviors for types  NOT of kind A.*
- Because I don't have specialization and I don't have negative traits, I can't trivially do something of the sort: *Implement these for generic type T where T is a number. But handle things differently for f64*.
- One could try to do something like that using associated types, macros and other Rust features.
- Rust seems more low-level than C++ because you end up being explicit about your intentions and the behaviors you expect/want.
- Rust is indeed cool! I don't know if I'll do anything useful in my official work with it but it is teaching me things that I either never knew about programming or never bothered to question/understand deeply about.
