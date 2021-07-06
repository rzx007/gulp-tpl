/*
 * @Author: rzx007
 * @Date: 2021-06-15 17:00:46
 * @LastEditors: rzx007
 * @LastEditTime: 2021-06-15 17:00:47
 * @FilePath: \gulp-tpl\src\views\index.js
 * @Description: Do not edit
 */
async function async1() {
    console.log('2');
    await async2();
    console.log('6');
}
async function async2() {
	console.log('3');
}

console.log('1');

setTimeout(function() {
    console.log('8');
}, 0)

async1();

new Promise(function(resolve) {
    console.log('4');
    resolve();
}).then(function() {
    console.log('7');
});
console.log('5');
