export interface IPostData {
    id: string;
    data: {
        author: string;
        title: string;
        date: string;
        postNum: number;
        twitterPostTitle: string;
        twitterPostDescription: string;
        twitterPostImage: string;
        categories: string[];
    };
}
