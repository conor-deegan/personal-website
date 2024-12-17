---
title: "Quantum Computing & Superposition"
author: "Conor Deegan"
postNum: 21
type: "post"
---

So far, we’ve seen that Shor’s algorithm transforms hard classical problems like factoring large integers (cracking RSA) and finding discrete logarithms (breaking ECDLP) into something a quantum computer can handle. The secret sauce here isn’t brute force magic; it’s the ability to leverage the hidden structure within these number-theoretic problems. But there’s another key ingredient: **quantum superposition**. This phenomenon is what makes quantum computation fundamentally different from classical computation, and it’s why we can hope to do period-finding exponentially faster than any classical method.
\
\
On a classical computer, if you want to find a period in a sequence like $x^1 \mod N, x^2 \mod N, x^3 \mod N$ and so on you have to plod through it step by step. If $N$ is huge — say, a few thousand bits long — this sequence can be astronomically large.
\
\
A quantum computer, on the other hand, doesn’t do this one-by-one. Instead, it uses superposition to represent all these sequence elements simultaneously. This global perspective is what allows the quantum algorithm to detect periodicity without checking each element individually.
\
\
In a classical world, something is always in one definite state. A classical bit is either 0 or 1, never both. A classical program that computes $x^3 \mod N$ just holds the number $x^3 \mod N$ at the end — a single, definite value.
\
\
Quantum states rewrite these rules. A qubit can be in a superposition of the states $|0\rangle$ and $|1\rangle$:
\
\
$|\Psi\rangle = \alpha |0\rangle + \beta |1\rangle$
\
\
Here, $\alpha$ and $\beta$ are complex numbers called amplitudes. They’re not just probabilities; they can interfere with each other like waves. Their magnitudes squared sum to 1, ensuring that if you measure the qubit, you’ll find it in either $|0\rangle$ or $|1\rangle$, with probabilities $|\alpha|^2$ and $|\beta|^2$, respectively. Before measurement, the qubit is genuinely in both states at once — not just unknown, but simultaneously existing in a combination of possibilities.
\
\
A single qubit can hold a superposition of just two states, $|0\rangle$ and $|1\rangle$. That might not seem so special. But what if you have 2 qubits? Now, you have four possible basis states: $|00\rangle, |01\rangle, |10\rangle, |11\rangle$, and the qubits can be in a superposition of all four at once. With 3 qubits, you get 8 possible states, this means that the state $|\Psi\rangle$ holds all possible combinations of of the 3 qubits ($2^n = 8$ states) simultaneously. With $n$ qubits, you get $2^n$ possible states, all simultaneously present in one quantum state:
\
\
$|\Psi\rangle = \sum_{i=0}^{2^n-1} \alpha_i |i\rangle$
\
\
This is exponential growth: each additional qubit doubles the number of states you can represent. After just a few dozen qubits, you’re exploring spaces that have billions of dimensions — far more than any classical computer could manage in a straightforward way.
\
\
Shor’s algorithm needs to find a hidden period in a massive sequence of integers mod $N$. Classically, you’d have to compute each  $x^j \mod N$  one at a time. A quantum computer can, in principle, set up a superposition that simultaneously encodes all these values. How?
\
\
It starts by preparing a set of qubits that represent a huge range of exponents $j$. Because of the exponential scaling, using $n$ qubits for an $n$-bit $N$ allows you to hold $2^n$ different values of $j$ at once. Then, through controlled operations, it calculates  $x^j \mod N$  for each $j$ in parallel — not by doing one after another, but by exploiting the quantum hardware’s ability to perform many computations simultaneously in superposition.
\
\
From this gargantuan superposition, the algorithm applies the quantum fourier transform to tease out the period. The reason this works is subtle: the QFT lets you detect patterns in the amplitudes of this massively entangled state. Without superposition, you’d just have a long list of numbers. With superposition and the QFT, you get interference patterns that highlight the period in a single shot.
\
\
A critical insight is that if you want to factor an $n$-bit number $N$, you need on the order of $n$ qubits. That’s because $n$ qubits can represent $2^n$ states, which can encode all the necessary values of $j$ for the period-finding step. You don’t need a qubit for every possible candidate factor; you just need enough qubits to represent indices up to roughly the size of $N$. Since $N$ itself is about $2^n$ in size, you get this exponential capacity with only a linear number of qubits. This is one of the key insights that make quantum factoring feasible in principle.
\
\
For example, if $N$ has 2048 bits, you need on the order of a few thousand qubits (not billions!) to run Shor’s algorithm. This doesn’t mean it’s easy to build such a machine — engineering challenges, decoherence, and the need for error correction are massive hurdles — but the scaling works out in a way that’s theoretically achievable in the long run.
\
\
It’s important to stress that quantum superposition doesn’t let you “try all answers and instantly pick the right one.” If you just measure a superposition blindly, you’ll get a random outcome. The real power comes from the careful construction of the quantum circuit and the use of interference. By arranging the computation so that all the “wrong” answers cancel out, you tilt the odds dramatically toward measuring the information you need — like the period that reveals the factors of $N$.
\
\
In that sense, superposition is a resource, a kind of fuel that powers the carefully orchestrated computations in Shor’s algorithm. You still have to build the right algorithmic structure, and you still have to apply the QFT and other operations just right. But given that structure, superposition provides the parallelism and interference effects that make quantum algorithms like Shor’s possible.