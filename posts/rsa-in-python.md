---
title: "RSA"
author: "Conor Deegan"
postNum: 6
type: "post"
---

### Introduction

This post will not focus on the history of RSA or why it is used. There are plenty of resources available that explain this already - [see here](https://en.wikipedia.org/wiki/RSA_(cryptosystem)). Instead we will focus on some of the mathematics around how RSA is implemented, why it is secure, and how it can be implemented in Python.

### How it works

RSA is a [public-key cryptosystem]([https://en.wikipedia.org/wiki/Public-key_cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography)) based on exponentiation modulo a composite prime $n$ such that $n = p.q$, where $p$ and $q$ are large primes.

The protocol is as follows:

1. Bob selects two large primes $p$ and $q$ - these are kept private.
2. He computes the modulus $n = p.q$ - this is made public.
3. Bob selects a public key $e$ such that $e$ is coprime with $\Phi(n)$*. Where $\Phi(n)$ is computed with either the Totient function or the Carmichael function.
4. Bob computes a private key $d$ such that $e.d \equiv 1 \mod \Phi(n)$.

We will now look at each step in more detail.

* Note: two numbers, $a$ and $b$ are coprime if $gcd(a,b)=1$.

### Step 1 - Generating large primes

This first step in RSA is to generate sufficiently large primes, $p$ and $q$. In order for $n$ to be 2,048-bits, $p$ and $q$ must both be $\approx$ 1,024-bits each.

A common way to generate a large prime $p$ is as follows:

1. Create $\sigma$, a random $n$-bit number (e.g 1,024-bits). It should be the case that $\sigma$ is odd as no prime number, with the exception of 2, is even. Thus we select a decimal number in the range $2^{n-1} + 1$ up to $2^n -1$. We call $\sigma$ the prime candidate.
2. We can then perform a low-level [primality test](https://en.wikipedia.org/wiki/Primality_test#Simple_methods) by checking if $\sigma$ is divisible by any of the first $k$ prime numbers (this list of primes is precomputed). The value of $k$ should be as large as possible. If $\sigma$ is divisible by any of these pre-computed primes, the prime candidate is composite and we return to step 1.
3. Once we find a $\sigma$ that passes this low-level primality test, we can perform a high-level primality test known as the [Miller–Rabin primality test](https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test). In the case of testing for primality of extremely large numbers, such as those used in RSA, a deterministic method is not feasible in terms of compute power. Instead, the Miller–Rabin primality test uses a probabilistic approach. It tests a prime candidate ($\sigma$) for primality many times. Each time the test passes the candidate has a 75% chance of being prime. By performing many iterations, we can increase the probability that such a candidate is in fact prime. Enough tests should be performed such that the probability of the prime candidate being composite is less than $\frac{1}{2^{128}}$. If any of the iterations fail, we return to step 1.

With the above algorithm we can now generate $p$ and $q$ which are both 1,024-bit primes.

### Step 2 - Compute the modulus $n$

Once we have values for $p$ and $q$, it is trivial to compute $n = p.q$.

### Step 3 - Select a public key $e$

We must now select a public key $e$ such that $e$ is co-prime with $\Phi(n)$.

$\Phi(n)$ can be calculated using either [Euler’s Totient function]([https://en.wikipedia.org/wiki/Euler's_totient_function](https://en.wikipedia.org/wiki/Euler%27s_totient_function)) or the [Carmichael function]([https://en.wikipedia.org/wiki/Carmichael_function](https://en.wikipedia.org/wiki/Carmichael_function)).

- Using Euler’s Totient function $\Phi(n) = (p-1)(q-1)$
- Using the Carmichael function $\Phi(n) = lcm(p-1,q-1)$

Once $\Phi(n)$ is computed, a public key $e$ should be chosen such that $e$ and $\Phi(n)$ are co-prime. Although the value of $e$ can be any value provided $gcd(e,\Phi(n)) = 1$, typically $e$ is set to 65,537. 65,537 is a [Fermat Prime]([https://en.wikipedia.org/wiki/Fermat_number). This is useful as given it is prime, it is guaranteed to be co-prime with $\Phi(n)$ and it is also very easy to calculate modular exponents that are Fermat Numbers (as in the case of encryption in RSA).

### Step 4 - Compute a private key $d$

The private key $d$ is calculated such that $e.d \equiv 1 \mod \Phi(n)$. This is done by using the [Extended Euclidean algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm).

The Extended Euclidean algorithm calculates $x$ and $y$ such that $ax + by = gcd(a,b)$. A simple online calculator can be found [here](https://www.extendedeuclideanalgorithm.com/calculator).

We can now look at why this works. If we let $a = e$ and $b = \Phi(n)$ we can rewrite the above as:

$ex + \Phi(n)y = gcd(e,\Phi(n))$

We know that $e$ and $\Phi(n)$ are co-prime and thus $gcd(e,\Phi(n)) = 1$. Therefore we can rewrite this as:

$ex + \Phi(n)y = 1$

We then take this modulo $\Phi(n)$ to get:

$ex + \Phi(n)y \equiv 1 \mod \Phi(n)$

The value of $y$ does not matter as it will be eliminated modulo $\Phi(n)$. Thus we are left with:

$ex \equiv 1 \mod \Phi(n)$

Here $x$ is equal to our private key $d$.

We have now computed all the values required to use RSA for encryption and decryption.

### Encryption and Decryption

To encrypt data, the message is broken down into blocks such that each block is smaller than the modulus $n$. Note if $p$ and $q$ are both 1024-bit primes, $n$ will be 2048-bits. Meaning that each block must be shorter than 2048-bits to avoid data loss.

To encrypt data:

- Bob makes his public key $e$ and the modulus $n$ public.
- Alice encrypts plaintext $l$ such that $c = l^e \mod n$ where $c$ is the resulting ciphertext.

To decrypt data:

- Bob, the holder of the private key $d$, can now decrypt $c$ by $l = c^d \mod n$ where $l$ is the recovered plaintext.

Note: RSA is not typically used to encrypt large amounts of data. Instead it is used as part of a  [key exchange]([https://en.wikipedia.org/wiki/Key_exchange](https://en.wikipedia.org/wiki/Key_exchange)) protocol so that Alice and Bob can agree upon a shared secret for use with a symmetric cipher such as [AES]([https://en.wikipedia.org/wiki/Advanced_Encryption_Standard](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)). This is because RSA is not as performant as some symmetric ciphers which leverage bitwise operations rather than more complex mathematical operations seen here.

### Security in RSA

Brute force approach:

Given $e$ and $n$ are public, if Eve was to know some ciphertext $c$, she could try all plaintext options $l$ until she finds an $l$ that satisfies $c = l^e \mod n$. However, this not feasible when $n$ is large.

Breaking the cipher:

If Eve was to learn any one of $p$, $q$, $\Phi(n)$, or $d$ she can fully break the cipher.

If she learns $p$ or $q$, it is trivial to calculate the other values given $n = p.q$ and $n$ is public. From here she can workout all remaining values.

If she learns $\Phi(n)$, she can solve for $p$ and $q$ given she knows the function $\Phi(n)$ and that $n = p.q$. This is a case of solving for two unknowns with two equations.

If she learns $d$, the private key, she can decrypt any chipertext easily.

If we assume that a brute force approach is not feasible and that all private values remain private, then the security of RSA relies on Eve being able to factorise $n$ into $p$ and $q$. This is known as prime factorisation.

### Prime factorisation

The best attack for Eve is to factor $n$ into $p$ and $q$. However, there is no efficient, [non-quantum](https://en.wikipedia.org/wiki/Quantum_computer) integer factorisation algorithm known when $p$ and $q$ are sufficiently large. Even the fastest prime factorisation algorithms on the fastest computers will take so much time to make the search impractical. However, knowing $p$ and $q$ makes computing $n = p.q$ trivial, this is the [one way function]([https://en.wikipedia.org/wiki/One-way_function](https://en.wikipedia.org/wiki/One-way_function)) used in RSA.

Some algorithms used for prime factorisation include [general number field sieve](https://en.wikipedia.org/wiki/General_number_field_sieve), [the quadratic sieve](https://en.wikipedia.org/wiki/Quadratic_sieve), [Fermat's factorization method](https://en.wikipedia.org/wiki/Fermat%27s_factorization_method), and [Pollard's rho algorithm](https://en.wikipedia.org/wiki/Pollard's_rho_algorithm). As it stands, for large RSA key sizes (in excess of 1024-bits) no efficient method for computing the factors is known.

Interestingly, a recent paper by Schnorr [6], controversially claimed that a new factoring method “destroys the RSA cryptosystem”. However, it has subsequently been shown not to be the case [7].

# RSA in Python

A complete implementation of RSA in Python can be found [here](https://github.com/conor-deegan/sandbox/tree/main/rsa-python). The code should be self explanatory given the information above.

One interesting point that I have not discussed is how to compute $b = a^c$ efficiently if $c$ is large. One way to handle this is by using [exponentiation by squaring](https://en.wikipedia.org/wiki/Exponentiation_by_squaring). In the code you will notice on line 41 of `main.py` I compute the ciphertext by raising the plaintext to the power of $e$ directly. This is feasible given $e$ is relatively small. However, on line 45 of `main.py`, I compute the plaintext by using exponentiation by squaring instead as $d$ is too large to compute this directly. Python comes with a built in function to handle this - see [here](https://docs.python.org/2/library/functions.html#pow).

Besides encryption and decryption of data, RSA is also used for [digital signatures](https://en.wikipedia.org/wiki/Digital_signature). I have not gone into much detail about digital signatures as that is for a different post but I have included a full example in the code attached. You will notice that the only difference is that we use the keys in reverse order. I.e you sign a message with your private key and anyone who has a copy of your public key can verify it was you who signed it.

### References

1. [RSA - Wikipedia](https://en.wikipedia.org/wiki/RSA_(cryptosystem))

2. [RSA - calculator](https://www.cs.drexel.edu/~jpopyack/IntroCS/HW/RSAWorksheet.html)

3. [RSA_ Problem](https://en.wikipedia.org/wiki/RSA_problem)

4. [https://coderoasis.com/implementing-rsa-from-scratch-in-python/](https://coderoasis.com/implementing-rsa-from-scratch-in-python/)

5. [Generating large primes](https://www.geeksforgeeks.org/how-to-generate-large-prime-numbers-for-rsa-algorithm)

6. [Fast Factoring Integers by SVP Algorithms - Claus Peter Schnorr](https://eprint.iacr.org/2021/232)

7. [No RSA is not broken](https://www.schneier.com/blog/archives/2021/03/no-rsa-is-not-broken.html)

*Note: these references exclude hyperlinks included throughout the document.*

*Disclaimer: Do not use this to secure any information. This code is purely to be used for educational purposes only.*
