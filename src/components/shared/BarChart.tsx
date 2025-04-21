/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { CSSProperties } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import {
  Bar,
  CartesianGrid,
  Label,
  BarChart as RechartsBarChart,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { RxLightningBolt } from "react-icons/rx";

import {
  AvailableChartColors,
  AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
  getYAxisDomain,
} from "@/lib/chartUtils";
import { useOnWindowResize } from "@/lib/useOnWindowResize";
import { cx } from "@/lib/utils";
import { motion } from "framer-motion";
//#region Shape
function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  )
    return false;

  const keys1 = Object.keys(obj1) as Array<keyof T>;
  const keys2 = Object.keys(obj2) as Array<keyof T>;

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

const renderShape = (
  props: any,
  activeBar: any | undefined,
  activeLegend: string | undefined,
  layout: string,
  customStyle?: any
) => {
  const { fillOpacity, name, showDottedLines } = props;
  let { x, width, y, height } = props;
  const { barColor, numPeaks } = props;
  // Ensure all key dimensions are numbers and fallback if not
  x = typeof x === "number" ? x : 0;
  y = typeof y === "number" ? y : 0;
  width = typeof width === "number" ? width : 0;
  height = typeof height === "number" ? height : 0;

  // Ensure positive dimensions for animation
  if (layout === "horizontal" && height < 0) {
    y += height;
    height = Math.abs(height);
  } else if (layout === "vertical" && width < 0) {
    x += width;
    width = Math.abs(width);
  }

  const isSelected = barColor === "black";
  const computedOpacity =
    activeBar || (activeLegend && activeLegend !== name)
      ? isSelected
        ? fillOpacity
        : 0.3
      : fillOpacity;

  const topRadius = customStyle?.roundedTop
    ? customStyle.roundedTop
    : width / 2;
  const safeTopRadius = Math.min(topRadius, width / 2, height);

  const path = `
    M${x},${y + height} 
    L${x},${y + safeTopRadius} 
    Q${x},${y} ${x + safeTopRadius},${y} 
    L${x + width - safeTopRadius},${y} 
    Q${x + width},${y} ${x + width},${y + safeTopRadius} 
    L${x + width},${y + height} 
    Z
  `;
  const lineSpacing = Math.max(1, Math.floor(height / 10)); // Dynamic spacing based on height with a minimum of 4px
  const lineCount = Math.floor(height / lineSpacing);

  return (
    <>
      <g className="recharts-layer recharts-bar-rectangle">
        {numPeaks > 0 && (
          <g transform={`translate(${x + width / 2 - 8}, ${y - 24})`}>
            <RxLightningBolt
              className="text-pink-700 text-md w-4 h-4 mb-2 font-bold"
              fontWeight={500}
            />
          </g>
        )}
        <motion.path
          d={path}
          initial={{ d: `M${x},${y + height} L${x + width},${y + height} Z` }}
          animate={{ d: path }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          fillOpacity={computedOpacity}
          fill={isSelected ? "black" : barColor}
          whileTap={{ scale: 0.95 }}
          style={{ cursor: "pointer" }}
        />
        {isSelected && (
          <>
            {[...Array(lineCount)].map((_, i) => (
              <line
                key={i}
                x1={x}
                x2={x + width}
                y1={y + (i + 1) * lineSpacing}
                y2={y + (i + 1) * lineSpacing}
                stroke="white"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            ))}
            {
              showDottedLines &&
              <line
                x1={x + width / 2}
                x2={x + width / 2}
                y1={0}
                y2={y} // Define this based on your chart layout
                stroke="black"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            }
          </>
        )}
      </g>
    </>
  );
};

//#region Legend

interface LegendItemProps {
  name: string;
  color: AvailableChartColorsKeys;
  onClick?: (name: string, color: AvailableChartColorsKeys) => void;
  activeLegend?: string;
}

const LegendItem = ({
  name,
  color,
  onClick,
  activeLegend,
}: LegendItemProps) => {
  const hasOnValueChange = !!onClick;
  return (
    <li
      className={cx(
        // base
        "group inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 transition",
        hasOnValueChange
          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          : "cursor-default"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(name, color);
      }}
    >
      <span
        className={cx(
          "size-2 shrink-0 rounded-sm",
          getColorClassName(color, "bg"),
          activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100"
        )}
        aria-hidden={true}
      />
      <p
        className={cx(
          // base
          "truncate whitespace-nowrap text-xs",
          // text color
          "text-gray-700 dark:text-gray-300",
          hasOnValueChange &&
          "group-hover:text-gray-900 dark:group-hover:text-gray-50",
          activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100"
        )}
      >
        {name}
      </p>
    </li>
  );
};

interface ScrollButtonProps {
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
}

const ScrollButton = ({ icon, onClick, disabled }: ScrollButtonProps) => {
  const Icon = icon;
  const [isPressed, setIsPressed] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isPressed) {
      intervalRef.current = setInterval(() => {
        onClick?.();
      }, 300);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isPressed, onClick]);

  React.useEffect(() => {
    if (disabled) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      setIsPressed(false);
    }
  }, [disabled]);

  return (
    <button
      type="button"
      className={cx(
        // base
        "group inline-flex size-5 items-center truncate rounded transition",
        disabled
          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
          : "cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
      )}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        setIsPressed(true);
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        setIsPressed(false);
      }}
    >
      <Icon className="size-full" aria-hidden="true" />
    </button>
  );
};

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[];
  colors?: AvailableChartColorsKeys[];
  onClickLegendItem?: (category: string, color: string) => void;
  activeLegend?: string;
  enableLegendSlider?: boolean;
}

