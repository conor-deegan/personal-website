---
title: "Elliptic Curve Cryptography"
author: "Conor Deegan"
postNum: 2
---

### Introduction

The purpose of this post is to introduce Elliptic Curve Cryptography (ECC) as a primer for use it's use in Web3.

## Motivation

[Symmetric key encryption](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) is a type of cryptosystem that uses the same cryptographic keys for both encryption of plaintext and the decryption of ciphertext. As such, the key represents a [shared secret](https://en.wikipedia.org/wiki/Shared_secret) between two or more people that can be used for private communication.

```
Encryption
cipher_text = τ(plain_text, secret_key)

Decryption
plain_text = τ(cipher_text, secret_key)

Where τ(x,y) is the function used for encryption and decryption
```

One of the main drawbacks of symmetric-key encryption is that all parties are required to know the key. This creates a sort of catch-22 paradox where users need to privately communicate a key to use for private communication. At some point in time messages would need to be sent over unencrypted channels. This creates what is know as the [key distribution problem](https://en.wikipedia.org/wiki/Key_distribution).

This problem was solved in 1976 with the publication of the [Diffie-Hellman key exchange algorithm](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange). This algorithm is based on two related pieces of information- a public key, which can be revealed publicly and sent over unencrypted channels, and a private key, which must be kept secret. With this, Alice can now safely send her public key over unencrypted channels to Bob who can use Alice's public key to encrypt some data. This cipher text can only be decrypted by the holder of the private key; Alice. This type of cryptosystem is known as [public-key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography) or asymmetric cryptography.

The basis of public-key cryptography relies a set of algorithms which are easy to compute in one direction but extremely computationally difficult to reverse. These types of functions are known as [trapdoor functions](https://en.wikipedia.org/wiki/Trapdoor_function).

```
# This should be easy to compute
public_key = f(private_key)

# This should be extremely difficult to compute
private_key = g(public_key)

where g(x) is the inverse function of f(x)
```

Elliptic Curve Cryptography is one type of public-key cryptography system that is widely used in both the Bitcoin and Ethereum protocols. However, before looking at Elliptic Curve Cryptography it will be helpful to briefly look at another public-key cryptosystem called [RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)).

## RSA

In their publication, Diffie and Hellman did not formally specify a one-way function that could be used in their key exchange algorithm. After a series of attempts, one year later [Ron Rivest](https://en.wikipedia.org/wiki/Ron_Rivest), [Adi Shamir](https://en.wikipedia.org/wiki/Adi_Shamir), and [Leonard Adleman](https://en.wikipedia.org/wiki/Leonard_Adleman)  proposed a suitable one-way function based on prime factorisation.

Prime factorisation is simply a way of expressing a number as a product of its prime factors. This is a suitable one-way function as given two prime numbers it is straightforward to calculate their product. However, given only the product it is [computationally hard](https://en.wikipedia.org/wiki/Computational_hardness_assumption) to find that products prime factors.

*One of the reasons prime numbers are so fundamental in cryptography is because when you multiply two together, the result is a number that can only be broken down into those primes (and itself and 1).*

Here is a working example of the RSA algorithm:

1. Choose two random prime numbers `p` and `q`. Typically these two numbers will be very large and chosen at random. These are kept secret.

```
p = 3, q = 11
```

2. Compute `n = p * q`. `n` is used as the modulus for both the public and private keys. Its length, usually expressed in bits, is the key length.

```
n = 3 * 11 = 33
```

3. Compute `φ(n) = (p - 1) * (q - 1)`. `φ(n)` is kept secret.

```
φ(n) = (3 - 1) * (11 - 1) = 2 * 10 = 20
```

4. Select an `e` such that `1 < e < φ(n)` and `e` and `φ(n)` are coprime. `e` becomes the public key.

```
e = 7
```

*Two integers a and b are coprime if the only positive integer that divides both of them is 1.*

5. Compute d such that `(d * e) % φ(n) = 1`. `d` becomes the private key.

```
d = 3 as (3 * 7) % 20 = 1
```

6. Set the public key and modulus

```
public_key = (e, n) => (7, 33)
```

7. Set the private key and modulus

```
private_key = (d, n) => (3, 33)
```

*This is  simplified and using much smaller numbers compared to secure systems. The maths required is based on [Modular arithmetic](https://en.wikipedia.org/wiki/Modular_arithmetic), [Euler's theorem](https://en.wikipedia.org/wiki/Euler%27s_theorem), [Extended Euclidean algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm) and [Euler's totient function](https://en.wikipedia.org/wiki/Euler%27s_totient_function).*

Encryption and decryption using the public and private keys is defined as follows:

Encryption

```
cipher_text = (plain_text ^ public_key) mod n
```

Decryption

```
decrypted_cipher_text = (cipher_text ^ private_key) mod n
```

We can now test that the public and private keys we generated work by encrypting and decrypting some plaintext:

1. Choose plaintext to encrypt

```
plain_text = 2
```

2. Encrypt the plaintext with the public key

```
cipher_text = (2 ^ 7) % 33 = 29
```

3. Decrypt the cipher text with the private key

```
decrypted_cipher_text = (29 ^ 3) % 33 = 2
```

4. Ensure the original plaintext matches the decrypted cipher text

```
plain_text (2) == decrypted_cipher_text (2)
```

*This works with any encoded plaintext string*

Now, if Alice and Bob need to privately communicate, Alice can send Bob her public key `7` and the modulus `33`. Bob can use these to encrypt some plain text `2`. The cipher text `29` can now be sent back to Alice who can decrypt it using her private key `3`.

As mentioned, the one way function in RSA comes from the fact that factorising `n` (which is public) into its component primes (`p` and `q`) is computationally very difficult when sufficiently large and random prime values for `p` and `q` are selected.

However, in more recent years [some algorithms](https://en.wikipedia.org/wiki/Quadratic_sieve) have been created to handle the problem of prime factorisation and have been relatively successful in doing so.

## Elliptic Curve Cryptography

Similarly, to RSA, Elliptic Curve Cryptography (ECC) is another public-key cryptosystem. ECC is based on the algebraic structure of elliptic curves over [finite fields](https://en.wikipedia.org/wiki/Finite_field) and uses a trapdoor one-way function based on the [the discrete logarithm problem](https://en.wikipedia.org/wiki/Discrete_logarithm). ECC is seen as a suitable successor of RSA as ECC uses smaller keys than RSA with the same level of security and is faster at key generation, agreement, and signatures.

### Elliptic Curves

An elliptic curve is a curve in mathematics which satisfies the equation

```
y^2 = x^3 + ax + b
```

ECC algorithms can use many different underlying elliptic curves. Different curves provide different levels of security, performance, and key lengths.

One of the most widely used elliptic curves is `secp256k1` which has a key length of 256-bits. This is the elliptic curve used in both Ethereum and Bitcoin and is defined as

```
y^2 = x^3 + 7
```

Where `a = 0` and `b = 7`

A typical elliptic curve takes the following form



![Elliptic Curve](/post/elliptic-curve.png)



### Elliptic Curves over Finite Fields

In order for the cryptography to work the elliptic curves used in ECC are set to be over a [finite field](https://en.wikipedia.org/wiki/Finite_field) `p` where `p` is prime and greater than 3.

A finite field is a field that contains a finite number of elements rather than being continuous over all real numbers. This means that the points on an elliptic curve over a finite field are limited to integer coordinates within the field and any algebraic operation will result in another point within the field.

An elliptic curve over a finite field can be defined as

```
y^2 ≡ x^3 + ax + b (mod p)
```

The `mod p` indicates that this curve is over a finite field of prime order `p`.

The `secp256k1` curve can be defined over a finite field as

```
y^2 ≡ x^3 + 7 (mod p)
```

### Elliptic Curves over Finite Fields Arithmetic

To calculate if a point `(x,y)` belongs to an elliptic curve over a finite field we can check that

```
x^3 + ax + b - y^2 ≡ 0 (mod p)
```

If the result of the above operation is zero then that point lies on that elliptic curve, otherwise it does not.

When two points on an elliptic curve over a finite field are added together the result is another point on the elliptic curve.

```
T + Q = P
```

If both `T` and `Q` are both points on the same elliptic curve over a finite field, the result of the above operation will result in `P` which will also lie on the same elliptic curve.

Similarly we can add a point to itself multiple times and the result will be another point on the same elliptic curve

```
T + T + T + T = F
```

We have now defined elliptic curve multiplication:

```
T * k = F
```

Meaning any point `T` on an elliptic curve over a finite field can be multiplied by an integer `k` and the result will be another point `F` on the same elliptic curve.

With this arithmetic we can now create public-private keys using ECC.

### ECC Keys

In ECC, private keys are simply random integers in the range of the order of the elliptic curve.

The order of the elliptic curve used in Bitcoin and Ethereum for instance is 2^256 (about 78 decimal digits). To create a private key, we randomly pick a 256-bit number. One way this can be done is by taking an even larger string of random bits generated by a [cryptographically secure source of randomness](https://en.wikipedia.org/wiki/Cryptographically-secure_pseudorandom_number_generator#:~:text=A%20cryptographically%20secure%20pseudorandom%20number,suitable%20for%20use%20in%20cryptography.) and hashing them using a 256-bit hash algorithm such as [SHA-256](https://emn178.github.io/online-tools/sha256.html).

It's interesting to note just how large the 2^256 key space is, especially considering this is the key space that all Ethereum and Bitcoin private keys are in. 2^256 is roughly equal to 10^77 in decimal. There is an estimated 10^80 atoms in the universe. This means there is almost enough private keys for every atom in the universe. Provided the private key you select is sufficiently random there is no way anyone else will also select that number as their private key.

*The order of the elliptic curve used in Ethereum and Bitcoin is actually slightly less than 256-bits but this is easy to account for when we generate the private key by checking it is within the allowable range.*

In ECC, a public key is a `(x,y)`  point on an elliptic curve. This point is calculated using the private key (an integer) and a point `G` on the elliptic curve.

```
public_key = private_key * G
```

Where `G` is a constant known as the generator point and `*` is the elliptic curve multiplication operator. We know from the above arithmetic that multiplying a point `G` on an elliptic curve by an integer `k` (the private key) will result in another point (the public key) that will lie on the same elliptic curve as `G`.

This operation is a one way operation. It is trivial to calculate the public key knowing the private key but you cannot find the private key only knowing the public key. This reverse operation, which would be simple division with normal numbers, is known as finding the discrete logarithm in elliptic curve arithmetic. Calculating the private key when you only know the public key is as difficult as trying a brute force search of the entire key space for all possible values of the private key - needless to say this would take a very long time!

### Elliptic Curve Diffie–Hellman Key Exchange

Going back to the initial problem with Alice and Bob, we can use Elliptic Curve Cryptography as an anonymous key agreement scheme. This is known as [Elliptic Curve Diffie–Hellman Key Exchange](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman) (ECDH). ECDH allows Alice and Bob to generate a shared secret over an unencrypted channel provided both Alice and Bob have a public/private key pair generated from an elliptic curve. The idea is similar to RSA discussed above but it uses ECC multiplication rather than modular exponentiations. All that is required is that Alice and Bob agree on an elliptic curve to use and a generator point `G`. All of which can be done in public.

1. Alice then randomly selects a private key: `alice_private`

2. Alice creates her public key: `alice_public`

```
alice_public = alice_private * G
```

3. Bob randomly selects a private key: `bob_private`

4. Bob creates his public key: `bob_public`

```
bob_public = bob_private * G
```

5. Alice and Bob can then share their public keys over an insecure channel.

6. Alice can now calculate their shared secret: `secret_key`

```
secret_key = bob_public * alice_private
```

7. Bob can now calculate their shared secret: `secret_key`

```
secret_key = alice_public * bob_private
```

8. Alice and Bob have now generated the same secret key without ever revealing their respective private keys.

The above key agreement relies on the fact that

```
(alice_private * G) * bob_private = (bob_private * G) * alice_private
```

Only the holders of the private keys corresponding to the two public keys that have been shared will be able to calculate the correct secret key. We have now solved the key distribution problem using Elliptic Curve Cryptography.

### References

1. [Mastering Ethereum by Andreas M. Antonopoulos, Gavin Wood](https://www.oreilly.com/library/view/mastering-ethereum/9781491971932/)

2. [Practical Cryptography for Developers by Svetlin Nakov](https://cryptobook.nakov.com/)

*Note: these references exclude hyperlinks included throughout the document.*
