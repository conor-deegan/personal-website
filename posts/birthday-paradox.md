---
title: "The Birthday Paradox"
author: "Conor Deegan"
postNum: 4
---

### Introduction

In probability theory, given a set of $n$ randomly chosen people, the birthday problem asks for the probability that at least two will share the same birthday. The birthday paradox is that, counterintuitively, in a group of only 23 people there is over a 50% chance that there is a shared birthday. This rises to almost 100% with just over 60 people.

It seems odd that only 23 people are needed in order to have a 50% chance of a shared birthday given 23 random birth dates is considerably lower than all of the possible birthdays people can have: 365. However, this is made more intuitive by considering that the comparisons of birthdays are made between every possible pair of individuals. I.e with 23 people, there are $(23 \times 22)/2 = 253$ pairs of birthdays to consider. This is well over half of the numbers of days in a year (182.5).

### Implications on cryptography

A [birthday attack](https://en.wikipedia.org/wiki/Birthday_attack) is a [cryptographic attack](https://en.wikipedia.org/wiki/Cryptanalysis) that exploits this paradox. Given the paradox, it is possible to find a [collision](https://en.wikipedia.org/wiki/Hash_collision) in a [hash function](/post/cryptographic-hash-functions) in $\approx \sqrt{2^d}$ or $\approx 2^{d/2}$ operations where $d$ is the length of the hash in bits - I will prove this shortly and also give a more exact equation. Some research indicates that quantum computers may perform birthday attacks, i.e find collisions, in $\approx \sqrt[3]{2^d}$ or $\approx 2^{d/3}$ operations [1].

A 128-bit hash would take $2^{128} \approx 3.40×10^{38}$ operations to brute force. It’s hard to grasp how massive this number is and its safe to say that brute forcing a 128-bit hash is still out of reach of modern computers. However, finding a hash collision in a 128-bit hash requires $2^{128/2} = 2^{64} \approx 1.84×10^{19}$ operations. A number quickly becoming within the reach of some modern computers.

I talk more about the problems of hash collisions [here](/post/cryptographic-hash-functions).

### Proof

For simplicity, the following proof will assume that the distribution of birthdays is uniform throughout the year. It will ignore leap years, twins, and seasonal and weekly variations in birth rates. To formalise this, it is assumed that there are 365 possible birthdays, and that each person’s birthday is equally likely to be on any of these days.

The goal is to compute $\gamma$, the probability that at least two people in a group of $n$ persons share the same birthday. However, it is simpler to calculate $\bar\gamma$, the probability that no two people in the room have the same birthday. Given $\gamma$ and $\bar\gamma$  are the only two possibilities and are also mutually exclusive, $\gamma = 1 - \bar\gamma$.

We can now calculate $\bar\gamma$ given $n$ = 23.

Assume the first person was born on any given date. Given this, the probability that the second person was not born on the same date as the first person can be computed as $1-1/{365}$. The probability that the third person was not born on the same days as either the first or the second person can be computed as $1-2/{365}$.

We can continue this for all 23 people:

$\bar\gamma = (1-\frac{1}{365})(1-\frac{2}{365})(1-\frac{3}{365})...(1-\frac{22}{365})$

$\bar\gamma = \frac{365}{365} \times \frac{364}{365} \times \frac{363}{365} \times \frac{362}{365} \times ... \times \frac{343}{365}$

$\bar\gamma = (\frac{1}{365})^{23} \times (365 \times 364 \times 363 \times ... \times 343) $

$\bar\gamma \approx 0.492703 $

Therefore, $\gamma \approx 1-0.492703 = 0.507297 $ i.e $50\%$.

### Generalising to $n$ number of people

We can generalise this to a group of $n$ people as follows:

$\bar\gamma = (1-\frac{1}{365})(1-\frac{2}{365})(1-\frac{3}{365})...(1-\frac{n-1}{365})$

$\bar\gamma  = \frac{356!}{365^n(365-n)!}$

The above shows that the $n^{th}$ birthday cannot be the same as any of the $n$ - $1$ preceding birthdays.

Therefore $\gamma = 1 - \frac{356!}{365^n(365-n)!}$

We can test this for $n = 23$:

$\gamma = 1 - \frac{356!}{365^{23}(365-23)!} \approx 0.507297$ - the same as above.

We can also test this for any value of $n$, e.g $n = 60$:

$\gamma = 1 - \frac{356!}{365^{60}(365-60)!} \approx 0.99412$

It's ineresting to see that with only 60 people in a group, it is *almost* guaranteed that there will be at least two people with the same birthday.

Using the Taylor series we can also approximate this above equation for $n$ number of people as:

$\bar\gamma \approx e^{- \frac{{(n-1)^n}}{2 \times 365}} \approx e^{- \frac{n^2}{2 \times 365}}$

### Generalising to `d-bit` hashes

Let’s now discuss how this translates to the cryptographic attack mentioned above. To do this, we need to replace birthdays for d-bit hashes by replacing $365$ in the above equation with $2^d$.

$\bar\gamma \approx e^{- \frac{n^2}{2 \times 2^d}}$

We can now solve for $n$ so that $\bar\gamma = \gamma = \frac{1}{2}$:

$n \approx \sqrt{2 \times \ln{2}} \times 2^{\frac{d}{2}} \approx 2^{\frac{d}{2}}$

We have now derived the equation known as the birthday bound for `d-bit` hashes. This equation tells us how many hashes are required ($n$) in order for a `d-bit` hash to have a 50% chance of a collision.

We can now compute this value for different `d-bit` hashes:

$d = 64$:

$n \approx \sqrt{2 \times \ln{2}} \times 2^{\frac{64}{2}} = 5056937541$

$d = 128$:

$n \approx \sqrt{2 \times \ln{2}} \times 2^{\frac{128}{2}} = 2.17×10^{19}$

$d = 256$:

$n \approx \sqrt{2 \times \ln{2}} \times 2^{\frac{256}{2}} = 4×10^{38}$

### Demonstration of this paradox in Python

Here's a Python program demonstrating the birthday paradox experimentally: [here](https://github.com/conor-deegan/sandbox/tree/main/birthday-paradox).

The attached Python program generates $n$ 16-bit hashes and checks for at least one collision.

For this, $n$ can equal $2^i$ where $i=2,3,4,…,16$.

Given that we are dealing with 16-bit hashes, due to the birthday paradox, we would expect a 50% chance of a collision when we generate $2^{16/2} = 2^8 = 256$ hashes.

The program runs 1,000 times for each value of $n$ in order to check if there is a trend in how many times at least one collision is found.  The program then plots the results along side the results calculated from the derived equation, subbing in the relevant value of $n$ each time:

$\gamma \approx 1 - e^{- \frac{n^2}{2 \times 2^{16}}}$

![Birthday-Paradox-Plot](/post/birthday-paradox-plot.png "Plot of Results")

From the above we can see that the empirical results match almost perfectly with the derived equation. Only 256 hashes are required in order to have a 50% chance of at least once collision in a 16-bit hash, which can take $2^{16}$ = 65,536 possible values.

### References

1. [Quantum Algorithm for the Collision Problem. Brassard et al 1997](https://arxiv.org/pdf/quant-ph/9705002.pdf)

2. [Birthday Attack](https://en.wikipedia.org/wiki/Birthday_attack)

3. [The Birthday Problem](https://en.wikipedia.org/wiki/Birthday_problem)

*Note: these references exclude hyperlinks included throughout the document.*