type HasScrollProps = {
  left: boolean;
  right: boolean;
};

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
  const {
    categories,
    colors = AvailableChartColors,
    className,
    onClickLegendItem,
    activeLegend,
    enableLegendSlider = false,
    ...other
  } = props;
  const scrollableRef = React.useRef<HTMLInputElement>(null);
  const scrollButtonsRef = React.useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(null);
  const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const checkScroll = React.useCallback(() => {
    const scrollable = scrollableRef?.current;
    if (!scrollable) return;

    const hasLeftScroll = scrollable.scrollLeft > 0;
    const hasRightScroll =
      scrollable.scrollWidth - scrollable.clientWidth > scrollable.scrollLeft;

    setHasScroll({ left: hasLeftScroll, right: hasRightScroll });
  }, [setHasScroll]);

  const scrollToTest = React.useCallback(
    (direction: "left" | "right") => {
      const element = scrollableRef?.current;
      const scrollButtons = scrollButtonsRef?.current;
      const scrollButtonsWith = scrollButtons?.clientWidth ?? 0;
      const width = element?.clientWidth ?? 0;

      if (element && enableLegendSlider) {
        element.scrollTo({
          left:
            direction === "left"
              ? element.scrollLeft - width + scrollButtonsWith
              : element.scrollLeft + width - scrollButtonsWith,
          behavior: "smooth",
        });
        setTimeout(() => {
          checkScroll();
        }, 400);
      }
    },
    [enableLegendSlider, checkScroll]
  );

  React.useEffect(() => {
    const keyDownHandler = (key: string) => {
      if (key === "ArrowLeft") {
        scrollToTest("left");
      } else if (key === "ArrowRight") {
        scrollToTest("right");
      }
    };
    if (isKeyDowned) {
      keyDownHandler(isKeyDowned);
      intervalRef.current = setInterval(() => {
        keyDownHandler(isKeyDowned);
      }, 300);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isKeyDowned, scrollToTest]);

  const keyDown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setIsKeyDowned(e.key);
    }
  };
  const keyUp = (e: KeyboardEvent) => {
    e.stopPropagation();
    setIsKeyDowned(null);
  };

  React.useEffect(() => {
    const scrollable = scrollableRef?.current;
    if (enableLegendSlider) {
      checkScroll();
      scrollable?.addEventListener("keydown", keyDown);
      scrollable?.addEventListener("keyup", keyUp);
    }

    return () => {
      scrollable?.removeEventListener("keydown", keyDown);
      scrollable?.removeEventListener("keyup", keyUp);
    };
  }, [checkScroll, enableLegendSlider]);

  return (
    <ol
      ref={ref}
      className={cx("relative overflow-hidden", className)}
      {...other}
    >
      <div
        ref={scrollableRef}
        tabIndex={0}
        className={cx(
          "flex h-full",
          enableLegendSlider
            ? hasScroll?.right || hasScroll?.left
              ? "snap-mandatory items-center overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : ""
            : "flex-wrap"
        )}
      >
        {categories.map((category, index) => (
          <LegendItem
            key={`item-${index}`}
            name={category}
            color={colors[index] as AvailableChartColorsKeys}
            onClick={onClickLegendItem}
            activeLegend={activeLegend}
          />
        ))}
      </div>
      {enableLegendSlider && (hasScroll?.right || hasScroll?.left) ? (
        <>
          <div
            className={cx(
              // base
              "absolute bottom-0 right-0 top-0 flex h-full items-center justify-center pr-1",
              // background color
              "bg-white dark:bg-gray-950"
            )}
          >
            <ScrollButton
              icon={RiArrowLeftSLine}
              onClick={() => {
                setIsKeyDowned(null);
                scrollToTest("left");
              }}
              disabled={!hasScroll?.left}
            />
            <ScrollButton
              icon={RiArrowRightSLine}
              onClick={() => {
                setIsKeyDowned(null);
                scrollToTest("right");
              }}
              disabled={!hasScroll?.right}
            />
          </div>
        </>
      ) : null}
    </ol>
  );
});

