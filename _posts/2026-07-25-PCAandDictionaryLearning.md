---
layout: post
title: "Learning Linear and Independent Structures — A Guided Journey"
date: 2026-07-25
description: A conversational record of working through Chapter 2 of the Berkeley Deep Representation Learning book — PCA, Dictionary Learning, and the mathematics behind them.
categories: machine-learning
tags: [linear-algebra, learning-journal]
toc:
  sidebar: left
---

*This post is a record of my learning journey through Chapter 2 of the [Berkeley Deep Representation Learning book](https://ma-lab-berkeley.github.io/deep-representation-learning-book/Ch2.html). Rather than a polished summary, it captures the actual process — the questions, the derivations, the stuck points, and the moments of clarity. Everything under **Me:** I derived myself on paper. Everything under **Claude:** is guidance, hints, or consolidation.*

---

We agreed on a format: I attempt everything on paper first, photograph my work, and Claude gives targeted hints only where I'm stuck. No spoon-feeding.

---

## Chapter Map

Here's the skeleton of what actually matters in Chapter 2, stripped of all book filler:

```
CENTRAL PROBLEM: Data lives on a low-dimensional manifold
                 in a high-dimensional space. Recover it.

┌─────────────────────────────────────────────────────────┐
│ 2.1  PCA — one linear subspace                          │
│   • Model: x = Uz + ε                                   │
│   • Key insight: denoising = projection onto subspace   │
│   • Solution: top eigenvectors of XX^T/N                │
│   • Algorithm: power iteration                          │
├─────────────────────────────────────────────────────────┤
│ 2.2  Complete Dictionary Learning / ICA                 │
│   — UNION of subspaces, not their span                  │
│   • Why PCA fails: rotation invariance destroys sparsity│
│   • Key insight: sparsity ↔ non-Gaussianity ↔ kurtosis  │
│   • Solution: maximize ℓ⁴ norm (MSP algorithm)          │
└─────────────────────────────────────────────────────────┘
```

---

## Section 2.1 — Principal Components Analysis

### The Setup

We have $$N$$ data points $$\{\mathbf{x}_i\}_{i=1}^N \subset \mathbb{R}^D$$. We believe they approximately live on a $$d$$-dimensional subspace, where $$d \ll D$$. The data-generating model is:

$$\mathbf{x}_i = \mathbf{U}\mathbf{z}_i + \boldsymbol{\varepsilon}_i$$

where $$\mathbf{U} \in \mathbb{R}^{D \times d}$$ has orthonormal columns (so $$\mathbf{U}^\top \mathbf{U} = \mathbf{I}_d$$), $$\mathbf{z}_i \in \mathbb{R}^d$$ is the low-dimensional latent code, and $$\boldsymbol{\varepsilon}_i$$ is small noise.

**Goal:** Recover $$\mathbf{U}$$ from data.

---

### Step 1 — Optimal Code for Fixed Subspace

**Claude:** Given fixed $$\mathbf{U}$$ (orthonormal columns), find the $$\mathbf{z}_i$$ minimising $$\|\mathbf{x}_i - \mathbf{U}\mathbf{z}_i\|_2^2$$. What does it mean geometrically?

**Me:** I write the squared norm as a transpose product and expand:

$$\|\mathbf{x}_i - \mathbf{U}\tilde{\mathbf{z}}_i\|_2^2 = (\mathbf{x}_i - \mathbf{U}\tilde{\mathbf{z}}_i)^\top(\mathbf{x}_i - \mathbf{U}\tilde{\mathbf{z}}_i)$$

Expanding:

$$= \mathbf{x}_i^\top\mathbf{x}_i - \mathbf{x}_i^\top\mathbf{U}\tilde{\mathbf{z}}_i - \tilde{\mathbf{z}}_i^\top\mathbf{U}^\top\mathbf{x}_i + \tilde{\mathbf{z}}_i^\top\mathbf{U}^\top\mathbf{U}\tilde{\mathbf{z}}_i$$

The cross terms both equal the same scalar so they combine. Using $$\mathbf{U}^\top\mathbf{U} = \mathbf{I}_d$$:

$$= \mathbf{x}_i^\top\mathbf{x}_i - 2\mathbf{x}_i^\top\mathbf{U}\tilde{\mathbf{z}}_i + \tilde{\mathbf{z}}_i^\top\tilde{\mathbf{z}}_i$$

Differentiating with respect to $$\tilde{\mathbf{z}}_i$$ and setting to zero:

$$\frac{\partial}{\partial \tilde{\mathbf{z}}_i}: \quad -2\mathbf{U}^\top\mathbf{x}_i + 2\tilde{\mathbf{z}}_i = 0 \implies \boxed{\mathbf{z}_i^\star = \mathbf{U}^\top\mathbf{x}_i}$$

*(Note: I initially wrote $$\mathbf{z}_i = \mathbf{x}_i^\top\mathbf{U}$$ — a row vector — then caught the shape error and corrected to the column vector form.)*

**Claude:** Exactly right. Note: the two cross terms collapse because both are scalars, so a scalar equals its own transpose — you'll use that trick constantly.

Now push further: what is $$\mathbf{U}\mathbf{U}^\top\mathbf{x}_i$$ geometrically?

**Me:** *(sketch)* Taking $$D=3$$, $$d=1$$, so $$\mathbf{U} = \mathbf{u}$$ is a single unit vector:

$$\mathbf{u}\mathbf{u}^\top\mathbf{x}_i = (\mathbf{u}^\top\mathbf{x}_i)\mathbf{u}$$

The scalar $$\mathbf{u}^\top\mathbf{x}_i$$ is the component of $$\mathbf{x}_i$$ along $$\mathbf{u}$$, and we scale $$\mathbf{u}$$ by it. This is the **orthogonal projection** of $$\mathbf{x}_i$$ onto the line spanned by $$\mathbf{u}$$.

**Claude:** Perfect. Generalising: $$\mathbf{U}\mathbf{U}^\top$$ is orthogonal projection onto the $$d$$-dimensional subspace spanned by the columns of $$\mathbf{U}$$.

**Retention anchor:** Why is $$\mathbf{U}\mathbf{U}^\top\mathbf{x}_i$$ the denoised version of $$\mathbf{x}_i$$?

*Answer chain:* $$\mathbf{x}_i = \mathbf{U}\mathbf{z}_i + \boldsymbol{\varepsilon}_i$$ → the true signal lives on the subspace → projection strips the noise component → $$\hat{\mathbf{x}}_i = \mathbf{U}\mathbf{U}^\top\mathbf{x}_i$$.

---

### Step 2 — Minimising Reconstruction Error Equals Maximising Projected Variance

**Claude:** Show that minimising $$\frac{1}{N}\sum_{i=1}^N \|\mathbf{x}_i - \tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2$$ is equivalent to maximising $$\frac{1}{N}\sum_{i=1}^N \|\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2$$.

**Me:** Expand the reconstruction error:

$$\|\mathbf{x}_i - \tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2 = (\mathbf{x}_i - \tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i)^\top(\mathbf{x}_i - \tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i)$$

$$= \mathbf{x}_i^\top\mathbf{x}_i - \mathbf{x}_i^\top\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i - \mathbf{x}_i^\top\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i + \mathbf{x}_i^\top\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i$$

Using **idempotency** of the projection: $$\tilde{\mathbf{U}}^\top\tilde{\mathbf{U}} = \mathbf{I}_d$$, so $$\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top = \tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top$$. Therefore the last two terms collapse:

$$= \mathbf{x}_i^\top\mathbf{x}_i - 2\mathbf{x}_i^\top\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i + \mathbf{x}_i^\top\tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i = \mathbf{x}_i^\top\mathbf{x}_i - \|\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2$$

Summing over all $$i$$:

$$\frac{1}{N}\sum_i \|\mathbf{x}_i - \tilde{\mathbf{U}}\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2 = \underbrace{\frac{1}{N}\sum_i \|\mathbf{x}_i\|^2}_{\text{constant in }\tilde{\mathbf{U}}} - \frac{1}{N}\sum_i \|\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2$$

Minimising the left side is therefore equivalent to:

$$\max_{\tilde{\mathbf{U}}} \frac{1}{N}\sum_{i=1}^N \|\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2$$

**Claude:** The key step you nailed: idempotency $$(\mathbf{U}\mathbf{U}^\top)^2 = \mathbf{U}\mathbf{U}^\top$$ collapsed the last two terms. Geometrically this is Pythagoras — total energy of $$\mathbf{x}_i$$ minus captured energy equals residual error.

---

### Step 3 — The Objective Becomes a Trace

**Claude:** Show $$\frac{1}{N}\sum_i \|\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2 = \mathrm{tr}\!\left(\tilde{\mathbf{U}}^\top \frac{\mathbf{X}\mathbf{X}^\top}{N}\tilde{\mathbf{U}}\right)$$.

**Me:** Writing $$\tilde{\mathbf{U}}^\top\mathbf{x}_i$$ explicitly — $$\tilde{\mathbf{U}}^\top$$ has rows $$\mathbf{u}_1^\top, \dots, \mathbf{u}_d^\top$$

$$\tilde{\mathbf{U}}^\top\mathbf{x}_i = \begin{bmatrix} \mathbf{u}_1^\top\mathbf{x}_i \\ \vdots \\ \mathbf{u}_d^\top\mathbf{x}_i \end{bmatrix}$$

Therefore:

$$\|\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2 = \sum_{j=1}^d (\mathbf{u}_j^\top\mathbf{x}_i)^2 = \mathrm{tr}(\tilde{\mathbf{U}}^\top\mathbf{x}_i\mathbf{x}_i^\top\tilde{\mathbf{U}})$$

using the identity $$\|\mathbf{v}\|^2 = \mathrm{tr}(\mathbf{v}\mathbf{v}^\top)$$. Summing:

$$\frac{1}{N}\sum_i \|\tilde{\mathbf{U}}^\top\mathbf{x}_i\|_2^2 = \frac{1}{N}\sum_i \mathrm{tr}(\tilde{\mathbf{U}}^\top\mathbf{x}_i\mathbf{x}_i^\top\tilde{\mathbf{U}}) = \mathrm{tr}\!\left(\tilde{\mathbf{U}}^\top \frac{\mathbf{X}\mathbf{X}^\top}{N}\tilde{\mathbf{U}}\right)$$

using linearity of trace and $$\sum_i \mathbf{x}_i\mathbf{x}_i^\top = \mathbf{X}\mathbf{X}^\top$$.

---

### Step 4 — The Solution is the Top Eigenvectors

**Claude:** For $$d=1$$, maximise $$\tilde{\mathbf{u}}^\top\mathbf{M}\tilde{\mathbf{u}}$$ subject to $$\|\tilde{\mathbf{u}}\|=1$$, where $$\mathbf{M} = \mathbf{X}\mathbf{X}^\top/N$$. For general $$d$$, show the solution consists of the top $$d$$ eigenvectors of $$\mathbf{M}$$.

**Me:** I use the Lagrangian approach. For finding the first principal component $$\mathbf{u}_1$$:

$$\mathcal{L} = \mathbf{u}^\top\mathbf{M}\mathbf{u} - \lambda(\mathbf{u}^\top\mathbf{u} - 1)$$

Setting derivatives to zero:

$$\frac{\partial \mathcal{L}}{\partial \mathbf{u}} = 2\mathbf{M}\mathbf{u} - 2\lambda\mathbf{u} = 0 \implies \mathbf{M}\mathbf{u} = \lambda\mathbf{u}$$

$$\frac{\partial \mathcal{L}}{\partial \lambda} = \mathbf{u}^\top\mathbf{u} - 1 = 0$$

So $$\mathbf{u}$$ is an eigenvector of $$\mathbf{M}$$. Since we want to **maximise** $$\mathbf{u}^\top\mathbf{M}\mathbf{u} = \lambda\mathbf{u}^\top\mathbf{u} = \lambda$$, we choose the eigenvector corresponding to the **largest eigenvalue**.

For $$\mathbf{u}_2$$, we add the orthogonality constraint $$\mathbf{u}_1^\top\mathbf{u}_2 = 0$$:

$$\mathcal{L} = \mathbf{u}^\top\mathbf{M}\mathbf{u} - \lambda_1(\mathbf{u}^\top\mathbf{u}-1) - \lambda_2(\mathbf{u}_1^\top\mathbf{u})$$

$$\frac{\partial \mathcal{L}}{\partial \mathbf{u}} = 2\mathbf{M}\mathbf{u} - 2\lambda_1\mathbf{u} - \lambda_2\mathbf{u}_1 = 0$$

Left-multiplying by $$\mathbf{u}_1^\top$$:

$$2\mathbf{u}_1^\top\mathbf{M}\mathbf{u} - 2\lambda_1\underbrace{\mathbf{u}_1^\top\mathbf{u}}_{=0} - \lambda_2\underbrace{\mathbf{u}_1^\top\mathbf{u}_1}_{=1} = 0$$

$$\implies \lambda_2 = 0$$

So the equation reduces to $$\mathbf{M}\mathbf{u}_2 = \lambda_1\mathbf{u}_2$$ — again an eigenvector of $$\mathbf{M}$$, and the maximiser is the eigenvector with the **second largest eigenvalue**.

By induction, the optimal $$\tilde{\mathbf{U}}^\star$$ has columns equal to the top $$d$$ eigenvectors of $$\mathbf{M} = \mathbf{X}\mathbf{X}^\top/N$$.

---

### PCA Summary and Retention Anchors

The full PCA pipeline:

$$\mathbf{x} \xrightarrow{\mathcal{E} = (\mathbf{U}^\star)^\top} \mathbf{z} \xrightarrow{\mathcal{D} = \mathbf{U}^\star} \hat{\mathbf{x}}$$

This is a linear autoencoder. The denoised output $$\hat{\mathbf{x}} = \mathbf{U}^\star(\mathbf{U}^\star)^\top\mathbf{x}$$ is the projection onto the learned subspace.

**Three anchors — if you can answer these, you can rebuild PCA from scratch:**

1. Why does minimising reconstruction error equal maximising projected variance?
2. What is $$\mathbf{U}\mathbf{U}^\top$$ and why is it the optimal denoiser?
3. Why does the optimal $$\mathbf{U}$$ consist of top eigenvectors of $$\mathbf{X}\mathbf{X}^\top/N$$?

---

## Interlude — The Spectral Theorem

Before moving to Section 2.2, we needed the spectral theorem, and then SVD. Rather than accept them as black boxes, I derived both from scratch.

### Spectral Theorem

**Statement:** If $$\mathbf{M} \in \mathbb{R}^{n \times n}$$ is symmetric, then $$\mathbf{M} = \mathbf{Q}\mathbf{\Lambda}\mathbf{Q}^\top$$ where $$\mathbf{Q}$$ is orthogonal and $$\mathbf{\Lambda}$$ is diagonal with real entries.

**Part 1 — Eigenvalues are real.**

**Me:** Let $$\mathbf{M}\mathbf{v} = \lambda\mathbf{v}$$ with $$\lambda \in \mathbb{C}$$, $$\mathbf{v} \in \mathbb{C}^n$$. Compute $$\bar{\mathbf{v}}^\top\mathbf{M}\mathbf{v}$$ two ways.

*Way 1:* Using the eigenvalue equation directly:

$$\bar{\mathbf{v}}^\top\mathbf{M}\mathbf{v} = \bar{\mathbf{v}}^\top(\lambda\mathbf{v}) = \lambda\sum_i |v_i|^2$$

*Way 2:* Take the complex conjugate of the whole expression. Since $$\mathbf{M}$$ is real and symmetric ($$\mathbf{M}^* = \mathbf{M}$$, $$\mathbf{M}^\top = \mathbf{M}$$):

$$\overline{(\bar{\mathbf{v}}^\top\mathbf{M}\mathbf{v})} = \mathbf{v}^\top\mathbf{M}^\top\bar{\mathbf{v}} = \mathbf{v}^\top\mathbf{M}\bar{\mathbf{v}}$$

But from $$\mathbf{M}\mathbf{v} = \lambda\mathbf{v}$$, taking conjugates gives $$\mathbf{M}\bar{\mathbf{v}} = \bar{\lambda}\bar{\mathbf{v}}$$, so:

$$\mathbf{v}^\top\mathbf{M}\bar{\mathbf{v}} = \bar{\lambda}\sum_i |v_i|^2$$

Equating both computations of $$\bar{\mathbf{v}}^\top\mathbf{M}\mathbf{v}$$ and its conjugate:

$$\lambda\sum_i|v_i|^2 = \bar{\lambda}\sum_i|v_i|^2 \implies \lambda = \bar{\lambda} \implies \lambda \in \mathbb{R} \quad \blacksquare$$

**Part 2 — Eigenvectors of distinct eigenvalues are orthogonal.**

**Me:** Take two eigenpairs $$(\lambda_1, \mathbf{v}_1)$$ and $$(\lambda_2, \mathbf{v}_2)$$ with $$\lambda_1 \neq \lambda_2$$. Compute $$\mathbf{v}_1^\top\mathbf{M}\mathbf{v}_2$$ two ways.

*Way 1:* Use $$\mathbf{v}_2$$ is an eigenvector:

$$\mathbf{v}_1^\top\mathbf{M}\mathbf{v}_2 = \lambda_2\mathbf{v}_1^\top\mathbf{v}_2$$

*Way 2:* Use symmetry of $$\mathbf{M}$$ — transpose the expression (it's a scalar so equals its transpose):

$$\mathbf{v}_1^\top\mathbf{M}\mathbf{v}_2 = (\mathbf{v}_1^\top\mathbf{M}\mathbf{v}_2)^\top = \mathbf{v}_2^\top\mathbf{M}^\top\mathbf{v}_1 = \mathbf{v}_2^\top\mathbf{M}\mathbf{v}_1 = \lambda_1\mathbf{v}_2^\top\mathbf{v}_1 = \lambda_1\mathbf{v}_1^\top\mathbf{v}_2$$

Equating:

$$\lambda_2\mathbf{v}_1^\top\mathbf{v}_2 = \lambda_1\mathbf{v}_1^\top\mathbf{v}_2 \implies (\lambda_2 - \lambda_1)\mathbf{v}_1^\top\mathbf{v}_2 = 0$$

Since $$\lambda_1 \neq \lambda_2$$: $$\mathbf{v}_1^\top\mathbf{v}_2 = 0 \quad \blacksquare$$

---

### SVD — Singular Value Decomposition

**Statement:** Any $$\mathbf{A} \in \mathbb{R}^{m \times n}$$ can be written as $$\mathbf{A} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top$$ where $$\mathbf{U} \in \mathbb{R}^{m\times m}$$, $$\mathbf{V} \in \mathbb{R}^{n\times n}$$ are orthogonal and $$\mathbf{\Sigma} \in \mathbb{R}^{m\times n}$$ is diagonal with non-negative entries $$\sigma_1 \geq \sigma_2 \geq \dots \geq 0$$.

**Step 1 — Properties of $$\mathbf{A}^\top\mathbf{A}$$ and $$\mathbf{A}\mathbf{A}^\top$$.**

**Me:**

*Symmetry:*

$$(\mathbf{A}^\top\mathbf{A})^\top = \mathbf{A}^\top(\mathbf{A}^\top)^\top = \mathbf{A}^\top\mathbf{A} \checkmark$$

$$(\mathbf{A}\mathbf{A}^\top)^\top = (\mathbf{A}^\top)^\top\mathbf{A}^\top = \mathbf{A}\mathbf{A}^\top \checkmark$$

*Non-negative eigenvalues:* If $$\mathbf{A}^\top\mathbf{A}\mathbf{v} = \lambda\mathbf{v}$$, left-multiply by $$\mathbf{v}^\top$$:

$$\mathbf{v}^\top\mathbf{A}^\top\mathbf{A}\mathbf{v} = \lambda\|\mathbf{v}\|^2 \implies \|\mathbf{A}\mathbf{v}\|^2 = \lambda\|\mathbf{v}\|^2$$

Since $$\|\mathbf{A}\mathbf{v}\|^2 \geq 0$$ and $$\|\mathbf{v}\|^2 > 0$$, we get $$\lambda \geq 0$$.

*Shared nonzero eigenvalues:* If $$\mathbf{A}^\top\mathbf{A}\mathbf{v} = \lambda\mathbf{v}$$ with $$\lambda \neq 0$$, left-multiply by $$\mathbf{A}$$:

$$\mathbf{A}\mathbf{A}^\top(\mathbf{A}\mathbf{v}) = \lambda(\mathbf{A}\mathbf{v})$$

So $$\mathbf{A}\mathbf{v}$$ is an eigenvector of $$\mathbf{A}\mathbf{A}^\top$$ with the same eigenvalue $$\lambda$$. And $$\mathbf{A}\mathbf{v} \neq \mathbf{0}$$ since $$\|\mathbf{A}\mathbf{v}\|^2 = \lambda\|\mathbf{v}\|^2 > 0$$.

**Step 2 — Assembling SVD.**

**Me:** Define $$\sigma_i = \sqrt{\lambda_i}$$ (singular values). The eigenvectors $$\mathbf{v}_1, \dots, \mathbf{v}_n$$ of $$\mathbf{A}^\top\mathbf{A}$$ are orthonormal (spectral theorem). Define:

$$\mathbf{u}_i = \frac{\mathbf{A}\mathbf{v}_i}{\|\mathbf{A}\mathbf{v}_i\|} = \frac{\mathbf{A}\mathbf{v}_i}{\sigma_i}$$

So $$\mathbf{A}\mathbf{v}_i = \sigma_i\mathbf{u}_i$$. Stacking into matrices:

$$\mathbf{A}\mathbf{V} = \mathbf{U}\mathbf{\Sigma}$$

Right-multiplying by $$\mathbf{V}^\top$$, and using $$\mathbf{V}\mathbf{V}^\top = \mathbf{I}$$ (since $$\mathbf{V}$$'s columns are orthonormal eigenvectors of a real symmetric matrix):

$$\boxed{\mathbf{A} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top}$$

---

## Section 2.2 — Complete Dictionary Learning

### The New Setting

Instead of data living on **one** subspace, it lives on a **union** of subspaces — each $$\mathbf{x}_i$$ comes from *one of* $$K$$ subspaces. The model:

$$\mathbf{x} = \mathbf{U}\mathbf{z} + \boldsymbol{\varepsilon}, \qquad \|\mathbf{z}\|_0 \ll D$$

where $$\mathbf{U} \in O(D)$$ is a **square orthogonal** dictionary and $$\mathbf{z}$$ is **sparse**. The word *complete* means the dictionary has exactly $$D$$ columns — a full basis for $$\mathbb{R}^D$$.

### Why PCA Fails

**Claude:** Why does PCA fail here? What happens if you substitute $$\tilde{\mathbf{U}}\mathbf{Q}$$ into the PCA objective for any orthogonal $$\mathbf{Q}$$?

**Me:** The PCA objective is $$\mathrm{tr}(\tilde{\mathbf{U}}^\top\mathbf{M}\tilde{\mathbf{U}})$$. Substituting $$\tilde{\mathbf{U}}\mathbf{Q}$$:

$$\mathrm{tr}\!\left((\tilde{\mathbf{U}}\mathbf{Q})^\top\mathbf{M}(\tilde{\mathbf{U}}\mathbf{Q})\right) = \mathrm{tr}\!\left(\mathbf{Q}^\top\tilde{\mathbf{U}}^\top\mathbf{M}\tilde{\mathbf{U}}\mathbf{Q}\right)$$

Using the cyclic property of trace — cycle $$\mathbf{Q}^\top$$ to the right end:

$$= \mathrm{tr}\!\left(\tilde{\mathbf{U}}^\top\mathbf{M}\tilde{\mathbf{U}}\cdot\mathbf{Q}\mathbf{Q}^\top\right) = \mathrm{tr}\!\left(\tilde{\mathbf{U}}^\top\mathbf{M}\tilde{\mathbf{U}}\right)$$

since $$\mathbf{Q}\mathbf{Q}^\top = \mathbf{I}$$ for orthogonal $$\mathbf{Q}$$.

**Conclusion:** The PCA objective is **rotation invariant** — replacing $$\tilde{\mathbf{U}}$$ with $$\tilde{\mathbf{U}}\mathbf{Q}$$ gives identical objective value. If $$\mathbf{U}^\star$$ gives sparse codes $$\mathbf{z}_i = (\mathbf{U}^\star)^\top\mathbf{x}_i$$, then $$\mathbf{U}^\star\mathbf{Q}$$ gives codes $$\mathbf{Q}^\top\mathbf{z}_i$$ — which are generically **not sparse**.

> **The PCA objective never really PREFERS a sparse solution.**

---

### $$\ell^4$$ Maximisation Promotes Sparsity

We need an objective that breaks rotation invariance and actively prefers sparse codes.

**Geometric intuition:** Consider the $$\ell^p$$ unit ball:

- $$p=2$$: circle (in 2D)
- $$p=4$$: between circle and square — bulges toward coordinate axes
- $$p=\infty$$: square — corners point exactly at coordinate axes

Maximising $$\|\mathbf{v}\|_4^4$$ on the $$\ell^2$$ sphere finds points that stick furthest into the corners of the $$\ell^4$$ ball — exactly the **coordinate axis directions**, which are the sparse vectors.

**Algebraic proof (I insisted on this rather than just intuition):**

Maximise $$\sum_i z_i^4$$ subject to $$\sum_i z_i^2 = 1$$. Lagrangian:

$$\mathcal{L} = \sum_i z_i^4 - \mu\!\left(\sum_i z_i^2 - 1\right)$$

$$\frac{\partial \mathcal{L}}{\partial z_i} = 4z_i^3 - 2\mu z_i = 0 \implies z_i(2z_i^2 - \mu) = 0$$

So each $$z_i = 0$$ or $$z_i = \pm\sqrt{\mu/2}$$. If $$k$$ entries are nonzero, the constraint gives $$k\cdot(\mu/2) = 1$$, so $$\mu = 2/k$$ and the objective equals $$1/k$$.

- **Maximising:** set $$k=1$$ → coordinate axis, value $$= 1$$
- **Minimising:** set $$k=n$$ → uniform vector, value $$= 1/n$$

---

### The $$\ell^4$$ Objective and Gradient

The dictionary learning objective:

$$\max_{\tilde{\mathbf{A}} \in O(D)} \frac{1}{4}\|\tilde{\mathbf{A}}\mathbf{X}\|_4^4$$

Here $$\tilde{\mathbf{A}}$$ is our candidate for $$\mathbf{U}^\top$$ — the inverse of the dictionary. When we find the right $$\tilde{\mathbf{A}}$$, the transformed data $$\tilde{\mathbf{A}}\mathbf{x}_i \approx \mathbf{z}_i$$ is sparse, maximising the $$\ell^4$$ norm.

**Computing the gradient:**

Let $$\mathbf{B} = \tilde{\mathbf{A}}\mathbf{X} \in \mathbb{R}^{D\times N}$$, so $$B_{pj} = \sum_k \tilde{A}_{pk}X_{kj}$$.

$$\frac{\partial}{\partial \tilde{A}_{pq}}\frac{1}{4}\|\tilde{\mathbf{A}}\mathbf{X}\|_4^4 = \frac{\partial}{\partial \tilde{A}_{pq}}\frac{1}{4}\sum_{i,j}B_{ij}^4 = \sum_j B_{pj}^3 \cdot X_{qj}$$

In matrix form — index $$p$$ picks a row of $$\mathbf{B}^{\odot 3}$$, index $$q$$ picks a row of $$\mathbf{X}$$, summing over $$j$$ contracts the $$N$$ dimension:

$$\nabla_{\tilde{\mathbf{A}}} \frac{1}{4}\|\tilde{\mathbf{A}}\mathbf{X}\|_4^4 = (\tilde{\mathbf{A}}\mathbf{X})^{\odot 3}\mathbf{X}^\top$$

where $$\odot 3$$ denotes elementwise cube.

---

### Projection onto Orthogonal Matrices

There is no closed-form solution to the $$\ell^4$$ maximisation (it's nonconvex), so we use **projected gradient ascent**: take a gradient step, then project back onto $$O(D)$$.

**What does "closest orthogonal matrix" mean?** We minimise the Frobenius norm:

$$\mathcal{P}_{O(D)}[\mathbf{M}] = \operatorname*{arg\,min}_{\mathbf{Q} \in O(D)}\|\mathbf{M} - \mathbf{Q}\|_F$$

**Me:** Write $$\mathbf{M} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top$$. Expand:

$$\|\mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top - \mathbf{Q}\|_F^2 = \mathrm{tr}\!\left[(\mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top - \mathbf{Q})^\top(\mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top - \mathbf{Q})\right]$$

$$= \mathrm{tr}(\mathbf{V}\mathbf{\Sigma}^2\mathbf{V}^\top) - \mathrm{tr}(\mathbf{V}\mathbf{\Sigma}\mathbf{U}^\top\mathbf{Q}) - \mathrm{tr}(\mathbf{Q}^\top\mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top) + \mathrm{tr}(\mathbf{Q}^\top\mathbf{Q})$$

$$= \mathrm{tr}(\mathbf{\Sigma}^2) - 2\,\mathrm{tr}(\mathbf{V}\mathbf{\Sigma}\mathbf{U}^\top\mathbf{Q}) + \mathrm{tr}(\mathbf{I})$$

(using cyclic trace, $$\mathrm{tr}(\mathbf{A}) = \mathrm{tr}(\mathbf{A}^\top)$$, and $$\mathbf{Q}^\top\mathbf{Q}=\mathbf{I}$$)

Minimising over $$\mathbf{Q}$$ is equivalent to:

$$\max_{\mathbf{Q} \in O(D)} \mathrm{tr}(\mathbf{V}\mathbf{\Sigma}\mathbf{U}^\top\mathbf{Q}) = \max_{\mathbf{Q}} \mathrm{tr}(\mathbf{\Sigma}\mathbf{U}^\top\mathbf{Q}\mathbf{V})$$

by the cyclic property. Substituting $$\tilde{\mathbf{Q}} = \mathbf{U}^\top\mathbf{Q}\mathbf{V}$$ (which is orthogonal since it's a product of orthogonal matrices, verified by $$\tilde{\mathbf{Q}}^\top\tilde{\mathbf{Q}} = \mathbf{V}^\top\mathbf{Q}^\top\mathbf{U}\mathbf{U}^\top\mathbf{Q}\mathbf{V} = \mathbf{I}$$):

$$\max_{\tilde{\mathbf{Q}} \in O(D)} \mathrm{tr}(\mathbf{\Sigma}\tilde{\mathbf{Q}}) = \max_{\tilde{\mathbf{Q}}} \sum_i \sigma_i \tilde{Q}_{ii}$$

Since $$\tilde{\mathbf{Q}}$$ is orthogonal its columns are unit vectors, so $$|\tilde{Q}_{ij}| \leq 1$$. With $$\sigma_i \geq 0$$, the maximum is achieved when $$\tilde{Q}_{ii} = 1$$ for all $$i$$, i.e., $$\tilde{\mathbf{Q}}^\star = \mathbf{I}$$.

Therefore $$\mathbf{U}^\top\mathbf{Q}^\star\mathbf{V} = \mathbf{I}$$, giving:

$$\boxed{\mathcal{P}_{O(D)}[\mathbf{M}] = \mathbf{U}\mathbf{V}^\top}$$

**Geometric meaning:** Drop the singular values, keep only the two rotations. The nearest orthogonal matrix sets all singular values to 1.

---

### The MSP Algorithm

Putting gradient and projection together, the **Matching, Stretching, and Projection (MSP)** algorithm is:

$$\tilde{\mathbf{A}}_{t+1} = \mathcal{P}_{O(D)}\!\left[(\tilde{\mathbf{A}}_t\mathbf{X})^{\odot 3}\mathbf{X}^\top\right] = \mathbf{U}_t\mathbf{V}_t^\top$$

where $$\mathbf{U}_t\mathbf{\Sigma}_t\mathbf{V}_t^\top$$ is the SVD of $$(\tilde{\mathbf{A}}_t\mathbf{X})^{\odot 3}\mathbf{X}^\top$$. Under broad conditions this converges to the correct dictionary at a superlinear rate.

Compare this to power iteration for PCA:

$$\mathbf{v}_{t+1} = \frac{\mathbf{M}\mathbf{v}_t}{\|\mathbf{M}\mathbf{v}_t\|}$$

Both are fixed-point iterations. MSP is the $$\ell^4$$ analogue of power iteration.

---

### Section 2.2 Retention Anchors

**Anchor 4:** Why does PCA fail to recover a sparse dictionary?
*(The objective is rotation invariant — replacing $$\mathbf{U}$$ by $$\mathbf{U}\mathbf{Q}$$ leaves the objective unchanged but destroys sparsity of the codes.)*

**Anchor 5:** Why does $$\ell^4$$ maximisation promote sparsity geometrically?
*(The $$\ell^4$$ ball has corners pointing at coordinate axes. Maximising $$\ell^4$$ norm on the $$\ell^2$$ sphere finds directions that stick into those corners — the sparse directions.)*

**Anchor 6:** What is the MSP iteration and where does each piece come from?
*(Gradient of $$\ell^4$$ objective gives $$(\tilde{\mathbf{A}}\mathbf{X})^{\odot 3}\mathbf{X}^\top$$; projection onto $$O(D)$$ via SVD gives $$\mathbf{U}\mathbf{V}^\top$$.)*

**Anchor 7:** Why is $$\mathbf{U}\mathbf{V}^\top$$ the closest orthogonal matrix to $$\mathbf{M} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^\top$$?
*(Frobenius minimisation → cyclic trace → reduce to $$\max\mathrm{tr}(\mathbf{\Sigma}\tilde{\mathbf{Q}})$$ → entries bounded by 1 → $$\tilde{\mathbf{Q}} = \mathbf{I}$$ optimal → $$\mathbf{Q}^\star = \mathbf{U}\mathbf{V}^\top$$.)*

---
