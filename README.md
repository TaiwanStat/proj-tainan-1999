

# Summary
- this is 少量多餐版本
- 可以繪製bubble chart, 並選擇request的數據!
## Usage

```
git clone https://github.com/chihsuan/proj-tainan-1999.git --branch bubble_chart --single-branch

cd ~/proj-tainan-1999
```
- python2
```
python -m SimpleHTTPServer 8000
```
- python3
```
python -m http.server 8000
```
> and browse the site of 127.0.0.1:8000 in your browser
## files
bubble_chart
|--index.html
|--**main.js**
|--main.css
|---font-awesome
|--G.js
|--d3.slider.css
|--d3.slider.js
|--d3.v3.min.js
|--==**faked.json**==
|--==**faked2.json**==
|--index.html
|--main.css
|--main.js

- faked.json and faked2.json are faked data, you can edit it or add more faked data to test the effect!
- the main.js is my primary code!
## code 
- draw(data)
-- this function provide the method to draw initial bubble chart, and its DOM
-- theoretically, the input data should be the data of first date, which I set it to 2016-11-09, but it is **not neccessary**
- change(data)
-- this function provide the method to update the bubble chart and its DOM
- option()
-- this function provide the method to add the event listener to scroll bar's option button
- data_filter(data)
-- this function provide the method to filter the api's data to the more simple data that pack layout can accept!
-- **you should use this function to filter data before call draw or change function!**

## TODOList
*查看todo tag*
- [ ]將其改成api call的方式
- [ ]修正文字效果及測試轉場動畫
- [ ]左上角文案
- [ ] merge後微調
- [ ]寫出cache版本
