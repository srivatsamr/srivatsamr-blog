---
layout: post
title: Bayesian Classification with Spatial Prior 
date: 2026-04-30
description: Deriving the expectation maximization algorithm for segmenting and classifying images with user defined spatial prior 
categories: ml geo spatial bayesian
---

The cool thing about LLMs these days is that they help you ideate, learn and implement ideas at a much faster pace than ever possible. Recently at work, I have been looking into the classification of a 2D map based on some sparse and some densely sampled features. Previously, I had derived the [Expectation Maximization]({% post_url 2026-01-17-ExpectationMaximization %}) but that assumed no spatial dependence between neigbouring elements. After a lot of experimentation and user feedback, I decided to implement the algorithm while providing a reasonable spatial prior to influence the classification (For example, continuity of bodies, ordered transition i.e. Class 1 -> Class 2 -> Class 3 etc.).

Recently, my R&D workflow has been something along the following lines:

1. Brain storm with an LLM about the state of the art, analyze some ideas, question my assumptions etc. Since I work in an interdisciplinary environment, I come across a wide variety of ideas and it feels awesome to ponder if the concepts and algorithms I used for some other project can be creatively applied somewhere else. In this phase, I instruct the LLM not to give any code, be pedagogical when explaining topics I didn't know and be very mathematically rigorous.
2. Once I have the mathematics down, and can represent the solution in my mind in small chunks/steps, I instruct it to code it for me. LLM types much faster than I can. So I focus on understanding the algorithm and proof reading its implementation (note that this still requires experience with coding and I am so grateful I didn't have LLMs write my code in my early career days lol.)
3. Run the code on real data, get user feedback and iterate.

This post is about the Step 1. I spent almost 2 days deriving (and deriving again) to get a firm handle on the mathematical formulation of the expectation maximization algorithm along with spatial prior. To make it easy to understand how to implement it, I found its best to derive the algorithm explicitly for a minimal case. So I'll first do that and later summarize the generic formulation.

## Deriving EM Algorithm on Sample Grid

{% include figure.liquid
    path="assets/img/post/2026-05-25_1.png"
    class="rounded z-depth-1 mx-auto d-block"
    width="500px"
    title="Sample Grid"
    caption="Sample Grid with 3 nodes"
%}

## Assumptions

1. The data $\mathbf{X}$ is assumed to be conditionally independent and normally distributed:

$$P(X_i|z_i=k) = \mathcal{N}(\mu_k, \sigma^2_k)$$

$$P(\mathbf{X} | \mathbf{Z}) = \prod_{i=1}^{3}P(X_i|z_i)$$

1. The class prior $P(\mathbf{z})$ is distributed according to the Potts Model:

$$P(\mathbf{z}) = \frac{exp(\sum_{edges}\beta_{e}\delta(z_i, z_j))}{C}$$

which basically is saying: The probability of the whole grid configuration depends on how much you think neighbours should have same class assignment. If $z_i = z_j$ at the nodes of an edge, we add term scaled by factor representing strength of our belief $\beta$. If they are different, the dirac delta becomes zero and that edge doesn't contribute to the configuration probability, effectively incorporating our belief about the grid configuration. $C$ is just the normalization constant.

## Geometric Configuration

We have:

1. Edges - {(1, 2), (2, 3)}
2. Weights - {$\beta_{12}, \beta_{23}$}
3. Classes - $z_i \in$ {1, 2, 3}

## Evidence Lower Bound (ELBO)

The goal is to maximize the surrogate objective ELBO with respect to the model parameters $\theta$.

$$
\begin{aligned}
\text{ELBO} &= \sum_{\mathbf{z}} q(\mathbf{z}) log(\frac{P(\mathbf{X}, \mathbf{z} | \theta)}{q(\mathbf{z})}) \\
&= \sum_{\mathbf{z}} q(\mathbf{z}) log(P(\mathbf{X}, \mathbf{z} | \theta)) - \sum_{\mathbf{z}} q(\mathbf{z}) log(q(\mathbf{z}))
\end{aligned}
$$

Since the second term is independent of $\theta$, our aim is to maximize the first term:

$$\text{maximize}_{\theta} \sum_{\mathbf{z}} q(\mathbf{z}) log(P(\mathbf{X}, \mathbf{z} | \theta))$$

## E-Step

Here comes an important observation. The summation is over all the possible grid configurations. For a grid size of $N$ and $K$ classes for the latent variable, the number of terms in addition is $K^N$. For a reasonably large grid, this becomes intractable. This is when we use the assumptions to make it tractable. If the terms in summation are factorizable over the grid points, the summation over all possible configurations will reduce to product of $N$ terms.

$$\sum_{\mathbf{z}} \prod_{i=1}^N t_i(z_i) = \prod_{i=1}^{N} \sum_{j=1}^{K}t_i(z_i=j)$$

In the E-Step, we aim to find the distribution $q(\mathbf{z})$. In simple Gaussian Mixture Model, $ q(\mathbf{z})$ is set directly to the posterior, which ends up being analytical and factorizable. But with Potts Prior, this is not the case. So we use something called *Mean Field Approximation* to model $q(\mathbf{z}) = \prod_{i=1}^N q_i(z_i)$.

We then minimize the KL divergence between q and the true posterior for fixed $\theta$. This q is meant to reduce the gap between ELBO and the true log likelihood of the observed data which will then be used to maximize the ELBO with respect to model parameters (coordiate ascent scheme).

$$
\begin{aligned}
KL(q(\mathbf{z}) || P(\mathbf{z}|\mathbf{X}, \theta)) &= \sum_{\mathbf{z}}q(\mathbf{z})log(\frac{q(\mathbf{z})}{P(\mathbf{z}|\mathbf{X}, \theta)}) \\
&= \sum_{\mathbf{z}}q(\mathbf{z})log(q(\mathbf{z})) - \sum_{\mathbf{z}}q(\mathbf{z})log(P(\mathbf{z}|\mathbf{X}, \theta))
\end{aligned}
$$

We want to find the best $q_i(z_i=j)$ to minimize the above subject to the total probability constraint at each grid location

$$\sum_{j}q_i(z_i=j) = 1$$

For this, we need to take partial derivatives of the Lagrangian (to convert constrained to unconstrained problem) with respect to $q_i(z_i=j)$ and equate to $0$. So let's focus on the partial derivative of the terms separately.

1. $\sum_{\mathbf{z}}q(\mathbf{z})log(q(\mathbf{z}))$

$$
\begin{aligned}
&= \sum_{\mathbf{z}}\prod_{i=1}^3 q_i(z_i) log(\prod_{i=1}^3 q_i(z_i)) \\
&= \sum_{\mathbf{z}}\prod_{i=1}^3 q_i(z_i) \sum_{i=1}^3 log(q_i(z_i)) \\
&= \sum_{\mathbf{z}}(q_1(z_1)q_2(z_2)q_3(z_3)log(q_1(z_1)) + q_1(z_1)q_2(z_2)q_3(z_3)log(q_2(z_2)) + q_1(z_1)q_2(z_2)q_3(z_3)log(q_3(z_3))) \\
&= \sum_{z_1}\sum_{z_2}\sum_{z_3}(q_1(z_1)q_2(z_2)q_3(z_3)log(q_1(z_1)) + q_1(z_1)q_2(z_2)q_3(z_3)log(q_2(z_2)) + q_1(z_1)q_2(z_2)q_3(z_3)log(q_3(z_3))) \\
&= \sum_{z_1}q_1(z_1)log(q_1(z_1)) + \sum_{z_2}q_2(z_2)log(q_2(z_2)) + \sum_{z_3}q_3(z_3)log(q_3(z_3))
\end{aligned}
$$

as $\sum_{z_i}q_i(z_i) = 1$. Therefore:

$$\frac{\partial}{\partial q_i(z_i = j)} &= log(q_i(z_i=j)) + 1$$