Legend.displayName = "Legend";

const ChartLegend = (
  { payload }: any,
  categoryColors: Map<string, AvailableChartColorsKeys>,
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
  activeLegend: string | undefined,
  onClick?: (category: string, color: string) => void,
  enableLegendSlider?: boolean,
  legendPosition?: "left" | "center" | "right",
  yAxisWidth?: number
) => {
  const legendRef = React.useRef<HTMLDivElement>(null);

  useOnWindowResize(() => {
    const calculateHeight = (height: number | undefined) =>
      height ? Number(height) + 15 : 60;
    setLegendHeight(calculateHeight(legendRef.current?.clientHeight));
  });

  const filteredPayload = payload.filter((item: any) => item.type !== "none");

  const paddingLeft =
    legendPosition === "left" && yAxisWidth ? yAxisWidth - 8 : 0;

  return (
    <div
      style={{ paddingLeft: paddingLeft }}
      ref={legendRef}
      className={cx(
        "flex items-center",
        { "justify-center": legendPosition === "center" },
        {
          "justify-start": legendPosition === "left",
        },
        { "justify-end": legendPosition === "right" }
      )}
    >
      <Legend
        categories={filteredPayload.map((entry: any) => entry.value)}
        colors={filteredPayload.map((entry: any) =>
          categoryColors.get(entry.value)
        )}
        onClickLegendItem={onClick}
        activeLegend={activeLegend}
        enableLegendSlider={enableLegendSlider}
      />
    </div>
  );
};

//#region Tooltip

type TooltipProps = Pick<ChartTooltipProps, "active" | "payload" | "label">;

type PayloadItem = {
  category: string;
  value: number;
  index: string;
  color: AvailableChartColorsKeys;
  type?: string;
  payload: any;
};

