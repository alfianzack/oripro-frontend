"use client";

import dynamic from 'next/dynamic'
import React from "react";
import { ApexOptions } from "apexcharts";
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const chartOptions: ApexOptions = {
    legend: {
        show: false
    },
    chart: {
        type: 'area',
        width: '100%',
        height: 270,
        toolbar: {
            show: false
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#45B369', "#487fff"], // Use two colors for the lines
        lineCap: 'round'
    },
    grid: {
        show: true,
        borderColor: '#D1D5DB',
        strokeDashArray: 1,
        position: 'back',
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        },
        row: {
            colors: undefined,
            opacity: 0.5
        },
        column: {
            colors: undefined,
            opacity: 0.5
        },
        padding: {
            top: -20,
            right: 0,
            bottom: -10,
            left: 0
        },
    },
    fill: {
        type: 'gradient',
        colors: ['#45B369', "#487fff"],
        gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ["#45B369", `#487fff00`], // Apply transparency to both colors
            inverseColors: false,
            opacityFrom: [0.4, 0.4], // Starting opacity for both colors
            opacityTo: [0.3, 0.3], // Ending opacity for both colors
            stops: [0, 100],
        },
    },
    markers: {
        colors: ['#45B369', "#487fff"], // Use two colors for the markers
        strokeWidth: 3,
        size: 0,
        hover: {
            size: 10
        }
    },
    xaxis: {
        labels: {
            show: false
        },
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        tooltip: {
            enabled: false
        },
    },
    yaxis: {
        labels: {
            formatter: function (value) {
                return "$" + value + "k";
            },
            style: {
                fontSize: "14px"
            }
        },
    },
    tooltip: {
        x: {
            format: 'dd/MM/yy HH:mm'
        }
    }
};


const chartSeries = [{
    name: 'series1',
    data: [48, 35, 55, 32, 48, 30, 55, 50, 57]
}, {
    name: 'series2',
    data: [12, 20, 15, 26, 22, 60, 40, 48, 25]
}]


const DoubleLineChart = () => {
    return (
        <div className="label--20-px">
            <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={270}
            />
        </div>
    );
};

export default DoubleLineChart


