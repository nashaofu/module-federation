import importRemoteModule from './importRemoteModule'
import add from 'app1/add'
import subtract from 'app2/subtract'

console.log(add(11, subtract(20, 10)), subtract(20, 10))
// const { default: math } = await importRemoteModule({
//   url: 'http://localhost:3003/microservices.js',
//   scope: 'app3',
//   module: './math'
// })
