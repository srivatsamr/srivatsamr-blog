---
layout: post
title: Building a Transformer
date: 2026-04-04
description: A visual summary and important notes 
categories: machine-learning
tags: [interpretability, transformers, deep-learning]
bibliography: papers.bib
---

## The Visual Summary of a Transformer

<div id="diagram-container" style="position: relative; width: 100%; height: 600px; border: 1px solid #ccc;">
</div>

<script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>
<script>
fetch("{{ 'assets/img/post/2026-04-04_1.svg' | relative_url }}")
    .then(r => r.text())
    .then(svgText => {
        const container = document.getElementById("diagram-container");
        container.innerHTML = svgText;
        const svgEl = container.querySelector("svg");
        svgEl.style.width = "100%";
        svgEl.style.height = "100%";
        svgPanZoom(svgEl, {
            zoomEnabled: true,
            panEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.5,
            maxZoom: 10,
        });
    });
</script>

## Things I had to think through carefully

### Tokenization of input

The first thing to do for processing strings with our model is to convert the string to a sequence of numbers. A widely used algorithm to do this is the [Byte Pair Encoding](https://huggingface.co/learn/llm-course/chapter6/5) algorithm. The core idea here is:

* If we only use single characters as our vocabulary, the sequences we work with will become quite large and learning the context becomes very difficult.
* If we only use the words in traditional dictionary, we will be restricted to words and miss out representing things like punctuations and emojis. Moreover, it won't be robust to spelling mistakes.

So we use sub-word tokenization. To keep it robust, BPE works directly on the byte representation of strings so that any arbitrary character is represented. The algorithm is quite straight forward. We start with individual characters in the vocabulary and iteratively find the most frequent consecutive pair and add it to the vocabulary. Repeat this until the target vocabulary size is reached. So the encoding is actually dependent on the training data we use.

### Embedding tokens into high-dimensional space

Tokenization assigns an integer to each token. To learn complex contextual semantics, we need more dimensions. So we map each token to a high dimensional vector through a learned look-up map, i.e. given token integer ID, we look-up the vector corresponding to it.

### Positional Embedding

In language tasks, the relative position of tokens plays an important role in understanding the context. For example, "The dog chased the cat" has a completely different meaning than "The cat chased the dog". So along with the embedding look-up, we need to incorporate the positional information before the model churns through the data.

In GPT-2 style, the positional embedding that needs to be added is a learned parameter. Similar to embedding matrix, we need to create a positional embedding look-up but this time return the row corresponding to the index of the token in the sequence.

The learnable positional embedding has a few drawbacks:

1. If we ever get a sequence of length greater than the context length, the model simply fails because indexing will go out of bounds.

2. For training, we need a lot more of the data which sees tokens in different positions of the sequence.

The formulation of a good positional enmbedding is driven by the requirements:

* The positional embedding must be unique for a given position in the sequence - adjacent positions must differ significantly enough for the model to distinguish between them nicely.
* The embedding must be bounded. Large context should not push the embedding components to very large values.
* The difference between embeddings of tokens in two different positions must be a function of their relative distance and not the absolute location.

To this end, [sinusoidal embedding](https://www.ibm.com/think/topics/positional-encoding) uses sines and cosines to embed the position.

I had a couple of questions that might seem trivial but I had to make sure I can reason through:

Q. Why do we need both sines and cosines? Why not only sines?<br>
A. Say we need `d_model` dimensional embedding of a token at location `t`. Something like `[sin(t), sin(t), ... sin(t)]` would not work because same embedding vector can represent two different positions: t and $\pi - t$.

Q. Why not repeat sine and cos then?<br>
A. If we consider embedding like `[sin(t), cos(t), sin(t), cos(t), ... sin(t), cos(t)]`, tokens which are $2\pi$ apart will have same embeddings.

Basically, we want embeddings where short and long term periods are combined to give unique embeddings. Token which are short period apart will have same embedding component in short period sections but differ significantly in the large period sections. Tokens which are long period apart will differ in short period sections and have similar long period sections, thus giving unique embeddings for every token in the sequence satisfying all our requirements.

So the embeddings are done in the form:
$$[sin(\omega_o t), cos(\omega_o t), sin(\omega_1 t), cos(\omega_1 t)... sin(\omega_{d/2}t), cos(\omega_{d/2}t)]$$
where:

$$\omega_k = \frac{1}{10000^{2k/d}} \quad k=0, 1, 2 ... d/2$$

### Residual Stream

A common theme in transformer architecture is that every new bit of information is added to the original input, i.e. each layer computes *Residuals*, and modifies the input incrementally. So once we have the positional embeddings, they are added to the embedding vectors and the result is then passed to the Transformer Model.

Each layer in the transformer modifies the input. The layers only need to learn the modifications. Without residual architecture, each layer has to first learn the Identity function to figure out how to represent the input and then work on adding some information to it

The residual stream therefore works as an information channel.

Another use is that residual architectures allow for deeper layers and prevent vanishing gradient problems.

### Vanishing Gradient, Residual Connections and Layer Norm

$$\mathbf{y}_i = F_i(\mathbf{y}_{i-1}), \quad i = 1, \ldots, N, \quad \mathbf{y}_0 = \mathbf{x}$$

$$\frac{\partial \mathbf{y}_N}{\partial \mathbf{W}_k} = \left(\prod_{i=k+1}^{N} \frac{\partial \mathbf{y}_i}{\partial \mathbf{y}_{i-1}}\right) \frac{\partial \mathbf{y}_k}{\partial \mathbf{W}_k}$$

Each of

$$\frac{\partial \mathbf{y}_i}{\partial \mathbf{y}_{i-1}}$$

is the Jacobian matrix. Often, the singular values of this Jacobian matrix have values $<$ 1, and multiplying several such matrices shrinks the magnitude of the gradient for deep architectures. So the training becomes ineffective - small gradients, no significant updates. To deal with this, we use residual terms:

$$\mathbf{y}_i = \mathbf{y}_{i-1} + F_i(\mathbf{y}_{i-1})$$
  
$$\frac{\partial \mathbf{y}_i}{\partial \mathbf{y}_{i-1}} = \mathbf{I} + \frac{\partial F_i(\mathbf{y}_{i-1})}{\partial \mathbf{y}_{i-1}}$$

$$\frac{\partial \mathbf{y}_N}{\partial \mathbf{W}_k} = \left(\prod_{i=k+1}^{N} \left(\mathbf{I} + \frac{\partial F_i(\mathbf{y}_{i-1})}{\partial \mathbf{y}_{i-1}}\right)\right) \frac{\partial \mathbf{y}_k}{\partial \mathbf{W}_k}$$

So that even if the activation gradients vanish, we have $\frac{\partial \mathbf{y}_k}{\partial \mathbf{W}_k}$. So the learning continues. To also keep the activation gradients from vanishing, we can scale and shift the inputs to the domain of the activation functions where the derivatives are not small.

This is typically done by normalizing the inputs. You take the feature vector, normalize it, scale it and add a bias (both of which are learnable parameters) and then pass it to activation function. In transformers this is done using **LayerNorm**.

### Layer Norm

* Take each feature vector and normalize its components using mean and variance within the feature vector
* Learn a scale and bias term (common)

## Core Architecture

Transformer architecture has two types of layers:

1. Multiple Attention Head Layer
2. Multi-layer Perceptron Layer

These two layers together form an **Attention Block**. Multiple such blocks are stacked sequentially.

### Multiple Attention Head Layer

Given the token embeddings modified by adding the positional embeddings (note that we add positional embeddings and not concatenate. This helps in interpretability and fits nicely into the idea of incremental modifications to the embedding vector), we need to learn how each token effects the other in the context. To this end, we do the following in each attention head:

1. Generate 3 sets of vectors: **Queries**, **Keys** and **Values**
2. Queries ask the question, Key tells which token has the answer and Value is the answer that it returns - Interpetability analogy
3. So we take the input embeddings and multiply with the Query Matrix to get Query Vectors. We multiply the inputs with Key Matrix to get the Key Vectors. Attention scores are nothing but the dot product of each Query with each Key, scaled and softmaxed to give weights that add up to 1.

$$\text{Attention Scores} = softmax(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}})$$
*Why are we scaling with the dimension of query/key space?*

