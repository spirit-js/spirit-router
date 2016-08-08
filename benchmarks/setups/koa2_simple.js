// NOTE: this doesn't test a router
// like the other benchmarks

const Koa = require('koa');
const app = new Koa();

app.use(function (ctx, next){
  ctx.body = 'Hello World';
});

app.listen(3009);
