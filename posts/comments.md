---
title: "Adding comments/replies to this blog"
author: "Conor Deegan"
postNum: 3
type: "note"
---

This is not that novel and took (a lot of) inspiration from Emily Liu's [post](https://emilyliu.me/blog/comments). However, it is slightly adapted to fit my needs. The long and short of it is that blog comments are now pulled directly from my Bluesky posts and displayed at the bottom of each page.

```javascript
    useEffect(() => {
        const load = async () => {
            const me = 'did:plc:w5zebdsy36zhbufep2bqzg67';
            const post = await agent.app.bsky.feed.searchPosts({
                q: 'www.conordeegan.dev',
                author: me,
                url: `https://conordeegan.dev${pathname}`
            });
            if (post.data.posts.length === 0) {
                return;
            }
            const postUri = post.data.posts[0].uri;
            const postThread = await agent.getPostThread({
                uri: postUri
            });
            if (!postThread.data || !postThread.data.thread) {
                return;
            }
            const fetchedReplies = postThread.data.thread.replies as IReply[];
            setReplies(fetchedReplies);
            setBlueskyPostLink(
                `https://bsky.app/profile/${did}/post/${
                    postUri.split('/')[postUri.split('/').length - 1]
                }`
            );
        };
        load();
    }, []);
```

I search for posts that have been authored by me and have a url in the post pointing to the current page of the blog being viewed. If I find a post, I then fetch the thread of replies to that post and display them at the bottom of the blog page. It's really that simple and leverges the beneifts of an [open network](https://emilyliu.me/blog/open-network).
