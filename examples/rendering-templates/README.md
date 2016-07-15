## Rendering templates in spirit

In this example, it uses `jade` as it's templates so to run:
`npm install jade`

The example should be simple enough to translate to other templates if you do not use jade.

spirit does _not_ have a rendering engine or "view engine" by design. It's incredibly easy already given abstractions already in place for spirit. And it has nothing really related to http/web, and thus it's better to keep spirit, and spirit-router light rather than account for all possible templating engines. 
