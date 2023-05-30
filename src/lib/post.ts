import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export const getFiles = async () => {
    const postsDirectory = path.join(__dirname, '../../../../src/posts');
    return fs.readdirSync(path.join(postsDirectory), 'utf-8');
};

export const getPostBySlug = async (slug: string) => {
    const postsDirectory = path.join(__dirname, '../../../../src/posts');
    const source = fs.readFileSync(
        path.join(postsDirectory, `${slug}.md`),
        'utf8'
    );

    const { data, content } = matter(source);

    return {
        frontMatter: data,
        markdownBody: content
    };
};

export const getSortedPostsData = () => {
    // Get file names
    const postsDirectory = path.join(__dirname, '../../../src/posts');
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const { data } = matter(fileContents);

        // Combine the data with the id
        return {
            id,
            data
        };
    });
    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.data.postNum < b.data.postNum) {
            return 1;
        } else {
            return -1;
        }
    });
};
