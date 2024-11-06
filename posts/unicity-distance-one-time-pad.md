---
title: "Unicity Distance (OTP)"
author: "Conor Deegan"
postNum: 7
type: "post"
---

### Introduction

This post will discuss the concept of unicity distance in cryptography and briefly introduce the one-time pad cipher and it’s relation to unicity distance. An implementation of the one-time pad cipher in Python is also included.

### Unicity Distance

Originally defined by [Claude Shannon](https://en.wikipedia.org/wiki/Claude_Shannon) in his 1949 paper "[Communication Theory of Secrecy Systems](https://en.wikipedia.org/wiki/Communication_Theory_of_Secrecy_Systems)”, unicity distance is the length of [ciphertext](https://en.wikipedia.org/wiki/Ciphertext) needed to break the cipher by reducing the number of spurious keys to zero in a [brute force attack](https://en.wikipedia.org/wiki/Brute_force_attack).

### Spurious keys

A spurious key is a key which decrypts the ciphertext to meaningful, yet incorrect, plaintext.

For example take the ciphertext “FHTSNA”.

The key $key_a$ may decrypt this to incoherent plaintext such as “VBSAQU”. Thus $key_a$ is not a possible key as it does not decrypt to meaningful plaintext.

However, $key_b$ may decrypt this ciphertext to “ATTACK” and $key_c$ may decrypt this ciphertext to “RESCUE”.

Thus, without more ciphertext we cannot determine the correct key.

If more ciphertext is intercepted; “FHTSNA TXC”, we can test both $key_b$ and $key_c$ to see if we can determine the correct key:

Ciphertext decrypted with $key_b$: “ATTACK NOW”

Ciphertext decrypted with $key_c$: “RESCUE TGX”

With this additional ciphertext we can now discard $key_c$ as a possible key.

The unicity distance gives us the minimum about of ciphertext required before it has only one possible decryption.

### Key length

In the example above, there are a possible $n = 26^{5}$ possible keys if we assume a key must be made up of 5 upper-case English letters. The majority of these keys will not decrypt to any meaningful plaintext and can be discarded. However, $m$ of these keys will decrypt to meaningful plaintext but only one will be the correct key.

It is likely that $m$ is much smaller than $n$ and since $\frac{m}{n}$ gets smaller as the length of the ciphertext increases, there will be some length of ciphertext, $l$, which will reduce the number of spurious keys to zero (i.e reduce $m$ to 1). $l$ is the unicity distance.

### Redundancy

The unicity distance $n_0$ can be formally defined as:

$n_0 = \frac{\log_2 \lvert K \rvert}{\rho}$

Where $n_0$ is the unicity distance, $\lvert K \rvert$ is the number of possible keys, and $\rho$ is the [redundancy](https://en.wikipedia.org/wiki/Redundancy_(linguistics)) of the plaintext.

For example, the redundancy of the English language has been found to be 3.2 bits. If we consider a simple Caesar cipher (25 possible keys), we can compute the unicity distance for this cipher as:

$n_0 = \frac{\log_2 25}{3.2} = 1.45120 \approx 2$

Meaning that with a ciphertext length of just 2 characters, an attacker have enough information to reduce the number of spurious keys to zero in a brute force attack. This is intuituve given how a Caesar cipher functions.

### Security

Let $n$ be the length of the ciphertext.

If $n < n_0$ we have an unconditionally secure system as there will exist spurious keys and there is not enough information for an attacker to determine the correct key.

If $n \ge n_0$ we have an insecure system as there are no false keys and an attacker has enough information to determine the correct key in a brute force attack.

Generally speaking, in a secure cipher $n_0$ should be as large as possible.

### One-time pad

###

The [One-time pad](https://en.wikipedia.org/wiki/One-time_pad) (OTP) is a perfect cipher that cannot be cracked. In the OTP the plaintext and key are combined (XOR in binary) to produce the ciphertext. In the OTP cipher, the key must be:

- Completely random (uniformly distributed in the set of all possible keys and independent of the plaintext)
- At least as long as the plaintext message
- Secret
- Never reused

As noted by Claude Shannon, given the key is completely random and always at least the length of the plaintext, the unicity distance of this cipher will always be longer than the length of the ciphertext. Meaning there will always exist spurious keys and the cipher can never be cracked.

An example of the OTP in Python can be found [here](https://github.com/conor-deegan/sandbox/tree/main/one-time-pad).

In practice, this cipher is not feasible to use due to the difficultly in generating a truly random key which is at least the length of the plaintext. Imagine the scenario of encrypting a 10GB file - we would need a 10GB truly random key.

### References

*Note: these references exclude hyperlinks included throughout the document.*

1. [Unicity Distance](https://en.wikipedia.org/wiki/Unicity_distance)

*Disclaimer: Do not use this to secure any information. This code is purely to be used for educational purposes only.*
