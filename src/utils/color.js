/*
 * @Author: ZHT
 * @Date: 2020-01-10 14:21:14
 * @Last Modified by: ZHT
 * @Last Modified time: 2020-01-10 14:36:48
 */

/**
 * 颜色基本操作
 */

/**
 * 生成随机颜色
 */
export function randomColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16)
}
export function randomColor2() {
  return '#' + ((Math.random() * 0xffffff) << 0).toString(16)
}
