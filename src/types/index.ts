export interface IPostData {
    id: string;
    data: {
        author: string;
        title: string;
        date: string;
        postNum: number;
        categories: string[];
    };
}
