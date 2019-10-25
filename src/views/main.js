import dayjs from 'dayjs'
const person = () => {
    console.log('change');
    console.log(dayjs().add(1, 'year'));

}
person()

const wrap = document.getElementById('wrap');
wrap.innerHTML = require('../components/hello.html')