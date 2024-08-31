---
layout: post
title: Learning the basics of quantum computing
categories: learnings quantum
---

I am starting a course on the fundamentals of quantum computing today. The company I work for is offering a boot-camp in quantum computing through [this](https://q-ctrl.com/black-opal) and I thought it would be interesting to explore this field. I am planning to summarize the things I learn here as a way to think about things at least twice which will allow me to understands the concepts fairly well. I aim to explain things in the most simple way possible, with as little maths as I can. I find myself understanding a concept well if I am able to explain in the simplest way possible. So, here we go!

# What is a Qubit?

It is tempting to question the physics and workings of a quantum computer from the get-go, because it sounds very exotic. But I quickly realized that it is very involved and it is better to approach the fundamentals from simple mathematics, physics and computing concepts and question those aspects instead of the actual realization of things in the quantum world. With that said, what is a *Qubit*?

In the digital world, information is represented in *bits* i.e. either a 0 or a 1. It is binary. Quantum information on the other hand is more dense and is represented using a *Qubit*. Instead of saying if a qubit is either 0 or 1, we would say something like: "How much of this is in 0 state and how much in 1 state". In the digital world, if we were to represent a real number, we would represent it with a particular precision (read [this](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)). Let's say we represent a real number using 32 bits. In order to represent a qubit's state, we would require two real numbers. Therefore representing a single qubit would take 64 bits. Now what happens if we have 2 qubits? With two qubits, we have the following four possible states: 00, 01, 10, and 11. To describe how much is in each state, we need four real numbers and thus take $$32 * 2^2 $$ bits. In general, to represent the state of $$n$$ quibits in digital domain, we would need $$32 * 2^n$$ bits. Woah! The memory requirement grows exponentially and it is clear that for 100s of qubits, we would not have enough memory in the world. Therefore, we need hardware that inherently represents quantum information - hence the quantum computer. Apparently, we are now in an area called *noisy intermediate scale quantum* (NISQ) meaning, we are only capable of having small to medium size quantum computers because *noise* doesn't allow us to build bigger onces (whatever that means. We will come back to this later I guess).

# Quantum computer... ?

Quantum computers don't parallelize computations! Apparently, quantum computers are novel because they are able to perform certain computations for certain algorithms in drastically fewer steps that what a classical computer would have taken. How it does this has something to do with encoding data as waves and using the interaction between those waves to compute things. Again, we will come back to this later sometime. Before that, how is a qubit constructed in the real world?

To construct a qubit, we need a system that can exist in 2 states and behaves according to the laws of quantum physics (whatever those may be). The 2 states are usually two different energy states.

1. [**Trapped Ion**](https://www.youtube.com/watch?v=j1SKprQIkyE)
2. [**Neutral Atom**]()
3. [**Color Centres**]()
4. [**Electrons in semiconductor**]()
5. [**Superconducting circuits**]()
6. [**Individual photons**]()