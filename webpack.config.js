module.exports = {
    // watch 在webpack 中没有找到, 不过同样能用
    //watch:true,
    entry: './public/app/js/app.js',
    output: {
        // 如果使用gulp 有path 参数会报错
        path: './dist',
        filename: 'app.js'
    },
    //devtool:'source-map'
};
