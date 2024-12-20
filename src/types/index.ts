export interface IPostData {
    id: string;
    data: {
        author: string;
        title: string;
        postNum: number;
        ready: boolean;
        type: 'post' | 'note';
    };
}