Assume that the components of the query and key vectors, $q_i$ and $k_i$ are i.i.d. With $\mathbb{E}[q_i] = \mathbb{E}[k_i] = 0$ and $\text{Var}[q_i] = \text{Var}[k_i] = 1$.

The dot product is

$$s = \sum_i^{d_k} q_ik_i$$

$\mathbb{E}[q_ik_i] = \mathbb{E}[q_i]\mathbb{E}[k_i] = 0$ and $\text{Var}[q_ik_i] = \mathbb{E}[q_i^2]\mathbb{E}[k_i^2] - (\mathbb{E}[q_ik_i])^2 = 1$

The dot product which is sum of these random numbers therefore has mean of 0 and variance of $d_k$.

If we take softmax of raw dot product, which has variance of $d_k$, some components might have very large value causing almost one-hot result. This reduces the learning capability and loss of information. By scaling with $\sqrt{d_k}$, softmax on result is well behaved.

Since we want auto-regressive behavior, we will have to mask the attention scores of all tokens that come AFTER the query token in the sequence.

Then we create the Value Vectors by multiplying inputs with Value Matrix, and the output of the attention head is the weighted sum of Value Vectors for each input embedding, weighed by the attention scores for that embedding.

The outputs from all the heads are concatenated and projected at the output end into the model dimension space.

