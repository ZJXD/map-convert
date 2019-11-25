# mapconvert

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your tests

```
npm run test
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### 功能介绍

预期功能：  
1、实现主流地图坐标的转换；  
2、可以切换当前主地图（即左侧的地图）；  
3、切换地图的同时，坐标转换方式对应变化；

### 问题

1、如果最开始显示的不是天地图，后面切换到天地图不能正常显示；  
2、如果最开始显示的不是百度地图，初始化设置的地图中心点到了左上角；

### 问题解决

1、针对上面的《问题-2》解决百度初始化中心点问题；
