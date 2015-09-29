async function hello() {
    return await Promise.resolve('Hello ');
};

(async function world() {
    var h = await hello();
    console.log(h);
})();