### Multi-layer Perceptron Layer

The attention head mechanism is mostly linear. So we need a layer to add non-linearity to the computed value outputs from attention heads. The output of attention head can be seen as the answer to the question posed by the queries. But what to do with this information. That is what MLP encapsulates. It does something (we don't know what) with the information in the attention layer output which is highly non-linear.

### Un-Embedding

At the end of all the blocks, we need to take the outputs and compute the logits corresponding to tokens in the vocabulary.

Now, instead of learning a new parameter matrix, we could have taken the transpose of the embedding matrix. It might seem reasonable at first.

* The outputs are vectors in the embedding model dimension per input token. If we take the dot product of each output vector with all the embedding vectors for the tokens in our vocabulary, we can expect that the one most aligned will have have the higher probability for the next token.
* We have less parameters to train, so more efficient training

But here is the issue. Consider a transformer with no attention layers.

Tied embeddings set $W_U = W_E^T$, so the direct path through the model is:

$$\mathbf{logits} = \mathbf{t} \, W_E W_E^T$$

where each logit $j$ is just a dot product $\vec{v}_i \cdot \vec{v}_j$ between the current token and every vocabulary token.

But dot products are symmetric, so tied weights force:
$$\vec{v}_{\text{Barack}} \cdot \vec{v}_{\text{Obama}} = \vec{v}_{\text{Obama}} \cdot \vec{v}_{\text{Barack}}$$
This means the model would predict "Obama" to follow "Barrack" with the same confidence as "Barrack" to follow "Obama" which is not the case in real life - *Bigram statistics*

Also, the diagonal of $W_E W_E^T$ contains $\|\vec{v}_i\|^2$, which is always the largest dot product by Cauchy-Schwarz. So the direct path is structurally biased toward predicting the current token as the next token.

$W_E$ must simultaneously serve as a good input context vector and a good output scoring vector. These are geometrically different roles so its better to

#### Mitigation

Even with tied weights, MLP$_0$ can learn to break the symmetry. But at sufficient scale, untied weights are worth the parameter cost.

## Loss function

The expected output is the true categorical distribution for the next token which is simply the one-hot encoding of the next token (Probability of 1 for the true token that follows and zero for the rest of the tokens).

The predicted output is the softmax output of the model logits.

The loss function therefore is a measure of how different the predicted probability distribution is compared to the actual one. This is measured using *KL Divergence* and *Cross Entropy*. [Here](https://www.youtube.com/watch?v=KHVR587oW8I) is a cool youtube video explaining these concepts. I've summarized it along with some derivations missing from the video below.

### Surprise

Measure of how unlikely an event is. For an event with probability 1, surprise is 0
For event with probability less than 1, surprise is a positive quantity. *Inverse relation*

We also want surprise to be additive. Say someone predicts the event correctly 3 times. The surprise should be thrice (3x). The probability of this happening is $p^3$.
The function that encapsulates this idea is the logarithmic function. *Logarithmic relation*

$$\text{surprise} \quad h(s) = log(\frac{1}{p_s})$$

### Entropy

The average surprise in the distribution

$$H = \sum_s p_s log(\frac{1}{p_s})$$

The more the entropy, the more *Uncertainty* packed in the distribution.

The true probabilities are needed to compute entropy which is usually not available. We approximate them with model probability $q$.

If the model deviates from the real probability significantly, your surprise when you observe the data will be high. If the model and real are close, you expect the surprise to be low. We quantify this using *Cross Entropy*

### Cross Entropy

Average surprise by observing random variable with real distribution $P$ while assuming it comes from model distribution *Q*

$$H(P, Q) = \sum_s p_s log(\frac{1}{q_s})$$
We get $p_s$ from our observations: How often we see the state
We get $q_s$ from our model

This encapsulates the surprise that you get from believing in the wrong model and the inherent uncertainty in the distribution.

### Cross Entropy $\geq$ Entropy

$$
\begin{aligned}
 \lambda &= H(P, Q) - H(P) \\
 &= \sum_sp_slog(\frac{1}{q_s}) - \sum_sp_slog(\frac{1}{p_s}) \\
 &= \sum_s p_s log(\frac{p_s}{q_s})
\end{aligned}
$$
This is also called the *KL-Divergence*

Using Jensen's inequality which says:

$$\phi(\mathbb{E}[x]) \leq \mathbb{E}[\phi(x)]$$

where $\phi$ is a convex function.

Since logarithm is a concave function, -ve of log is a concave function. We can say:

$$
\begin{aligned}
\lambda &= \sum_s p_s (-log(\frac{q_s}{p_s})) \\
&= \mathbb{E}[-log(\frac{q_s}{p_s})] \\
&\geq -log(\mathbb{E}[\frac{q_s}{p_s}]) \\
\end{aligned}
$$

and

$$
\begin{aligned}
\mathbb{E}[\frac{q_s}{p_s}] &= \sum_sp_s \frac{q_s}{p_s} \\
&= \sum_s q_s \\
&= 1 \quad \text{Sum over all states of a probability distribution}
\end{aligned}
$$

Therefore $\lambda \geq -log(1) \implies \lambda \geq 0$

So Cross-Entropy is always greater than or equal to Entropy

### Cross entropy is asymmetric

$$H(P, Q) \neq H(Q, P)$$
The loss function, where we aim to make the model as close to the true distribution as possible, would be to make the Cross Entropy as close to Entropy as possible. That is we want to minimize the KL Divergence.

Say the model distribution $Q$ is parameterized with $\theta$, our neural network.

$$\text{minimize}_\theta \quad H(P, Q) - H(P)$$
Since P is independent of $\theta$ , this is equivalent to minimizing the cross entropy $H(P, Q)$.

For our auto-regressive transformer model, the model predicts the logits which upon softmax, gives the categorical distribution over the vocabulary per token in the sequence representing the conditional probability of next token

$$q(x_{k+1}| x_0, x_1, x_2, ..., x_k) = \mathbf{q}_{1 \times nvocab}$$

The true categorical distribution
$$p(x_{k+1}|x_0, x_1, x_2,..., x_k) = \mathbf{p}_{1 \times nvocab} $$

where $p[i] = 1$ for $i = index(x_{k+1})$ and $0$ elsewhere

$$
\begin{aligned}
H(P, Q) &= -\sum_{i}^{vocab}\mathbf{p}[i]*log(\mathbf{q}[i]) \\
&= -log(q[index(x_{k+1})])
\end{aligned}
$$

## Conclusion

We now have a model architecture and the loss function to train it. Since transformers predict the conditional probability distribution as each position in the sequence, it is very efficient to train them. At inference time however, we only need the logits corresponding to the last token in the sequence to predict the next token.

We therefore have the basic components and the next step would be to train this model.

See you in the next one.

## References

{% bibliography --cited %}
