import chalk from 'chalk';
import { calculateArea, PI } from './math.js';

const result = calculateArea(5);

console.log(`พื้นที่วงกลมที่มีรัศมี 5 คือ: ${result}`);


console.log(chalk.blue('Hello world!'));
console.log(chalk.red.bold.underline('นี่คือคำเตือนสีแดง!'));

