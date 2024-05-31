---
title: "Figuring out the IP address/range of Mongo Atlas service"
author: "Conor Deegan"
postNum: 18
---

I recently had to figure out the IP address of my Mongo Atlas services. I needed to whitelist the IP address of the service in order to connect to the database from a VPN subnet router.

I spent far too much time trying to figure this out. It turns out it is actually in their documentation [here](https://www.mongodb.com/docs/atlas/reference/faq/networking/#how-do-i-find-my-atlas-side-hostnames-to-open-up-my-outbound-firewall-) but I missed it.

In order to get the IP address/range of the service, you can do the following command:

1. Find your cluster hostnames from the Mongo Atlas dashboard. They can be found on the Metrics tab of the database. They look something like this: `cluster0-shard-00-00-abcde.mongodb.net`
2. Preform an `nslookup` on the hostname. For example: `nslookup cluster0-shard-00-00-abcde.mongodb.net`. This will return the IP address of the service. Example output `Address: 18.200.32.136`.
3. If you are looking to allow access from the entire cluster, you would need to perform the above steps on each node in the cluster.

Done!
