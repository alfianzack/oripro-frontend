"use client";

import dynamic from 'next/dynamic'
import React from "react";
import { ApexOptions } from "apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const RevenueGrowthChart = () => {
    const chartOptions: ApexOptions = {
        chart: {
            type: 'area',
            height: 300,
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
            colors: ['#3B82F6'],
        },
        grid: {
            show: true,
            borderColor: '#E5E7EB',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true,
                    strokeDashArray: 3,
                }
            },
        },
        fill: {
            type: 'gradient',
            colors: ['#3B82F6'],
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.3,
                gradientToColors: ['#3B82F600'],
                inverseColors: false,
                opacityFrom: 0.6,
                opacityTo: 0.1,
                stops: [0, 100],
            },
        },
        markers: {
            colors: ['#3B82F6'],
            strokeWidth: 3,
            size: 0,
            hover: {
                size: 8
            }
        },
        xaxis: {
            categories: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
            labels: {
                style: {
                    fontSize: '14px',
                    colors: '#6B7280'
                }
            },
            axisBorder: {
                show: false
            },
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    if (value >= 2000000000) return 'Rp 2 M';
                    if (value >= 1000000000) return 'Rp 1 M';
                    if (value >= 500000000) return 'Rp 500 Juta';
                    if (value >= 100000000) return 'Rp 100 Juta';
                    return 'Rp 0';
                },
                style: {
                    fontSize: '14px',
                    colors: '#6B7280'
                }
            },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: function (value) {
                    return 'Rp ' + (value / 1000000).toFixed(0) + ' Juta';
                }
            }
        },
    };

    const chartSeries = [
        {
            name: 'Revenue',
            data: [750000000, 1500000000, 400000000, 600000000, 800000000, 1200000000, 1500000000, 1900000000],
        },
    ]

    return (
        <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-700">
                    Revenue Growth
                </CardTitle>
                <Select defaultValue="semua-asset">
                    <SelectTrigger className="w-[140px]">
                        <User className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Semua Asset" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua-asset">Semua Asset</SelectItem>
                        <SelectItem value="asset-1">Asset 1</SelectItem>
                        <SelectItem value="asset-2">Asset 2</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type="area"
                    height={300}
                />
            </CardContent>
        </Card>
    );
};

export default RevenueGrowthChart;
