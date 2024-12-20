---
title: "Quantum Computing & Shor's DLP Algorithm"
author: "Conor Deegan"
postNum: 19
type: "post"
---

Read [this post](https://conordeegan.dev/posts/qc-shors-factoring) first.
\
\
Alright, let’s say you don’t just want to break RSA by factoring large integers. You want to solve another famously hard problem in cryptography: the Discrete Logarithm Problem (DLP). In a nutshell, the DLP asks you to find an exponent. More concretely, someone gives you a large prime number $p$, along with two numbers $g$ and $h$, both chosen between $1$ and $p-1$. They promise that $h$ is actually $g$ raised to some secret power $x$, all modulo $p$. In other words, $h ≡ g^x \mod p$. Your task is to figure out $x$ — the “discrete logarithm” of $h$ base $g$. This problem is believed to be super-hard for classical computers, forming the backbone of crypto systems like Diffie-Hellman key exchange and certain elliptic-curve schemes.
\
\
Now, similarly to factoring, quantum computing doesn’t magically solve all problems by "trying all possibilities at once". The same disclaimer applies here. A quantum computer can’t just brute-force the solution $x$ by checking every possible exponent from 1 up to something astronomically large, then instantly pick out the right one. If you tried that, and then looked at the quantum state, you’d end up with a random guess for $x$ — about as helpful as throwing darts in the dark.
\
\
So if we hope to solve the DLP using a quantum computer, we’re going to need to exploit the underlying mathematical structure of the problem. Just like factoring, the discrete log problem isn’t just some random puzzle. It’s deeply tied to the behavior of powers taken modulo a prime number, and this structure is exactly what a quantum algorithm like Shor’s can latch onto.
\
\
Let’s dig into what that structure looks like. Consider the setup again: we have a prime $p$, a “generator” $g$ (which, for this discussion, you can think of as a number that, when raised to various powers mod $p$, can produce a large range of possible residues), and a number $h$. We know $h = g^x \mod p$ for some secret exponent $x$. Now, consider the sequence:
\
\
$g^0 \mod p, g^1 \mod p, g^2 \mod p, g^3 \mod p$, and so on.
\
\
If $g$ is truly a “generator” in the mathematical sense, then as you keep increasing the exponent, you’ll eventually cycle through all nonzero residues mod $p$. In fact, the sequence of powers of $g$ will have a certain period related to $p-1$ (this period is called the “order” of $g \mod p$). For a good choice of $g$, this period should be $p-1$ itself, meaning that $g^{p-1} ≡ 1 \mod p$, and no smaller positive power of $g$ returns you to 1. That’s a fancy way of saying that if you imagine counting powers of $g$ on a circular number line mod $p$, you’ll loop all the way around at exactly $p-1$ steps.
\
\
Alright, so if $g^{p-1} ≡ 1 \mod p$, then we know the sequence of powers repeats with period $p-1$. Where does $h$ fit in? Well, we know $h = g^x \mod p$ for some unknown $x$. If we could somehow access a related sequence that encodes the value of $x$ within its period, we’d be in good shape.
\
\
The key trick in the quantum algorithm for discrete log is very similar to the one used for factoring: we reduce the DLP to a problem of finding a period. But how exactly do we construct a function whose period reveals $x$?
\
\
To understand this, let’s think step-by-step. We start with what we know: $h = g^x \mod p$. We want a function $F(a)$ that takes an integer $a$ and gives us some result that, when we look at it across different values of $a$, has a regular pattern repeating every certain number of steps. Ideally, that period will depend on $x$.
\
\
A naive idea might be to compute $g^a \mod p$. This by itself creates a periodic sequence with period $p-1$, but it doesn’t directly tell us anything about $x$. And then to compute $h^a \mod p$ as well. Since $h = g^x$, this is effectively $(g^x)^a = g^{ax} \mod p$. Now we have two sequences: one is $g^a$, and the other is $g^{ax}$.
\
\
Together, $(g^a, h^a)$ gives us a pair of values that depend on both $a$ and $x$. But just having a pair isn’t enough; we need a clever construction that isolates the information about $x$ into a nice periodic form.
\
\
One approach, inspired by Shor’s algorithm for factoring, is to combine these exponentials in a way that produces a “hidden” period. For example, consider forming a ratio of powers that somehow cancels out most variables except those related directly to $x$. One might try something like:
\
\
$F(a) = g^a \cdot h^{-a} \mod p$
\
\
If we substitute $h = g^x$, we get:
\
\
$F(a) = g^a \cdot (g^x)^{-a} = g^a \cdot g^{-ax} = g^{a - ax} = g^{a(1 - x)} \mod p.$
\
\
At first glance, this might look like it gives us a neat periodicity in terms of $x$. But there’s a subtlety: if we just pick this function directly, we end up with something that might be too simple or not aligned with how the hidden subgroup framework works in practice. The ratio $g^{a(1-x)}$ isn’t directly what’s used, because it doesn’t straightforwardly solve our problem. We need a function that fits into the well-studied paradigm known as the “hidden subgroup problem” (HSP).
\
\
In the HSP setting, we construct a function from a known group (here, integers mod $p-1$ or a related group) into a larger structure, such that the subgroup we’re trying to find (which encodes $x$) corresponds to the set of $a$ values that map to a particular pattern. By carefully choosing how these exponentials are combined — for instance, creating a function that maps $a$ to a pair $(g^a \mod p, h^a \mod p)$ and then using that pair in a way that the quantum algorithm can exploit — we arrange it so that the “hidden” period of the function directly relates to $x$.
\
\
The details of how exactly Shor’s algorithm sets up this function can get intricate. It draws on group theory to ensure that the periodicity in the chosen function corresponds exactly to the discrete logarithm. The end goal is that, once we have defined the right function, its period will be linked to $x$. Just like with factoring, once we identify that period using a quantum Fourier transform, we can back out the value of $x$.
\
\
Once we’ve defined the right kind of periodic function, we face the same obstacle as before: the period could be huge — as large as $p-1$ — and $p$ might have hundreds or thousands of digits! Finding this period by brute force would be completely impractical on an ordinary computer.
\
\
Enter the quantum computer. Just like in the factoring case, we can create a giant quantum superposition over many possible exponents $a$, and evaluate our chosen function $F(a)$ in superposition. This step — building a big quantum state where each part of the superposition corresponds to $(a, F(a))$ — is critical. And thanks to efficient modular exponentiation by repeated squaring, we can do it fast enough. The goal is that this superposition encapsulates all the information about the periodic structure we’re trying to uncover.
\
\
Now we come to the same magic wand we waved in the factoring problem: the Quantum Fourier Transform (QFT). The QFT is an operation that takes a quantum state encoding a periodic sequence and transforms it into a state whose “peaks” occur at the frequencies (or periods) of that sequence. In other words, the QFT is able to pick out the underlying beat from hundreds of thousands of drummers playing different styles of music, but all keeping the same underlying rhythm. The QFT will single out the true period that all are tapping to.
\
\
Here, we’re doing the same thing: we have a pattern that repeats every so often, and we want to find out exactly how long that cycle is. That length — that period — will give us the discrete log. The QFT causes constructive interference for the correct period (the one that aligns with $x$) and destructive interference for all the wrong periods.
\
\
To put it another, more mathematical way: quantum mechanics allows amplitudes (which you can think of as tiny arrow-like quantities in the complex plane) to point in different directions. For the correct period, all these little arrows line up and reinforce each other. For any incorrect guess at the period, the arrows point in every which way, canceling each other out. When you measure the final quantum state after performing the QFT, you’re overwhelmingly likely to see the correct period encoded in the outcome. With that period in hand, you can “peel away” the disguise and find the discrete log $x$.
\
\
So what have we achieved? By applying the quantum Fourier transform to a superposition carefully constructed from $g$, $h$, and $p$, we’ve managed to solve a problem that classical computers find incredibly hard. This is the essence of how Shor’s algorithm (originally famous for factoring) also solves the Discrete Logarithm Problem. It’s the same high-level approach: reduce your cryptographic challenge to finding a period, then let the quantum computer’s ability to perform QFT-based interference extract that period in polynomial time.
\
\
And just like in factoring, the reason this quantum magic works is that we’re not trying to isolate a single special needle from an enormous haystack. Instead, we’re identifying a global property — a repeating pattern shared by all elements of a giant quantum superposition. Quantum mechanics doesn’t let you “see” all exponentially many possibilities at once in a naive way, but it does let you exploit global patterns in a way no classical method can. That’s what cracks problems like factoring and discrete logarithms wide open for a quantum computer.
\
\
Of course, these results hinge on having a large-scale, fault-tolerant quantum computer, something we’re still working hard to build. But if and when we do, today’s cryptographic assumptions, including the hardness of the Discrete Logarithm Problem, will be toppled.