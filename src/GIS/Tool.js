/**
 * 计算角度，返回的值是：左：+- 180，右：0，上：-90，下：90
 * @param {number} startx 起点 X
 * @param {number} starty 起点 Y
 * @param {number} endx 终点 X
 * @param {number} endy 终点 Y
 */
export function GetAngle(startx, starty, endx, endy) {
  let tan = 0
  // 算出 atan 后是弧度值，要换算为角度（* 180 / Math.PI）
  tan = Math.atan2(endy - starty, endx - startx) * 180 / Math.PI
  return tan
}

/**
 * // 插值点
 * @param {Point} startPoint 起点
 * @param {Point} endPoint 终点
 * @param {number} insertNum 插入点个数
 */
export function interpolation(startPoint, endPoint, insertNum) {
  var tmp = []
  if (insertNum === undefined) {
    insertNum = 2
  }
  var count = Math.abs(insertNum)

  var x1 = Math.abs(endPoint.x - startPoint.x)
  var y1 = Math.abs(endPoint.y - startPoint.y)
  var z1 = Math.sqrt(x1 * x1 + y1 * y1)
  count = z1 / count

  var disX = (endPoint.x - startPoint.x) / count
  var disY = (endPoint.y - startPoint.y) / count
  var i = 0
  while (i <= count) {
    var x = startPoint.x + i * disX
    var y = startPoint.y + i * disY
    tmp.push({ x: x, y: y })
    i++
  }
  tmp.push(endPoint)// 防止插值出来的最后一个点到不了B点
  return tmp
}

const FlowSymbol = {
  type: 'picture-marker',
  width: '13px',
  height: '11px',
  url: './static/map/river-flow.png',
  angle: -135
}
/**
 * 根据轨迹画要素（ArcGIS js 实现）
 * @param {int} startIndex 起始路径位置
 * @param {int} stopIndex 终止路径位置
 * @param {Array} paths 路径
 * @param {Layer} moveLayer 图层
 * @param {Graphic} graphic 要素
 */
export function drawMoving(startIndex, stopIndex, paths, moveLayer, graphic) {
  const endIndex = paths.length
  if (stopIndex < endIndex) {
    const startX = paths[startIndex][0]
    const startY = paths[startIndex][1]
    const stopX = paths[stopIndex][0]
    const stopY = paths[stopIndex][1]
    // 斜率
    const p = (stopY - startY) / (stopX - startX)
    if (isNaN(p)) {
      startIndex++
      stopIndex++
      this.drawMoving(startIndex, stopIndex, paths, moveLayer, graphic)
    }
    // 偏移量
    const v = 0.00005
    if (!graphic) {
      const people = {
        type: 'point',
        longitude: paths[startIndex][0],
        latitude: paths[startIndex][1]

      }
      graphic = new this.$map.Gis_api.Graphic({
        geometry: people,
        symbol: FlowSymbol
      })
    }
    // 定时器
    const moving = setInterval(() => {
      // 终点下标
      const stopNum = stopIndex
      let newX
      let newY
      // 分别计算x，y轴上的偏移后的坐标
      if (Math.abs(p) === Number.POSITIVE_INFINITY) {
        // 斜率的绝对值为无穷大，斜率不存在，即x轴方向上的偏移量为0
        stopY > startY ? newY = graphic.geometry + v : newY = graphic.geometry - v
        newX = graphic.geometry.x
      } else {
        if (stopX < startX) {
          newX = graphic.geometry.x - (1 / Math.sqrt(1 + p * p)) * v
          newY = graphic.geometry.y - (p / Math.sqrt(1 + p * p)) * v
        } else {
          newX = graphic.geometry.x + (1 / Math.sqrt(1 + p * p)) * v
          newY = graphic.geometry.y + (p / Math.sqrt(1 + p * p)) * v
        }
      }
      // 判断是否开始进行下一段轨迹移动
      if ((graphic.geometry.x - stopX) * (newX - stopX) < 0 || (graphic.geometry.y - stopY) * (newY - stopY) < 0) {
        // 可以开始下一段轨迹移动
        graphic.geometry.x = stopX
        graphic.geometry.y = stopY
        clearInterval(moving)
        startIndex++
        stopIndex++
        if (stopNum < endIndex) {
          console.log(`第${startIndex}步`)
          this.drawMoving(startIndex, stopIndex, paths, moveLayer, graphic)
        }
      } else {
        const people = {
          type: 'point',
          longitude: newX,
          latitude: newY
        }
        graphic = new this.$map.Gis_api.Graphic({
          geometry: people,
          symbol: FlowSymbol
        })
        moveLayer.graphics = [graphic]
      }
    }, 50)
  }
}
