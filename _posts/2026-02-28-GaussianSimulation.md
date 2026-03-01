---
layout: post
title: Kriging and Simulation in Geostatistics
date: 2026-02-28
description: A mathematical derivation
pretty_rable: true
categories: statistics probability math theory geostatistics
---

One of the many things I like about being a computational scientist is that I get exposed to many fields working on interdisciplinary projects. Recently, for a R&D project, I stumbled upon geostatistics in my literature review work. I went down the road of deriving the mathematics behind the concepts I was reading about and my intention here is to derive things from a basic level (sometimes too basic just to recollect the foundational maths) to the level required to work in the field confidently. I found [this](https://geostatsguy.github.io/GeostatsPyDemos_Book/intro.html) book very helpful to understand basic concepts. Highly recommend if you are interested in geostatistics.

# The basic problem in geostatistics

Usually in statistics, we have the opportunity to repeat an experiment to derive statistics about the quantity we are trying to observe. In geostatistics this is not possible. Once you take a sample from earth, that's all you have. You can't sample it again. The way geostatisticians overcome this is by assuming that the statistics of the random variable at a given location can be derived by sampling nearby locations (important to note that the observations at any location is in itself a random variable). The assumption here is that the spatial statistics within some neighbourhood is a reasonable proxy to the statistics at a given location. This is called the *Stationarity Assumption*. Mathematically:

$$
\begin{aligned}
\text{Stationary Mean: }\mathbb{E}[z(\vec{u})] &= m\\
\text{Stationary Distribution: }F(\vec{u}; z) &= F(z) \\
\text{Stationary Covariance: }C_z(\vec{u}; \vec{h}) &= C_z(\vec{h})
\end{aligned}
$$

$\forall \vec{u} \in D$ where $D$ is the domain of stationarity.

It is important to note that stationarity assumption is a choice, not a hypothesis that can be tested. So it is important to decide carefully what the extent of $D$ is.

Note: Sometimes, we can extend the stationarity assumption to a larger area if we isolate the trend and assume stationarity in the residuals.

# Semivariogram

To quantify the spatial relationships, they use something called a *Semivariogram* which is defined as half of the expected squared diifference between values separated by a specified *lag vector*. 

$$
\begin{aligned}
\gamma(\vec{h}) &= \frac{1}{2}\mathbb{E}[(z(\vec{u}_{\alpha}) - z(\vec{u}_\alpha + \vec{h}))^2] \\
&= \frac{1}{2N(\vec{h})}\sum_{\alpha=1}^{N(\vec{h})}(z(\vec{u}_{\alpha}) - z(\vec{u}_\alpha + \vec{h}))^2
\end{aligned}
$$

This is related to *covariance*. For the sake of brevity, I'll just use subscript $\alpha$ for quantities at $\vec{u}_\alpha$ and ${\alpha + h}$ for those at $\vec{u}+\vec{h}$

$$
\begin{aligned}
Cov(\vec{h}) &= \mathbb{E}[(z_\alpha - \mu_\alpha)(z_{\alpha+h} - \mu_{\alpha+h})] \\
&= \mathbb{E}[z_{\alpha}z_{\alpha+h} - z_\alpha\mu_{\alpha+h} - \mu_\alpha z_{\alpha+h} + \mu_\alpha \mu_{\alpha+h}] \\
&= \mathbb{E}[z_{\alpha}z_{\alpha+h}] - \mu_\alpha \mu_{\alpha+h}
\end{aligned}
$$

and

$$
\begin{aligned}
\gamma(\vec{h}) &= \frac{1}{2}\mathbb{E}[(z_\alpha - z_{\alpha + h})^2] \\
&= \frac{1}{2}\mathbb{E}[z^2_\alpha + z^2_{\alpha+h} - 2z_\alpha z_{\alpha+h}] \\
&= \frac{1}{2}(\sigma_\alpha^2 + \mu_\alpha^2 + \sigma_{\alpha+h}^2 + \mu^2_{\alpha+h} - 2\mathbb{E}[z_\alpha z_{\alpha+h}])
\end{aligned}
$$

where I used $\sigma^2 = \mathbb{E}[z^2] - \mu^2$. Now, I can substitute $\mathbb{E}[z_\alpha z_{\alpha+h}]$ from the covariance equation:

$$
\begin{aligned}
\gamma(\vec{h}) &= \frac{1}{2}(\sigma_\alpha^2 + \mu_\alpha^2 + \sigma_{\alpha+h}^2 + \mu^2_{\alpha+h} - 2(Cov(\vec{h}) + \mu_\alpha \mu_{\alpha+h})) \\
&= \frac{1}{2}(\sigma_\alpha^2 + \mu_\alpha^2 + \sigma_{\alpha+h}^2 + \mu^2_{\alpha+h} - 2\mu_\alpha \mu_{\alpha+h}) - Cov(\vec{h})
\end{aligned}
$$

Now, if we use the stationarity assumption, $\sigma_\alpha^2 = \sigma_{\alpha+h}^2$ and $\mu_\alpha = \mu_{\alpha+h}$. We then have

$$\gamma(\vec{h}) = \sigma^2 - Cov(\vec{h})$$

## Some notes about variograms

- $\sigma^2$ is called the *Sill*.
- The lag magnitude where $Cov(\vec{h}) = 0$, is called the *Range*.
- Intuitively, when the lag is small, variogram value is small as we are able to get quite a lot of information from the neighbours. As we go further, the information we get is less and the variogram value increases.
- Beyond the range, we can't tell much about the random variable using the information about the values elsewhere.
- When computing experimental variograms, we might see that the values might go beyond the sill, meaning that we are going well beyond the stationarity scale as we are hitting a trend that causes large difference in values. Or this could also happen if we don'thave enough samples for calculating experimental variogram at those lags (unstable computation of expectation).
- We might also see oscillatory variogram. If oscillation is near the sill, it means we have alternating features - still stationarity but alternative across scale.
- Since lag is a vector, we can compute variograms in different directions. In 2D we can have a variogram at different azimuths. If we find different characteristics in different directions, we have an *Anisotropic* behavior.

# Best estimate for minimizing Mean Squared Error (MSE)


Let's consider the problem of estimating the value of the random variable $z$ at a location $\vec{u}$ given the values of random variables $z_i$ at $\vec{u_i}$ where i = 1, 2, 3 ... N.

We want the estimate to be such that the MSE is minimal. It is important to clarify what that means. Since $z$ is a random variable, it can take different values. We want to estimate *one* value $z^*$ such that the MSE for the different values $z$ can take is minimized. At first glance it seems confusing - how do we work with MSE when we don't know the values $z$ can take? But the math simplifies things!

The only information we have in hand that we can use to arrive at the estimate are the values of $z_i$. So let:
$$z^* = g(z_1, z_2 ... z_N) = g(\mathbf{z})$$

The goal is to find $g(\mathbf{z})$ such that:

$$\text{minimize w.r.t $g(\mathbf{z})$} \quad \mathbb{E}[(z - g(\mathbf{z}))^2]$$

When we say minimize the expectation, it was not very trivial to me at first but it means minimize for all possible values of $z$ and $\mathbf{z}$. So the expectation is over the joint distribution.

To use a simplifying trick, we need to use a result from probability and I'll be deriving that first.

## Law of iterated expectation

$$
\begin{aligned}
\mathbb{E}_{XY}[f(X, Y)] &= \int_X \int_Yf(X, Y)P(X, Y)dX dY \\
&= \int_X\int_Yf(X, Y)P(X|Y)P(Y)dXdY \\
&= \int_Y\{\int_Xf(X, Y)P(X|Y)dX\}P(Y)dY \\
&= \int_Y\mathbb{E}_X[f(X, Y) | Y] P(Y)dY \\
&= \mathbb{E}_Y[\mathbb{E}_{X|Y}[f(X, Y)]]
\end{aligned}
$$

Now let's look at the minimization problem:

$$\mathbb{E}_{XY}[(X - g(Y))^2] = \mathbb{E}_Y[\mathbb{E}_{X|Y}[(X - g(Y))^2]]$$

The internal expectation is basically a random variable which is a function of $Y$. Since it is evaluated as expectation of the square of a quantity, its always $\geq 0$. The problem of minimizing the outer expectation of this random variable can be replaced by minimizing the random variable value directly. To derive a generic condition, let $z = X$ and $\mathbf{z} = Y$. Therefore:

$$
\begin{aligned}
\text{minimize w.r.t. $g(Y)$} \quad &\mathbb{E}_{X|Y}[(X-g(Y))^2] \\
= &\mathbb{E}_{X|Y}[X^2] + \mathbb{E}_{X|Y}[g^2(Y)] - 2\mathbb{E}_{X|Y}[Xg(Y)]
\end{aligned}
$$

For a given $Y$, $g(Y)$ is independent of X. Let's call it $c$.

So:

$$
\begin{aligned}
\text{minimize w.r.t $c$} \quad &\mathbb{E}_{X|Y}[X^2] + c^2 -2c\mathbb{E}_{X|Y}[X] \\
&=> \\
\frac{\partial}{\partial c} &= 2c - 2\mathbb{E}_{X|Y}[X] = 0 \\
&=> c = \mathbb{E}_{X|Y}[X]
\end{aligned}
$$

So the estimate that minimizes the MSE error is the *Conditional Expectation*

$$z^* = \mathbb{E}_{z|\mathbf{z}}[z]$$

# Best Linear Estimate - Kriging

## Ordinary Kriging

If we assume that there is a conditional expectation that is linear in $Y$, what should it be like? 

$$z^* = g(\mathbf{z}) = \sum_{i=1}^N w_i z_i$$

The error in our estimate is 

$$Error = z - z^*$$

Our goal is to find $w_i$ such that:

1. The error is unbiased:
$$\mathbb{E}[Error] = 0$$

2. And we minimize the variance of the error.

$$
\begin{aligned}
\sigma^2_E &= \mathbb{E}[Error^2] - (\mathbb{E}[Error])^2 \\
&= \mathbb{E}[Error^2]\\
& = \mathbb{E}[(z - \sum_{i=1}^N w_i z_i)^2]
\end{aligned}
$$

For unbiasedness, 
$$
\begin{aligned}
\mathbb{E}[Error] &= \mathbb{E}[z - \sum_{i=1}^Nw_iz_i]\\
&= \mathbb{E}[z] - \sum_{i=1}^Nw_i\mathbb{E}[z_i] = 0
\end{aligned}
$$

Under stationarity assumption, $\mathbb{E}[z] = \mathbb{E}[z_i] = \mu$

So the constraint becomes 

$$\mu(1 - \sum_{i = 1}^Nw_i) = 0 \implies \sum_{i=1}^Nw_i = 1$$

For minimizing the variance under this constraint, we can add the constraint using Lagrange Multiplier $2\lambda$ to the objective function.

$$
\begin{aligned}
\text{minimize w.r.t $w_i$} \quad &\mathbb{E}[(z - \sum_{i=1}^N w_i z_i)^2] + 2\lambda(1 - \sum_{i=1}^Nw_i)\\
=&\mathbb{E}[z^2 + (\sum_{i=1}^Nw_iz_i)^2 - 2z\sum_{i=1}^Nw_iz_i] + 2\lambda(1 - \sum_{i=1}^Nw_i) \\
=&\mathbb{E}[z^2] + \mathbb{E}[\sum_{i=1}^N\sum_{j=1}^Nw_iw_jz_iz_j] - 2\mathbb{E}[z\sum_{i=1}^Nw_iz_i] +2\lambda(1 - \sum_{i=1}^Nw_i) \\
= & \mathbb{E}[z^2] + \sum_{i=1}^N\sum_{j=1}^Nw_iw_j\mathbb{E}[z_iz_j] - 2\sum_{i=1}^Nw_i\mathbb{E}[zz_i] + 2\lambda(1 - \sum_{i=1}^Nw_i) 
\end{aligned}
$$

To minimize this w.r.t $w_i$, we need to take the partial derivative of this with each of the $w_i$ and $\lambda$, and set it to $0$. 

$$
\begin{aligned}
\frac{\partial{}}{\partial{w_i}} &= 2\sum_{j=1}^Nw_j\mathbb{E}[z_iz_j] - 2\mathbb{E}[zz_i] + 2\mu(1 - \sum_{j=1}^Nw_j) - 2\lambda= 0 \\
&\implies \sum_{j=1}^Nw_j\mathbb{E}[z_iz_j] + \mu(1 - \sum_{j=1}^Nw_j) - \lambda= \mathbb{E}[zz_i]
\end{aligned}
$$


And


$$
\begin{aligned}
\frac{\partial{}}{\partial{\lambda}} &= 2(1 - \sum_{i=1}^Nw_i) = 0 \\
&\implies \sum_{i=1}^Nw_i = 1
\end{aligned}
$$


In matrix notation:

$$
\underbrace{
\begin{bmatrix}
\mathbb{E}[z_1 z_1] & \mathbb{E}[z_1 z_2] &\cdots & \mathbb{E}[z_1 z_N] & -1\\
\vdots & \vdots &\ddots & \vdots & \vdots\\
\mathbb{E}[z_N z_1] & \mathbb{E}[z_N z_2] &\cdots & \mathbb{E}[z_N z_N] & -1 \\
1 & 1 & \cdots & 1 & 0
\end{bmatrix}
}_{(N+1) \times (N+1)}
\underbrace{
\begin{bmatrix}
w_1 \\
\vdots \\
w_N \\
\lambda
\end{bmatrix}
}_{(N+1) \times 1}
=
\underbrace{
\begin{bmatrix}
\mathbb{E}[z z_1] \\
\vdots \\
\mathbb{E}[z z_N] \\
1
\end{bmatrix}
}_{(N+1) \times 1}
$$

We had derived earlier that $Cov(z_iz_j) = \mathbb{E}[z_iz_j] - \mu_i\mu_j$ and under stationarity assumption, $Cov(z_iz_j) = \mathbb{E}[z_iz_j] - \mu^2$

$$
\underbrace{
\begin{bmatrix}
\text{Cov}(z_1, z_1) + \mu^2 & \text{Cov}(z_1, z_2) + \mu^2 & \cdots & \text{Cov}(z_1, z_N) + \mu^2 & -1\\
\text{Cov}(z_2, z_1) + \mu^2 & \text{Cov}(z_2, z_2) + \mu^2 & \cdots & \text{Cov}(z_2, z_N) + \mu^2 & -1\\
\vdots & \vdots & \ddots & \vdots & \vdots\\
\text{Cov}(z_N, z_1) + \mu^2 & \text{Cov}(z_N, z_2) + \mu^2 & \cdots & \text{Cov}(z_N, z_N) + \mu^2 & -1\\
1 & 1 & \cdots & 1 & 0
\end{bmatrix}
}_{(N+1) \times (N+1)}
\underbrace{
\begin{bmatrix}
w_1 \\
w_2 \\
\vdots \\
w_N \\
\lambda
\end{bmatrix}
}_{(N+1) \times 1}
=
\underbrace{
\begin{bmatrix}
\text{Cov}(z, z_1) + \mu^2 \\
\text{Cov}(z, z_2) + \mu^2 \\
\vdots \\
\text{Cov}(z, z_N) + \mu^2 \\
1
\end{bmatrix}
}_{(N+1) \times 1}
$$

The resulting system is called **Ordinary Kriging**.

Solving this system gives us the weights such that

$$\mathbf{C}\mathbf{w} = \mathbf{c}$$

and 

$$\sum_{i=1}^Nw_i = 1$$

where:

$$\mathbf{C} = \underbrace{\begin{bmatrix}
\text{Cov}(z_1, z_1)& \text{Cov}(z_1, z_2) & \cdots & \text{Cov}(z_1, z_N)\\
\text{Cov}(z_2, z_1) & \text{Cov}(z_2, z_2) & \cdots & \text{Cov}(z_2, z_N)\\
\vdots & \vdots & \ddots & \vdots\\
\text{Cov}(z_N, z_1)  & \text{Cov}(z_N, z_2) & \cdots & \text{Cov}(z_N, z_N)\\

\end{bmatrix}}_{N \times N}$$

$$
\mathbf{w} =
\begin{bmatrix}
w_1 \\
\vdots \\
w_N
\end{bmatrix}_{N \times 1}
$$

$$
\mathbf{c} =
\begin{bmatrix}
\text{Cov}(z, z_1)\\
\text{Cov}(z, z_2)\\
\vdots \\
\text{Cov}(z, z_N)
\end{bmatrix}_{N \times 1}
$$

Then the estimate is:

$$z^* = \mathbf{c}^T(\mathbf{C}^{-1})^T\mathbf{z}$$

Moreover, substituting $\mathbf{w}$ in the error variance computation:

$$
\begin{aligned}
\sigma_E^2 &= \mathbb{E}[(z - \mathbf{w}^T\mathbf{z})^2] \\
&= \mathbb{E}[((z - \mathbf{w}^T\mathbf{z})(z - \mathbf{w}^T\mathbf{z})^T] \\
&= \mathbb{E}[z^2 + \mathbf{w}^T\mathbf{z}\mathbf{z}^T\mathbf{w} - 2z\mathbf{w}^T\mathbf{z}]\\
&= \mathbb{E}[z^2] + \mathbf{w}^T\mathbb{E}[\mathbf{z}\mathbf{z}^T]\mathbf{w} - 2\mathbf{w}^T\mathbb{E}[z\mathbf{z}] \\
&= \sigma^2 + \mu^2 + \mathbf{w}^T(\mathbf{C} + \mu^2\mathbf{1}_{N\times N})\mathbf{w} - 2\mathbf{w}^T(\mathbf{c} + \mu^2\mathbf{1}_{N \times 1}) \\
&= \sigma^2 + \mu^2 + \mathbf{w}^T(\mu\mathbf{1}_{N\times N})\mathbf{w} + \mathbf{w}^T\mathbf{C}\mathbf{w} - 2\mathbf{w}^T\mathbf{c} - 2\mathbf{w}^T \mu^2\mathbf{1}_{N \times 1}
\end{aligned}
$$

With the unbiasedness constraint, this simplifies to

$$
\sigma_E^2 = \sigma^2 + \cancel{\mu^2} + \cancel{\mu^2} + \mathbf{w}^T\mathbf{C}\mathbf{w} - 2\mathbf{w}^T\mathbf{c} - \cancel{2\mu^2}
$$

Substituting $\mathbf{w} = \mathbf{C}^{-1}\mathbf{c}$

$$
\begin{aligned}
\sigma_E^2 &= \sigma^2 + \mathbf{c}^T(\mathbf{C}^{-1})^T\cancel{\mathbf{C}\mathbf{C}^{-1}}\mathbf{c} - 2\mathbf{c}^T\mathbf{C}^{-1}\mathbf{c} \\
&=\sigma^2 - \mathbf{c}^T\mathbf{C}^{-1}\mathbf{c}
\end{aligned}
$$

### Positive definitveness of Covariance matrix

If we consider the random variable $z^* = g(\mathbf{z}) = \mathbf{w}^T\mathbf{z}$ for a fixed weight vector,

$$
\begin{aligned}
\mathbb{E}[g(\mathbf{z})] &= \mathbb{E}[\mathbf{w}^T\mathbf{z}] \\
&= \mathbf{w}^T\mathbb{E}[\mathbf{z}] \\
&= \mathbf{w}^T\vec{\mu}
\end{aligned}
$$

$$
\begin{aligned}
Var(g(\mathbf{z})) &= \mathbb{E}[(\mathbf{w}^T\mathbf{z} - \mathbf{w}^T\vec{\mu})^2] \\
&= \mathbb{E}[(\mathbf{w}^T(\mathbf{z}-\vec{\mu})(\mathbf{z}-\vec{\mu})^T\mathbf{w})] \\
&= \mathbf{w}^T\mathbb{E}[\mathbf{z}-\vec{\mu})(\mathbf{z}-\vec{\mu})^T]\mathbf{w} \\
&= \mathbf{w}^T\mathbf{C}\mathbf{w}
\end{aligned}
$$

Since $Var \geq 0$, $\mathbf{C}$ is Positive Semidefinite. But $\mathbf{C}$ also must be invertible for Kriging systems. So $\mathbf{C}$ has to be **Positive Definite**. This is the reason why the theoretical variogram models we use in geostatistics are chosen carefully.

If $\mathbf{C}$ is positive definite, $\mathbf{C}^{-1}$ is also positive definite (since eigen values are just reciprocals). That means, the Kriging Variance $\sigma_E^2$ satisfies:

$$0 \leq \sigma_E^2 \leq \sigma^2$$

The lower equality happens when $z$ is at one of the $z_i$, and the right equality happens when $z$ is at far enough from all $z_i$ and $Cov(z,z_i) = 0$ (or $\gamma = \sigma^2$)

## Simple Kriging

If we know the global mean $\mu$, we can write our estimate $z^*$ as

$$z^* = \mu + \mathbf{w}^T(\mathbf{z}-\vec{\mu})$$

If we check the expectation of the error:

$$
\begin{aligned}
\mathbb{E}[z - (\mu + \mathbf{w}^T(\mathbf{z}-\vec{\mu}))] &= \mathbb{E}[z] - \mathbb{E}[\mu] - \mathbf{w}^T(\mathbb{E}[\mathbf{z}] - \mathbb{E}[\vec{\mu}])\\
&= \mu - \mu - \mathbf{w}^T(\vec{\mu} - \vec{\mu}) \\
&= 0
\end{aligned}
$$

When we know the mean and model the estimate as above, the estimate is inherently unbiased. So there is non constraint on the weights as in ordinary kriging.

Similar to our earlier procedure, lets minimize the variance of the error which in case of unbiased estimate is the MSE.

$$
\begin{aligned}
\sigma^2_E &= \mathbb{E}[(z - \mu - \mathbf{w}^T(\mathbf{z} - \vec{\mu}))^2] \\
&= \mathbb{E}[(z-\mu)^2 + \mathbf{w}^T(\mathbf{z} - \vec{\mu})(\mathbf{z} - \vec{\mu})^T\mathbf{w} - 2\mathbf{w}^T(z-\mu)(\mathbf{z}- \vec{\mu})] \\
&= \mathbb{E}[(z-\mu)^2] + \mathbf{w}^T\mathbb{E}[(\mathbf{z} - \vec{\mu})(\mathbf{z} - \vec{\mu})^T] - 2\mathbf{w}^T\mathbb{E}[(z-\mu)(\mathbf{z}- \vec{\mu})] \\
&= \sigma^2 + \mathbf{w}^T\mathbf{C}\mathbf{w} - 2\mathbf{w}^T\mathbf{c}
\end{aligned}
$$

Taking partial derivatives with $w_i$ and setting to 0, we get

$$\mathbf{C}\mathbf{w} = \mathbf{c}$$

Which is similar to the case in ordinary kriging, but *without* the constraint that weights must add up to 1.

The kriging estimate and variance have same formulation for the solved weights.

$$
\begin{aligned}
z^* &= \mu + \mathbf{c}^T(\mathbf{C}^{-1})^T(\mathbf{z} - \vec{\mu}) \\
\sigma_E^2 &= \sigma^2 -  \mathbf{c}^T\mathbf{C}^{-1}\mathbf{c}
\end{aligned}
$$


# Multi-Gaussian modeling

We usually model the random variable field as a multi gaussian distribution i.e., the joint distribution $f(z_0, z_1, z_2, ... z_N)$ is modeled as:

$$f(z_0, z_1, z_2, ... z_N) = \frac{1}{\sqrt{2\pi|\Sigma|}} exp(-\frac{1}{2})(Z-\vec{\mu})^T\Sigma^{-1}(Z - \vec{\mu})$$

where:

$$Z = \begin{bmatrix}z_0 \\ z_1 \\ \vdots \\z_N\end{bmatrix}_{(N+1) \times 1} \quad \vec{\mu} = \begin{bmatrix}\mu \\\mu \\ \vdots \\ \mu \end{bmatrix}_{(N+1) \times 1}$$

And 

$$\Sigma = \begin{bmatrix} 
C_{00} & C_{01} & \cdots & C_{0N} \\
C_{10} & C_{11} & \cdots & C_{1N} \\
\vdots & \vdots & \ddots & \vdots \\
C_{N0} & C_{N1} & \cdots & C_{NN} \\
\end{bmatrix}$$

Given the joint distribution, the conditional distribution of $z$ given $z_i$ can be derived as follows:

$$
\begin{aligned}
f(z_0 | z_1, z_2, .. z_N) &= \frac{f(z_0, z_1, z_2, .... z_N)}{f(z_1, z_2, ... z_N)} \\
 &= \frac{\frac{1}{\sqrt{2\pi|\Sigma|}} exp(-\frac{1}{2})(Z-\vec{\mu})^T\Sigma^{-1}(Z - \vec{\mu})}{\frac{1}{\sqrt{2\pi|\mathbf{C}|}} exp(-\frac{1}{2})(Z_1-\vec{\mu_1})^T\mathbf{C}^{-1}(Z_1 - \vec{\mu_1})}
\end{aligned}
$$

where:

$$Z_1 = \begin{bmatrix}z_1 \\ \vdots \\z_N\end{bmatrix}_{N \times 1} \quad \vec{\mu_1} = \begin{bmatrix}\mu \\\mu \\ \vdots \\ \mu \end{bmatrix}_{N \times 1}$$

and

$$\mathbf{C} = \begin{bmatrix} 
C_{11} & C_{12} & \cdots & C_{1N} \\
C_{21} & C_{22} & \cdots & C_{2N} \\
\vdots & \vdots & \ddots & \vdots \\
C_{N1} & C_{N2} & \cdots & C_{NN} \\
\end{bmatrix}$$

Using block representation of the joint distribution:

$$Z = \begin{bmatrix}z_0 \\ Z_1\end{bmatrix} \quad \vec{\mu} = \begin{bmatrix} \mu \\ \vec{\mu_1} \end{bmatrix}$$

and

$$\Sigma = \begin{bmatrix} 
C_{00} & \mathbf{c} \\
\mathbf{c}^T & \mathbf{C} \\
\end{bmatrix}$$

I hope you noticed the reuse of notations used in Kriging formulation!

And some "Trust me bro" advanced linear algebra ([Schur Complement](https://www.statlect.com/matrix-algebra/Schur-complement)), the conditional distribution results in another gaussian distribution with

$$\mu_{cond} = \mu + \mathbf{c}^T (\mathbf{C}^{-1})^T(Z_1 - \vec{\mu_1})$$

and 

$$\sigma_{cond}^2 = C_{00} - \mathbf{c}^T\mathbf{C}^{-1}\mathbf{c}$$

Which is exactly the simple kriging estimate and simple kriging variance. So multi-gaussian assumption results in conditional expectation which is linear in observed points. If we know the global mean, we solve the simple kriging. If we don't know the global mean, we may use ordinary kriging.

# Gaussian Simulation
While Kriging gives an estimate, we might be interested in getting multiple realizations and quantify the uncertainty. To do this:

- we traverse the grid in a random path
- at each grid cell, pick the observed data and previously simulated grids within a defined neighbourhood
- solve the kriging system to get the kriging mean and kriging variance
- draw a value from the conditional distribution
- repeat till the entire grid is simulated

The random path prevents artifacts. But now we have a way to get multiple realisations of the underlying multi-gaussian random field.

There are other extensions, like [indicator kriging](https://geostatsguy.github.io/GeostatsPyDemos_Book/GeostatsPy_categorical_indictor_kriging.html), [co-kriging and co-simulation](https://geostatsguy.github.io/GeostatsPyDemos_Book/GeostatsPy_cosimulation.html), which trivially extend what I have derived so far for categorical and multiple quantities respectively.

# Conclusion

Uff, that was quite a journey but I feel satisfied. If you find some logical mistakes, typos or bugs, please reach out to me :) Ciao!