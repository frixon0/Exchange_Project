import {
  CandlestickSeries,
  ColorType,
  createChart as createLightWeightChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";

type ChartCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export class ChartManager {
  private candleSeries: ISeriesApi<"Candlestick">;
  private lastUpdateTime: number = 0;
  private chart: IChartApi;

  constructor(
    ref: HTMLElement,
    initialData: ChartCandle[],
    layout: { background: string; color: string }
  ) {
    const chart = createLightWeightChart(ref, {
      autoSize: true,
      overlayPriceScales: {
        ticksVisible: true,
        borderVisible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        visible: true,
        ticksVisible: true,
        entireTextOnly: true,
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      layout: {
        background: {
          type: ColorType.Solid,
          color: layout.background,
        },
        textColor: layout.color,
      },
    });
    this.chart = chart;
    this.candleSeries = chart.addSeries(CandlestickSeries);

    this.candleSeries.setData(
      initialData.map((data) => ({
        time: (data.timestamp / 1000) as UTCTimestamp,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
      }))
    );

    this.chart.timeScale().fitContent();
  }
  public update(updatedPrice: ChartCandle & { newCandleInitiated?: boolean; time?: number }) {
    const updateTime = updatedPrice.time ?? updatedPrice.timestamp;

    this.candleSeries.update({
      time: (updateTime / 1000) as UTCTimestamp,
      close: updatedPrice.close,
      low: updatedPrice.low,
      high: updatedPrice.high,
      open: updatedPrice.open,
    });

    if (updatedPrice.newCandleInitiated && typeof updatedPrice.time === "number") {
      this.lastUpdateTime = updatedPrice.time;
    }
  }
  public destroy() {
    this.chart.remove();
  }
}
