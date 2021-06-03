# 技术要点
## React Hooks
`React`是一个强大的UI框架，而`React Hooks`则是一套强大的，主要基于函数式编程的UI驱动器，不论是运行效率还是开发效率还是抽象能力均高于原有的基于类组件的模式。
## TypeScript
一门强大的静态类型语言，有效解决了JS种遇到的大量类型隐式转换问题，并且在开发时获得完整的智能提示体验。
## Semantic UI
一个不管怎么用，做出来的效果都不会太丑且功能强大的UI库。
## lodash.js
给JS提供了大量函数式编程工具的库，此程序在处理数据时大量使用了lodash。
## Websocket
从服务端获取实时数据推送的途径，相较于轮询或长连接有较大的效率提升。
## ECharts
一个强大的图表库，使用`canvas`绘制图表。
## 一些与算法有关的地方
比如在计算五日均线的时候使用到了前缀和。
# 技术难点
## 渲染报表分析中的三十多个数据项
将原始数据进行高度抽象后，只需要将报表数据的项ID以及从原始数据到字符串的映射器写入代码，即可以通过几个通用化的组件自动生成若干表示报表数据的表格。

数据范例：
```js
const formats = {
    profitability: [
        { key: "roe", title: "股本回报率", mapper: s => s["roe"] },
        { key: "npm", title: "净利润率", mapper: s => s["npm"] },
        { key: "gpm", title: "毛利率", mapper: s => s["gpm"] },
        { key: "np", title: "净利润", mapper: s => s["np"]?.toFixed(2) },
        { key: "eps", title: "每股收益", mapper: s => s["eps"]?.toFixed(2) },
        { key: "mbr", title: "主营业务收入", mapper: s => s["mbr"]?.toFixed(2) },
        { key: "ts", title: "股份总数", mapper: s => s["ts"]?.toFixed(0) },
        { key: "cs", title: "流通股", mapper: s => s["cs"]?.toFixed(0) },
    ],
```
抽象代码范例：
```js
    return (current === undefined) ? (<div style={{ height: "200px" }}>
        <Grid columns="3" centered>
            <Grid.Column>数据不存在</Grid.Column>
        </Grid>
    </div>) : (<Table attached={attach}>
        <Table.Header>
            <Table.Row>
                {currentFormat.map((x: { key: string; title: string }) => <Table.HeaderCell key={x.key}>
                    {x.title}
                </Table.HeaderCell>)}
            </Table.Row>
        </Table.Header>
        <Table.Body>{current && <Table.Row>
            {currentFormat.map((x: { key: string; mapper: (s: any) => string | number | null; }) => <Table.Cell key={x.key}>
                {(() => {
                    let val = x.mapper(current);
                    if (val === null || val === undefined) {
                        return "数据不存在";
                    } else
                        if (typeof val == "number") {
                            return `${(val as number).toFixed(2)}%`;
                        } else return val as string;
                })()}
            </Table.Cell>)}
        </Table.Row>}</Table.Body>
    </Table>)
```
## 充分利用TypeScript的类型运算来做到类型安全
```js
} as { [Key in StatementType]: FormatMapping<AllBundle[Key]>[] };
```
## 将与服务端交互的部分抽象成一个单独的对象，以使数据传输尽可能与UI解耦
可以通过该客户端对象来异步发送请求，或者建立从服务端获取数据的WebSocket并注册回调函数。
## 大量使用函数式编程的思想或特性
例如在计算五日均线时:
```js
 const average5Data = prefixSum.map((x, i) => (x - (i <= 4 ? 0 : prefixSum[i - 5])) / (i <= 4 ? (i + 1) : 5)).map(x => ({ name: x.toFixed(2), value: x }));
```
例如在计算图表数据时:
```js
    const combinedCandleData = candleChartData.map(x => [x.opening, x.closing, x.lowest, x.highest].map(i => i.value));
    const maxVolume = _.max(volumeData.map(t => t.volume));
    const maxPrice = unwrapNumber(_.max(generalData.map(item => item.highest))!, true).value;
    const minPrice = unwrapNumber(_.min(generalData.map(item => item.lowest))!, true).value;
    const halfLen = (maxPrice - minPrice) / 2;
    const combinedVolumeData = _.zip(volumeData, candleChartData).map(([x, y]) => ({
        value: x!.volume,
        itemStyle: (y!.opening.value <= y!.closing.value) ? ({ color: "red", borderColor: "red", borderWidth: 1, opacity: 0.5 }) : ({ color: "blue" })
    }));
```
## 使用了大量ES6或更新的特性
例如数组拆包:
```js
setStockTrendList(s => _.takeRight(filterStockTrendList([...(s || []), ...val]), 90));
```