# Tanian-1999

It&#39;s a Tainan-1999 visulization by Taiwanstat


#### Prerequisites
- [npm](https://www.npmjs.com) ( we assume you have pre-installed [node.js](https://nodejs.org/en/) ).
- For **`Ubuntu`** , you must have to install `ruby` and `ruby-compass`
  - command: **`sudo apt install ruby-compass`**


## Getting Started

#### Install package
```
npm install -i
```

### Usage

build sass , js 
```
$ gulp
```

build hbs to html, and watch
```
$ ./bin/build -w
```

- Use `gulp` to construct it .
- `canner-core` is your main component which you also use in `handlebar.js`.

#### usage of map / donutChart 
- [MAP.md](./MAP.md)
- [donutChart.md](./DonutChart.md)

## Developer

### gulp

build sass , js , then watch
```
$ gulp
``` 

minify css , js
```
$ gulp minify-css
$ gulp minify-js
```


concate all lib **js** or **css** file to one file ,  reduce request
```
$ gulp concate-css
$ gulp concate-js
```

compress img ( It's usually use on final in your project)
```
$ gulp image
```

### canner-core

build **hbs to html**
```
$ ./bin/build 
```

+ -w : watch
+ -m : minify code

## License
 © [Taiwanstat]()

---
### About [GoGo Frontend ](GoGoFrontend.md)
It helps you to construct and orginize your static code , quickly minify html , css , js , img.  

Use [gulp](http://gulpjs.com) and [canner-core](https://www.npmjs.com/package/canner-core)
( The html's template is [hbs](http://handlebarsjs.com) )

+ gulp
+ gulp-compass
+ gulp-concat
+ gulp-imagemin
+ gulp-minify-css
+ gulp-plumber
+ gulp-rename
+ gulp-uglify
+ gulp-clean-css
+ canner-core
+ minist
