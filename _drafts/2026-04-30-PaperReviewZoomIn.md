---
layout: post
title: (Paper review) Zoom In - An Introduction to Circuits 
date: 2026-04-30
description: Understanding neurons, features, polysemanticity, superposition and circuits
categories: interpretability ai review
---

Ughh. I need to pick up pace with my blog posts. I have spent my time since my last interpretability post reading some foundational papers in mechanistic interpretability. I did a first pass on few and after getting acquianted with the jargon of the field, I am ready to dive deeper into these. The hope is to explain things in as simple terms as I can. So here is the review of the first paper: *Zoom In: An Introduction to Circuits* by Olah et al.

## What is the paper about?

Machine learning models are complex systems and we usually understand them by observing their behavior and treating them like black-boxes - *Behavorial Interpretability*. In this paper, the authors introduce tools and concepts for the *Mechanistic Interpretability* of models - *how* models do what they do, what *causally* produces certain behaviors (and not just correlations) etc. They establish these concepts and back their hypothesis with various examples they found by opening up vision models.

## Claims

The authors make the following claims:

- Models learn to represent human understable *features* as directions in their activation space
- Different features are connected by weights between the layers forming *circuits*
- Similar features and circuits form across models and tasks

## Features and Circuits

{% include figure.liquid
    path="assets/img/post/2026-04-30_1.png"
    class="rounded z-depth-1 mx-auto d-block"
    width="500px"
    title="Clarifying terminology"
    caption="Clarifying terminology"
%}
