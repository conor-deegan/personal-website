/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'conordeegan.dev',
                port: '',
                pathname: '/*'
            }
        ]
    },
    webpack: function (config) {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader'
        });
        return config;
    }
};