interface ChartTooltipProps {
  active: boolean | undefined;
  payload: PayloadItem[];
  label: string;
  valueFormatter: (value: number) => string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cx(
          // base
          "rounded-md border text-sm shadow-md",
          // border color
          "border-gray-200 dark:border-gray-800",
          // background color
          "bg-white dark:bg-gray-950"
        )}
      >
        <div className={cx("border-b border-inherit px-4 py-2")}>
          <p
            className={cx(
              // base
              "font-medium",
              // text color
              "text-gray-900 dark:text-gray-50"
            )}
          >
            {label}
          </p>
        </div>
        <div className={cx("space-y-1 px-4 py-2")}>
          {payload.map(({ value, category, color }, index) => (
            <div
              key={`id-${index}`}
              className="flex items-center justify-between space-x-8"
            >
              <div className="flex items-center space-x-2">
                <span
                  aria-hidden="true"
                  className={cx(
                    "size-2 shrink-0 rounded-sm",
                    getColorClassName(color, "bg")
                  )}
                />
                <p
                  className={cx(
                    // base
                    "whitespace-nowrap text-right",
                    // text color
                    "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {category}
                </p>
              </div>
              <p
                className={cx(
                  // base
                  "whitespace-nowrap text-right font-medium tabular-nums",
                  // text color
                  "text-gray-900 dark:text-gray-50"
                )}
              >
                {valueFormatter(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

//#region BarChart

type BaseEventProps = {
  eventType: "category" | "bar";
  categoryClicked: string;
  [key: string]: number | string;
};

type BarChartEventProps = BaseEventProps | null | undefined;

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[];
  index: string;
  categories: string[];
  colors?: AvailableChartColorsKeys[];
  valueFormatter?: (value: number) => string;
  startEndOnly?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGridLines?: boolean;
  yAxisWidth?: number;
  intervalType?: "preserveStartEnd" | "equidistantPreserveStart";
  showTooltip?: boolean;
  showLegend?: boolean;
  autoMinValue?: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimals?: boolean;
  barColor?: string;
  onValueChange?: (value: BarChartEventProps) => void;
  enableLegendSlider?: boolean;
  tickGap?: number;
  barCategoryGap?: string | number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  layout?: "vertical" | "horizontal";
  type?: "default" | "stacked" | "percent";
  legendPosition?: "left" | "center" | "right";
  selectedBar?: string;
  setselectedbar?: (data: string) => void;
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void;
  refetch?: () => void;
  customTooltip?: React.ComponentType<TooltipProps>;
  customWrapperStyle?: CSSProperties;
  barWidth?: number;
  x?: number;
  enableAnimation?: boolean;
  animationDuration?: number;
  allowClickableTransitions?: boolean;
  showSparkPlugs?: boolean;
  skipXAxisLabels?: boolean;
  showDottedLines?: boolean;
  handleBarClick?: (date: string) => void;
}

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      categories = [],
      index,
      colors = AvailableChartColors,
      valueFormatter = (value: number) => value.toString(),
      startEndOnly = false,
      showXAxis = true,
      showYAxis = true,
      showGridLines = true,
      yAxisWidth = 56,
      intervalType = "preserveStartEnd",
      showTooltip = true,
      showLegend = true,
      autoMinValue = false,
      minValue,
      maxValue,
      allowDecimals = true,
      className,
      showDottedLines,
      onValueChange,
      enableLegendSlider = false,
      barCategoryGap,
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      layout = "horizontal",
      type = "default",
      legendPosition = "right",
      tooltipCallback,
      customTooltip,
      selectedBar,
      customWrapperStyle,
      barWidth,
      barColor,
      enableAnimation,
      animationDuration,
      showSparkPlugs,
      skipXAxisLabels,
      handleBarClick,
      ...other
    } = props;
    const CustomTooltip = customTooltip;
    const paddingValue =
      (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20;
    const [legendHeight, setLegendHeight] = React.useState(60);
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(
      undefined
    );
    const categoryColors = constructCategoryColors(categories, colors);
    const [activeBar, setActiveBar] = React.useState<any | undefined>(
      undefined
    );
    const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue);
    const hasOnValueChange = !!onValueChange;
    const stacked = type === "stacked" || type === "percent";

    const prevActiveRef = React.useRef<boolean | undefined>(undefined);
    const prevLabelRef = React.useRef<string | undefined>(undefined);
    function valueToPercent(value: number) {
      return `${(value * 100).toFixed(0)}%`;
    }
    function onBarClick(data: any, _: any, event: React.MouseEvent) {
      event.stopPropagation();
      if (handleBarClick) handleBarClick(data?.date);
      if (!onValueChange) return;
      if (deepEqual(activeBar, { ...data.payload, value: data.value })) {
        setActiveLegend(undefined);
        setActiveBar(undefined);
        onValueChange?.(null);
      } else {
        setActiveLegend(data.tooltipPayload?.[0]?.dataKey);
        setActiveBar({
          ...data.payload,
          value: data.value,
        });
        onValueChange?.({
          eventType: "bar",
          categoryClicked: data.tooltipPayload?.[0]?.dataKey,
          ...data.payload,
        });
      }
    }

    function onCategoryClick(dataKey: string) {
      if (!hasOnValueChange) return;
      if (dataKey === activeLegend && !activeBar) {
        setActiveLegend(undefined);
        onValueChange?.(null);
      } else {
        setActiveLegend(dataKey);
        onValueChange?.({
          eventType: "category",
          categoryClicked: dataKey,
        });
      }
      setActiveBar(undefined);
    }
    return (
      <div
        ref={forwardedRef}
        className={cx("h-80 w-full", className)}
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            onClick={
              hasOnValueChange && (activeLegend || activeBar)
                ? () => {
                  setActiveBar(undefined);
                  setActiveLegend(undefined);
                  onValueChange?.(null);
                }
                : undefined
            }
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: yAxisLabel ? -30 : undefined,
              right: yAxisLabel ? -20 : undefined,
              top: 5,
            }}
            stackOffset={type === "percent" ? "expand" : undefined}
            layout={layout}
            barCategoryGap={barCategoryGap}
          >
            {showGridLines ? (
              <CartesianGrid
                className={cx(" #f0f2f6 stroke-1 dark:#f0f2f6")}
                horizontal={layout !== "vertical"}
                vertical={layout === "vertical"}
              />
            ) : null}
            <XAxis
              hide={!showXAxis}
              tick={
                skipXAxisLabels === true
                  ? {
                    transform:
                      layout !== "vertical" ? "translate(-2, 2)" : undefined,
                  }
                  : {
                    transform:
                      layout !== "vertical" ? "translate(-2, 2)" : undefined,
                  }
              }
              fill=""
              stroke="#5D6D86"
              className={cx("text-xs ml-4", "text-[#5D6D86] ml-4 dark:text-[#5D6D86]", {
                "mt-4": layout !== "vertical",
              })}
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
              tickFormatter={(value) =>
                skipXAxisLabels ? (Number(value) % 2 === 0 ? value : "") : value
              } //flag prop to skipXAxisLabels
              {...(layout !== "vertical"
                ? {
                  padding: {
                    left: paddingValue,
                    right: paddingValue,
                  },
                  dataKey: index,
                  interval: startEndOnly ? "preserveStartEnd" : intervalType,
                  ticks: startEndOnly
                    ? [data[0][index], data[data.length - 1][index]]
                    : undefined,
                }
                : {
                  type: "number",
                  domain: yAxisDomain as AxisDomain,
                  tickFormatter:
                    type === "percent" ? valueToPercent : valueFormatter,
                  allowDecimals: allowDecimals,
                })}
            >
              {xAxisLabel && (
                <Label
                  position="insideBottom"
                  offset={-20}
                  className="text-gray-800 text-sm font-medium dark:text-gray-800"
                >
                  {xAxisLabel}
                </Label>
              )}
            </XAxis>

            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              fill=""
              stroke=""
              className={cx(
                // base
                "text-xs",
                // text fill
                "fill-gray-500 dark:fill-gray-500"
              )}
              tick={{
                transform:
                  layout !== "vertical"
                    ? "translate(-3, 0)"
                    : "translate(0, 0)",
              }}
              {...(layout !== "vertical"
                ? {
                  type: "number",
                  domain: yAxisDomain as AxisDomain,
                  allowDecimals: allowDecimals,
                }
                : {
                  dataKey: index,
                  ticks: startEndOnly
                    ? [data[0][index], data[data.length - 1][index]]
                    : undefined,
                  type: "category",
                  interval: "equidistantPreserveStart",
                })}
            >
              {yAxisLabel && (
                <Label
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                  angle={-90}
                  offset={-15}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {yAxisLabel}
                </Label>
              )}
            </YAxis>
            <Tooltip
              wrapperStyle={{ outline: "none", ...customWrapperStyle }}
              isAnimationActive={true}
              animationDuration={100}
              cursor={{ fill: "#d1d5db", opacity: "0.15" }}
              offset={20}
              position={{
                y: layout === "horizontal" ? 0 : undefined,
                x: layout === "horizontal" ? undefined : yAxisWidth + 20,
              }}
              content={({ active, payload, label }) => {
                const cleanPayload: TooltipProps["payload"] = payload
                  ? payload.map((item: any) => ({
                    category: item.dataKey,
                    value: item.value,
                    index: item.payload[index],
                    color: categoryColors.get(
                      item.dataKey
                    ) as AvailableChartColorsKeys,
                    type: item.type,
                    payload: item.payload,
                  }))
                  : [];

                if (
                  tooltipCallback &&
                  (active !== prevActiveRef.current ||
                    label !== prevLabelRef.current)
                ) {
                  tooltipCallback({ active, payload: cleanPayload, label });
                  prevActiveRef.current = active;
                  prevLabelRef.current = label;
                }

                return showTooltip && active ? (
                  CustomTooltip ? (
                    <CustomTooltip
                      active={active}
                      payload={cleanPayload}
                      label={label}
                    />
                  ) : (
                    <ChartTooltip
                      active={active}
                      payload={cleanPayload}
                      label={label}
                      valueFormatter={valueFormatter}
                    />
                  )
                ) : null;
              }}
            />
            {showLegend ? (
              <RechartsLegend
                verticalAlign="top"
                height={legendHeight}
                content={({ payload }) =>
                  ChartLegend(
                    { payload },
                    categoryColors,
                    setLegendHeight,
                    activeLegend,
                    hasOnValueChange
                      ? (clickedLegendItem: string) =>
                        onCategoryClick(clickedLegendItem)
                      : undefined,
                    enableLegendSlider,
                    legendPosition,
                    yAxisWidth
                  )
                }
              />
            ) : null}
            {categories.map((category) => {
              return (
                <Bar
                  className={cx(
                    getColorClassName(
                      categoryColors.get(category) as AvailableChartColorsKeys,
                      "fill"
                    ),
                    onValueChange ? "cursor-pointer" : ""
                  )}
                  key={category}
                  name={category}
                  type="linear"
                  dataKey={category}
                  stackId={stacked ? "stack" : undefined}
                  isAnimationActive={enableAnimation}
                  animationBegin={200}
                  animationDuration={animationDuration}
                  animationEasing="ease-out"
                  fill=""
                  shape={(props: any) => {
                    props.width = barWidth;
                    if (showSparkPlugs) props.showSparkPlugs = true;
                    props.showDottedLines = showDottedLines;
                    props.barColor =
                      selectedBar === props.date ? "black" : barColor;
                    props.numPeaks = props.payload.numpeaks;
                    return renderShape(props, activeBar, activeLegend, layout);
                  }}
                  color="#c71c5d"
                  radius={[10, 10, 0, 0]}
                  onClick={onBarClick}
                />
              );
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

BarChart.displayName = "BarChart";

export { BarChart, type BarChartEventProps, type TooltipProps };
