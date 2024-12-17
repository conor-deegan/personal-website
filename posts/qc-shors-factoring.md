---
title: "Quantum Computing & Shor's Factoring Algorithm"
author: "Conor Deegan"
postNum: 18
type: "post"
---

This post is pretty much a rewrite of [this post](https://scottaaronson.blog/?p=208). You should probably just read that post over this post.
\
\
Let’s say someone hands you a giant composite number $N$ — a product of two large primes $p$ and $q$. You know that factoring $N$ into $p$ and $q$ is famously hard. The security of [RSA](https://www.conordeegan.dev/posts/rsa-in-python), one of the most widely used cryptographic systems on the internet, relies on this very hardness. But what if you had a quantum computer at your disposal? Suddenly, the factoring problem transforms from hard to something we can crack in polynomial time with Shor’s algorithm. How does this quantum magic work?
\
\
First, let’s bust a common misconception: quantum computers don’t simply try all possible factors in parallel and then instantly pick out the correct answer. That kind of brute-force guesswork doesn’t do any better on a quantum machine than on a classical one. If you tried to just guess every possible factor in superposition, then looked at the quantum state, you’d end up with a random guess. No help there.
\
\
So what’s the secret? The key insight is that factoring isn’t just a random search problem. There’s deep mathematical structure hidden inside the problem. This structure comes from number theory, and it’s what Shor’s algorithm exploits. More specifically, factoring is related to something called "period-finding".
\
\
Here’s the mathematical gem at the heart of Shor’s approach: consider taking some number x that’s relatively prime to $N$ and look at the sequence of its powers modulo $N$:
\
\
$ x^1 \mod N, x^2 \mod N, x^3 \mod N, x^4 \mod N, $ and so on.
\
\
Aside, When we say that two numbers are *relatively prime*, we mean that their greatest common divisor (gcd) is 1. In other words, aside from the number 1, they don’t share any other factors. For example, 8 and 15 are relatively prime because the only positive integer dividing both is 1. In the context of Shor’s algorithm, if we pick an integer $x$ that is relatively prime to $N$, it means $gcd(x, N) = 1$. This ensures that the powers of $x \mod N$ behave nicely in a mathematical sense: they form a repeating pattern (a cycle or “period”) that can be exploited by the algorithm. If $x$ and $N$ shared a nontrivial factor, the structure would break down, and the method wouldn’t work as intended.
\
\
Okay aside over, This sequence might look like just a jumble of numbers. But here’s the catch: because we’re working in modular arithmetic, this sequence will eventually repeat. In fact, it will settle into a cycle of a certain length, called its “period.” Why does that matter? Because the period of this sequence is directly related to the secret factorization of $N$. If $N = p \times q$, then the length of this repeating pattern divides $(p-1) \times (q-1)$ evenly, and extracting that period can lead you straight to $p$ and $q$.
\
\
But don’t get too excited yet. On a classical computer, finding that period is essentially as hard as factoring itself. Why? Because if you try to find the period by brute force — checking one exponent after another — you’ll be stuck doing an astronomical amount of work. For an RSA-sized $N$, this just isn’t feasible.
\
\
Quantum computing changes the game. Instead of looking at each power $x^j \mod N$ one by one, we use the quantum computer to create a giant superposition of all these possibilities at once. Picture this: we line up a bunch of qubits and cleverly program them so that they simultaneously represent every exponent $j$ and its corresponding value $x^j \mod N$. We don’t just store one value; we store a whole pattern of values all at once, encoded in the amplitudes of our qubits.
\
\
Now, the big question: how do we pluck out the period from this enormous quantum superposition?
\
\
This is where the Quantum Fourier Transform (QFT) comes into play. The QFT is the quantum world’s answer to a magical music tool that can pick out a rhythm from a chaotic jumble of sounds. Without the QFT, you’d have a messy tangle of numbers. With the QFT, you can reveal the hidden periodicity. The QFT lines up the amplitudes in such a way that the "correct" period stands out like a bright signal, while all the wrong guesses cancel out due to interference. It’s as if all the little arrows representing the amplitudes line up and point in the same direction at the period’s "frequency", and point every which way for everything else, canceling each other out.
\
\
When you measure the quantum state after applying the QFT, you get information that leads you straight to the period of the sequence. Once you have that period, classical number theory tools can quickly give you the prime factors $p$ and $q$. Boom! You’ve just done something that’s classically considered extremely hard, in polynomial time.
\
\
To sum it up: Shor’s algorithm takes a seemingly impossible problem (factoring), recasts it in terms of period-finding (a problem with rich internal structure), then uses quantum parallelism and the QFT to find that period exponentially faster than any known classical method. The magic isn’t brute force. It’s about tapping into global, periodic structures encoded in a giant superposition, and using quantum interference to reveal that structure efficiently.
\
\
Of course, all of this depends on having a large-scale, fault-tolerant quantum computer. We’re still working on that. But if we build one, the cryptographic foundations of our digital world — including RSA — would need to be dramatically rethought.