---
title: "Cryptographic Hash Functions"
author: "Conor Deegan"
date: "03-22"
postNum: 1
twitterPostTitle: "Cryptographic Hash Functions - Conor Deegan"
twitterPostDescription: "An introduction to Cryptographic Hash Functions for use in Web3"
twitterPostImage: "https://conordeegan.dev/cryptographic-hash-function-share-image.png"
categories: ['cryptography', 'ethereum']
---

### Introduction

The purpose of this article is to introduce cryptographic hash functions.

Generally speaking a hash function is any function which can be used to map data of any size and type to a fixed sized integer. These values are then typically used as an index in a fixed size table called a hash table which can store and retrieve data in nearly constant time. Examples include dictionaries in Python, hashes in Ruby, and objects in Javascript. Hashes and hash tables used for this purpose are outside the scope of this article but can be read more about [here](https://en.wikipedia.org/wiki/Hash_function) and [here](https://en.wikipedia.org/wiki/Hash_table). 

The main concept for moving forward is that we can take any type of data of any length and use a hash function to map that data to a fixed sized integer.

An example of a hash function using a popular algorithm called [SHA-256](https://en.wikipedia.org/wiki/SHA-2) is shown below.

```
sha256('conor deegan') => 0x5682143fca595e8ff8f62f91aafbd3c43dfc20fa87d3a33e7bae49ed5236701a
```

The result of this hash function is a 256-bit integer.

### Cryptographic Hash Functions

A cryptographic hash function is similar to a regular hash function with some specific requirements.

*Note some of these requirements are also requirements for non-cryptographic hash functions.*

Although in-depth use cases of cryptographic hash functions are outside the scope of this post, in order to motivate some of these requirements it's important to outline a simplistic use case. 

Storing users passwords in plaintext can lead to massive security breaches if access to the database they are stored in becomes compromised. A hash of a users password should be stored instead. Authenticating a user remains trivial, simply hash the password presented by the user and compare the result with the stored hash in the database. If the hashes match we can be sure that the user has presented the correct password (for reasons we will discuss). If access to the database was to become compromised, leaking the hashed passwords is less of a concern than leaking a users plaintext password.

### One-way function

A cryptographic hash function should be a [one-way function](https://en.wikipedia.org/wiki/One-way_function). Meaning that once a message has been hashed it should be [computationally hard](https://en.wikipedia.org/wiki/Computational_hardness_assumption) to reverse the hash back to the original message.

I.e given a hash value `h`, it should be difficult to find any message `m` such that `h = hash(m)`.

Hash functions that lack this property are susceptible to what are known as [preimage attacks](https://en.wikipedia.org/wiki/Preimage_attack).

A preimage attack is an attack on a cryptographic hash function which tries to find a message for a given hash value (i.e reverse the one way function). As such, cryptographic hash functions should ensure that it is computationally infeasible to find any message given a hash output, or at least that the fastest way to calculate the message is with a brute force search of all possible inputs to see if they produce the correct hash. In terms of our simple example, this would mean that if Eve got her hands on a users password hash, in order for Eve to work out the users password she would be required to try all possible passwords to see if they produce the same hash value.

One important aspect of a hashing algorithm is the length of the hash it maps to. For instance, the SHA-256 hashing algorithm used above returned a 256-bit hash.   Knowing the length of the hash the function returns is important as it allows us to understand how difficult a brute force attack would be. For an `n-bit` hash the time complexity of a brute force search is `2^n`. This directly relates the security of a hashing algorithm with the length of the hash it produces.  As it stands, a value for `n` greater than or equal to 128-bits is considered secure in terms of a brute force attack - the assumption here that quantum computers are still a few decades away!

It's important to highlight that the resistance to a preimage attack on a well-designed cryptographic hash function assumes that the set of possible inputs is far too large to perform a brute force attack. This is not always the case and if an attacker knows that the given hash has been generated from a smaller subset of possible inputs a brute force search may be possible. Hacking password hashes is a good example of this as people tend to choose short predictable passwords making a brute force search feasible.

### Collision resistant

A cryptographic hash function should ensure that it is computationally infeasible to find two different messages that when hashed result in the same hash value.

I.e given a message `m1` it should be hard to find a different message `m2` such that the hash of `m1` and `m2` are the same provided `m1` ≠ `m2`.

However, given a hash function can take data of any size and produces a fixed sized integer, there are more possible inputs than outputs by definition. As per the [pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle), there must exist different input messages which result in the same hash - i.e there must be collisions. The hash function should make it very difficult to find these collisions.

An attack on a cryptographic hash function which tries to find two messages that result in the same hash is known as a second-preimage attack. In terms of our use case, if a cryptographic hash function was susceptible to a second-preimage attack it would mean that Eve could potentially find an entirely different password than the users password but would be granted access as both passwords result in the same hash.

The [birthday paradox](https://en.wikipedia.org/wiki/Birthday_paradox) places an upper bound on collision resistance of an `n-bit` hash as `root 2^n`, meaning that any method that makes it easier than this to find a collision deems that hash function as insecure. Some hash functions that were once thought to be collision resistant have now been broken. See [MD5](https://web.archive.org/web/20090521024709/http://merlot.usc.edu/csac-f06/papers/Wang05a.pdf) and [SHA-1](https://people.csail.mit.edu/yiqun/SHA1AttackProceedingVersion.pdf).

### Avalanche Effect

A cryptographic hash function should ensure that a small change to a message (e.g flicking a single bit) changes the resulting hash so extensively (e.g. half the output bits flip) that the new hash value appears uncorrelated with the old hash value. This is know as [diffusion](https://en.wikipedia.org/wiki/Confusion_and_diffusion#Diffusion) first identified by [Claude Shannon](https://en.wikipedia.org/wiki/Claude_Elwood_Shannon). If a hash function has poor diffusion an attacker may be able to make predictions about a message given the hash.

Examples of the avalanche effect:

```
Hash 1:
sha256('conor deegan') => 0x5682143fca595e8ff8f62f91aafbd3c43dfc20fa87d3a33e7bae49ed5236701a

Hash 2:
sha256('conor deegam') => 0xf368271842971406f4379762bb4d3a0105010280ae0cc8ebe9bace7231315cae
```

By changing the final letter of the message from `n` to `m` the resulting hash is entirely different.

In terms of our use case, an example of two hashes generated from a hash function that does not implement the avalanche effect might look like this:

```
Hash of actual password
bad_hash_function('password') = 12345678

Hash of password guessed by Eve
bad_hash_function('Password') = 02345678
```

Eve would know that she is close to the correct password as the hashes are similar.

### Deterministic

A cryptographic hash function should be deterministic meaning that each time the same message is hashed it should produce the same result.

### Constant time

A [perfect hash function](https://en.wikipedia.org/wiki/Perfect_hash_function) can hash values in constant time. As such a cryptographic hash function should be quick to compute the hash value for any given message.

### Hash functions and Ethereum

Hash functions are used extensively in the Ethereum protocol. Some of the most common uses for hash functions in Ethereum include generation of Ethereum addresses from public keys, checking message integrity, detecting errors, proof of work, authentication, pseudorandom number generation, and digital signatures. Ethereum uses the `Keccak-256` cryptographic hash function.

### Keccak-256

`Keccak-256` was first developed and entered into a competition organised by the National Institute of Standards and Technology (NIST) set up to create a new hash standard, SHA-3. Ultimately `Keccak-256` won this competition and was due to be standardised as the FIPS-202 SHA-3 standard. However during the standardisation process NIST made some small adjustments to `Keccak-256` to "improve efficiency". Documents published by Edward Snowden implied that these adjustments were influenced by the NSA and included a change to intentionally weaken a part of the algorithm used to generate random numbers creating a backdoor in part of the function. As a result of this the Ethereum Foundation decided to implement the original `Keccak-256` algorithm rather then the modified standard `SHA-3`.

### References

1. [Mastering Ethereum by Andreas M. Antonopoulos, Gavin Wood](https://www.oreilly.com/library/view/mastering-ethereum/9781491971932/)

*Note: these references exclude hyperlinks included throughout the document.*