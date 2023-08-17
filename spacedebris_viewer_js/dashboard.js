function addGraph() {
    let satcat = new Catalogue();
    let satcat2 = new Catalogue();
    let satcat3 = new Catalogue();
    satcat.loadcatlog("kep", "data/catalogue/Future Space Population Simulation (2023).json");
    satcat2.loadcatlog("kep", "data/catalogue/Future Space Population Simulation (2028).json");
    satcat3.loadcatlog("kep", "data/catalogue/Future Space Population Simulation (2043).json");
    let data_load = false;
    let data_load2 = false;
    let data_load3 = false;


    // 初始化 source 数组并添加表头
    let source = [['range', 'Active', 'Inactive']];
    let source2 = [['range', 'Active', 'Inactive']];
    let source3 = [['range', 'Active', 'Inactive']];

    let results_active = []; // for scatter
    let results_inactive = []; // for scatter
    let results_active2 = []; // for scatter
    let results_inactive2 = []; // for scatter
    let results_active3 = []; // for scatter
    let results_inactive3 = []; // for scatter

    let results_active_hist = Array.from({ length: 184 }, (_, i) => ({
        height: `${160 + 10 * i}-${170 + 10 * i}`,
        number: 0,
    }));
    let results_inactive_hist = Array.from({ length: 184 }, (_, i) => ({
        height: `${160 + 10 * i}-${170 + 10 * i}`,
        number: 0,
    }));
    let results_active2_hist = Array.from({ length: 184 }, (_, i) => ({
        height: `${160 + 10 * i}-${170 + 10 * i}`,
        number: 0,
    }));
    let results_inactive2_hist = Array.from({ length: 184 }, (_, i) => ({
        height: `${160 + 10 * i}-${170 + 10 * i}`,
        number: 0,
    }));
    let results_active3_hist = Array.from({ length: 184 }, (_, i) => ({
        height: `${160 + 10 * i}-${170 + 10 * i}`,
        number: 0,
    }));
    let results_inactive3_hist = Array.from({ length: 184 }, (_, i) => ({
        height: `${160 + 10 * i}-${170 + 10 * i}`,
        number: 0,
    }));


    let selection_height = document.getElementById("select-height")
    let selected_height = selection_height.value
    let selection_owner = document.getElementById("select-owner")
    let selected_owner = selection_owner.value
    let selection_orbit = document.getElementById("select-orbit")
    let selected_orbit = selection_orbit.value
    let selection_status = document.getElementById("select-status")
    let selected_status = selection_status.value

    let ownershipList1 = {};
    let ownershipList2 = {};
    let ownershipList3 = {};
    let ownerdata1 = [];
    let ownerdata2 = [];
    let ownerdata3 = [];
   


    let otherCountries1 = 0;
    let otherCountries2 = 0;
    let otherCountries3 = 0;

    let LEO_num1 = 0;
    let MEO_num1 = 0;
    let GEO_num1 = 0;
    let HEO_num1 = 0;
    let unknown_num1 = 0;


    let LEO_num2 = 0;
    let MEO_num2 = 0;
    let GEO_num2 = 0;
    let HEO_num2 = 0;
    let unknown_num2 = 0;

    let LEO_num3 = 0;
    let MEO_num3 = 0;
    let GEO_num3 = 0;
    let HEO_num3 = 0;
    let unknown_num3 = 0;


    let active1 = 0;
    let inactive1 = 0;
    let active2 = 0;
    let inactive2 = 0;
    let active3 = 0;
    let inactive3 = 0;

    let operational_list1 = {};
    let operational_list2 = {};
    let operational_list3 = {};
    let statusdata1 = [];
    let statusdata2 = [];
    let statusdata3 = [];




    setInterval(function () {
        if (satcat.data_load_complete == true && data_load == false) {
            for (let debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) {
                let operation_status1 = satcat.getDebriOperation_status("isat", debrisID);
                let sat_category1 = satcat.getDebriCategory(debrisID);
                let cross_section1 = satcat.getDebriCross_Section(debrisID);
                let country1 = satcat.getDebriCountry(debrisID);
                let sat_infor1 = satcat.getDebriInfo(debrisID);
                let sat_name1 = satcat.getDebriName(debrisID).trim();
                let sat_Id1 = satcat.getDebriID(debrisID).trim();
                let sat_type1 = satcat.getDebriType(debrisID).trim();
                let sat_sma1 = satcat.getSemiMajorAxis(debrisID);
                let apogee1 = parseFloat(satcat.getApogee(debrisID));
                let perigee1 = parseFloat(satcat.getPerigee(debrisID));
                let eccentricity1 = parseFloat(satcat.getEccentricity(debrisID));
                let inclinationAng1 = parseFloat(satcat.getInclinationAng(debrisID));
                let height = avg(apogee1, perigee1);
                // for histogram(height)
                let index = Math.floor((height - 160) / 10);

                /* Code for the table */
                if (operation_status1 !== "Decayed" && operation_status1 !== "Non-operational" && operation_status1 !== "Unknown") {
                    active1 += 1;
                } else {
                    inactive1 += 1;
                }

                /*Code for the height part*/
                if (sat_category1 == "Low Earth Orbit") {
                    if (operation_status1 !== "Decayed" && operation_status1 !== "Non-operational" && operation_status1 !== "Unknown") {
                        // for scatter plot
                        results_active.push([
                            height,
                            Math.random()
                        ]);
                        if (index >= 0 && index < 184) {
                            results_active_hist[index].number++;
                        }
                    } else {
                        results_inactive.push([
                            height,
                            Math.random()
                        ])

                        if (index >= 0 && index < 184) {
                            results_inactive_hist[index].number++;
                        }
                    }
                }
                /* End of Code for the height part*/

                /* Code for the owner part*/
                // Check country
                if (country1 in ownershipList1) {
                    // 如果已经在列表中，增加其值
                    ownershipList1[country1] += 1;
                } else {
                    // 如果还不在列表中，将其值设为1
                    ownershipList1[country1] = 1;

                }

                /* Code for the Orbit*/
                if (sat_category1 == "Low Earth Orbit") {
                    LEO_num1 += 1;
                } else if (sat_category1 == "Middle Earth Orbit") {
                    MEO_num1 += 1;
                } else if (sat_category1 == "Geosynchronous Equatorial Orbit") {
                    GEO_num1 += 1;
                } else if (sat_category1 == "Highly Elliptical Orbit") {
                    HEO_num1 += 1;
                } else if (sat_category1 == "Unknown") {
                    unknown_num1 += 1;
                }

                /* Code for the status part*/
                if (operation_status1 in operational_list1) {
                    // 如果已经在列表中，增加其值
                    operational_list1[operation_status1] += 1;
                } else {
                    // 如果还不在列表中，将其值设为1
                    operational_list1[operation_status1] = 1;
                }
                /*End of code for status part*/
            }// end of for loop

            let all_23 = document.getElementById("all-23")
            let act_23 = document.getElementById("act-23")
            let inact_23 = document.getElementById("inact-23")
            all_23.innerHTML = satcat.getNumberTotal();
            act_23.innerHTML = active1;
            inact_23.innerHTML = inactive1;

            // Futher processing of owner data
            let entries = Object.entries(ownershipList1);
            entries.sort((a, b) => b[1] - a[1]);

            for (let i = 0; i < 4; i++) {
                ownerdata1.push(
                    {
                        value: entries[i][1],
                        name: entries[i][0]
                    }
                )
            }

            for (let i = 4; i < entries.length; i++) {
                otherCountries1 += entries[i][1]
            }
            ownerdata1.push(
                {
                    value: otherCountries1,
                    name: "Other Countries"
                }
            )
            
            /* Code to set option and plot diagram*/
            if (selected_height == "scatter plot") {
                let height_2023 = document.getElementById('height_2023');
                let height_2023_ini = echarts.init(height_2023, "dark");

                let option = {
                    title: {
                        text: 'Distribution of Future Space Population by Height in 2023',
                        left: 'center',
                        padding: [20, 0, 0, 0] // 设置标题的上内边距为20，其他方向为0
                    },
                    legend: {
                        right: '5%',  // 10% from the right
                        top: '5%'  // 5% from the top
                    },
                    xAxis: {
                        type: 'value',
                        name: 'Height (km)', // X-axis label
                        min: 160,
                        max: 2000,
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [10, 0, 0, 0]
                        }
                    },
                    yAxis: {},
                    backgroundColor: "#1F2A40",
                    grid: {
                        left: '5%', // 将图表左侧空白缩小为容器宽度的 2%
                        right: '5%', // 将图表右侧空白缩小为容器宽度的 2%
                    },
                    series: [
                        {
                            symbolSize: 3,
                            data: results_active,
                            type: 'scatter',
                            color: ["#00CC00"],
                            name: "Active"
                        },
                        {
                            symbolSize: 3,
                            data: results_inactive,
                            type: 'scatter',
                            color: ["#FF3333"],
                            name: "Inactive"
                        }
                    ]
                };
                height_2023_ini.clear();
                option && height_2023_ini.setOption(option);
            }
            else if (selected_height == "histogram") {
                let height_2023 = document.getElementById('height_2023');
                let height_2023_ini = echarts.init(height_2023, "dark");
                console.log("its histogram")
                // 初始化 source 数组并添加表头

                // 遍历 results_active_hist 和 results_inactive_hist
                for (let i = 0; i < results_active_hist.length; i++) {
                    // ge the range
                    let range = results_active_hist[i].height;

                    // 获取当前区间的 active 和 inactive 数据
                    let active = results_active_hist[i].number;
                    let inactive = results_inactive_hist[i].number;

                    // 将当前区间的数据添加到 source 数组
                    source.push([range, active, inactive]);
                }


                option = {
                    title: {
                        text: 'Distribution of Future Space Population by Height in 2023',
                        left: 'center',
                        padding: [20, 0, 0, 0] // 设置标题的上内边距为20，其他方向为0
                    },
                    xAxis: {
                        type: 'category',
                        name: 'Height (km)', // X-axis label
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [10, 0, 0, 0]
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Counting', // Y-axis label
                        min: 0,
                        max: 1600,
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [0, 0, 25, 0]
                        },
                        splitNumber: 10

                    },
                    backgroundColor: "#1F2A40",
                    grid: {
                        left: '5%', // 将图表左侧空白缩小为容器宽度的 2%
                        right: '5%', // 将图表右侧空白缩小为容器宽度的 2%
                    },
                    legend: {
                        right: '5%',  // 10% from the right
                        top: '5%'  // 5% from the top
                    },
                    tooltip: {},
                    dataset: {
                        source: source
                    },

                    // Declare several bar series, each will be mapped
                    // to a column of dataset.source by default.
                    series: [{ type: 'bar', color: ["#00CC00"] }, { type: 'bar', color: ["#FF3333"] }]
                };
                height_2023_ini.clear();
                option && height_2023_ini.setOption(option);
            }

            if (selected_owner == "pie chart") {
                // initialize the echart
                let owner_2023 = document.getElementById('owner_2023');
                let owner_2023_ini = echarts.init(owner_2023, "dark");

                option1 = {
                    title: {
                        text: 'Ownership Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: ownerdata1,
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                owner_2023_ini.clear();
                option1 && owner_2023_ini.setOption(option1);
                data_load = true

            }
            else if (selected_owner == "histogram") {
                // initialize the echart
                let owner_2023 = document.getElementById('owner_2023');
                let owner_2023_ini = echarts.init(owner_2023, "dark");
                console.log("its histogram")
                let values1 = ownerdata1.map(item => item.value);
                let names1 = ownerdata1.map(item => item.name);

                let names1Formatted = names1.map(name => {
                    if (name === "Commonwealth of Independent States (former USSR)") {
                        // 对特定字符串进行处理，并插入换行符
                        return "Commonwealth of\nIndependent States\n(former USSR)";
                    }
                    if (name === "People's Republic of China") {
                        return "People's Republic\nof China";
                    }
                    return name; // 如果不是特定字符串，返回原始字符串
                });


                option1 = {
                    title: {
                        text: 'Ownership Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: names1Formatted,
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 10000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: values1
                    }
                };
                owner_2023_ini.clear();
                option1 && owner_2023_ini.setOption(option1);
                data_load = true;
            }

            if (selected_orbit == "histogram") {
                // initialize the echart
                let orbit_2023 = document.getElementById('orbit_2023');
                let orbit_2023_ini = echarts.init(orbit_2023, "dark");

                option1 = {
                    title: {
                        text: 'Orbit Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: ["LEO", "MEO", "GEO", "HEO", "Unknown"],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 15000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: [
                            { value: LEO_num1, itemStyle: { color: "#ee8026" } },
                            { value: MEO_num1, itemStyle: { color: '#bdbf47' } },
                            { value: GEO_num1, itemStyle: { color: '#5ec491' } },
                            { value: HEO_num1, itemStyle: { color: '#3399FF' } },
                            { value: unknown_num1, itemStyle: { color: "#a9a9a9" } }
                        ]
                    }
                };
                orbit_2023_ini.clear();
                option1 && orbit_2023_ini.setOption(option1);
                data_load = true;
            }
            else if (selected_orbit == "pie chart") {

                // initialize the echart
                let orbit_2023 = document.getElementById('orbit_2023');
                let orbit_2023_ini = echarts.init(orbit_2023, "dark");

                option1 = {
                    title: {
                        text: 'Orbit Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: LEO_num1, name: 'LEO', itemStyle: { color: '#ee8026' } },
                                { value: MEO_num1, name: 'MEO', itemStyle: { color: '#bdbf47' } },
                                { value: GEO_num1, name: 'GEO', itemStyle: { color: '#5ec491' } },
                                { value: HEO_num1, name: 'HEO', itemStyle: { color: '#3399FF' } },
                                { value: unknown_num1, name: 'Unknown', itemStyle: { color: '#a9a9a9' } }
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                orbit_2023_ini.clear()
                option1 && orbit_2023_ini.setOption(option1);
            }

            if (selected_status == "pie chart") {
                // initialize the echart
                let status_2023 = document.getElementById('status_2023');
                let status_2023_ini = echarts.init(status_2023, "dark");

                option1 = {
                    title: {
                        text: 'Operatiuonal Status Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: operational_list1["Operational"], name: 'Operational', itemStyle: { color: '#66FF66' } },
                                { value: operational_list1["Non-operational"], name: 'Non-operational', itemStyle: { color: '#FF6666' } },
                                { value: operational_list1["Partially operational"], name: 'Partially operational', itemStyle: { color: '#FFB266' } },
                                { value: operational_list1["Backup/Standby"], name: 'Backup/Standby', itemStyle: { color: '#66FFB2' } },
                                { value: operational_list1["Spare"], name: 'Spare', itemStyle: { color: '#66FFFF' } },
                                { value: operational_list1["Extened mission"], name: 'Extened mission', itemStyle: { color: '#B266FF' } },
                                { value: operational_list1["Decayed"], name: 'Decayed', itemStyle: { color: '#FFFF66' } },
                                { value: operational_list1["Unknown"], name: 'Unknown', itemStyle: { color: '#808080' } },
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                status_2023_ini.clear();
                option1 && status_2023_ini.setOption(option1);
                data_load = true


            }
            else if (selected_status == "histogram") {
                // initialize the echart
                let status_2023 = document.getElementById('status_2023');
                let status_2023_ini = echarts.init(status_2023, "dark");

                option1 = {
                    title: {
                        text: 'Operational Status Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: ["Operational", "Non-operational", "Partially operational", "Backup/Standby", "Spare", "Extened mission","Decayed", "Unknown"],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            },
                            rotate: 30,
                        },
                        
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 11000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: [
                            { value: operational_list1["Operational"], itemStyle: { color: '#66FF66' }},
                            { value: operational_list1["Non-operational"], itemStyle: { color: '#FF6666' } },
                            { value: operational_list1["Partially operational"], itemStyle: { color: '#66FFB2' } },
                            { value: operational_list1["Backup/Standby"], itemStyle: { color: '#66FFB2' } },
                            { value: operational_list1["Spare"], itemStyle: { color: '#66FFFF' } },
                            { value: operational_list1["Extened mission"], itemStyle: { color: '#B266FF' } },
                            { value: operational_list1["Decayed"], itemStyle: { color: '#FFFF66' } },
                            { value: operational_list1["Unknown"], itemStyle: { color: '#808080' } },
                        ]
                    }
                };
                status_2023_ini.clear();
                option1 && status_2023_ini.setOption(option1);
                data_load = true;
            }


        }

    }, 1000);




    setInterval(function () {
        if (satcat2.data_load_complete == true && data_load2 == false) {


            for (let debrisID = 0; debrisID < satcat2.getNumberTotal(); debrisID++) {
                let operation_status2 = satcat2.getDebriOperation_status("isat", debrisID);
                let sat_category2 = satcat2.getDebriCategory(debrisID);
                let cross_section2 = satcat2.getDebriCross_Section(debrisID);
                let country2 = satcat2.getDebriCountry(debrisID);
                let sat_infor2 = satcat2.getDebriInfo(debrisID);
                let sat_name2 = satcat2.getDebriName(debrisID).trim();
                let sat_Id2 = satcat2.getDebriID(debrisID).trim();
                let sat_type2 = satcat2.getDebriType(debrisID).trim();
                let sat_sma2 = satcat2.getSemiMajorAxis(debrisID);
                let apogee2 = parseFloat(satcat2.getApogee(debrisID));
                let perigee2 = parseFloat(satcat2.getPerigee(debrisID));
                let height2 = avg(apogee2, perigee2);
                let index2 = Math.floor((height2 - 160) / 10);


                /* Code for the table */
                if (operation_status2!== "Decayed" && operation_status2 !== "Non-operational" && operation_status2 !== "Unknown") {
                    active2 += 1;
                } else {
                    inactive2 += 1;
                }


                /*Code for height distribution*/
                if (sat_category2 == "Low Earth Orbit") {
                    if (operation_status2 !== "Decayed" && operation_status2 !== "Non-operational" && operation_status2 !== "Unknown") {

                        results_active2.push([
                            height2,
                            Math.random()
                        ]);
                        if (index2 >= 0 && index2 < 184) {
                            results_active2_hist[index2].number++;
                        }
                    } else {

                        results_inactive2.push([
                            height2,
                            Math.random()
                        ])

                        if (index2 >= 0 && index2 < 184) {
                            results_inactive2_hist[index2].number++;
                        }
                    }
                }
                /*End of process for height*/

                /* Code for the owner part*/
                // Check country
                if (country2 in ownershipList2) {
                    // 如果已经在列表中，增加其值
                    ownershipList2[country2] += 1;
                } else {
                    // 如果还不在列表中，将其值设为1
                    ownershipList2[country2] = 1;

                }

                /* Code for the Orbit*/
                if (sat_category2 == "Low Earth Orbit") {
                    LEO_num2 += 1;
                } else if (sat_category2 == "Middle Earth Orbit") {
                    MEO_num2 += 1;
                } else if (sat_category2 == "Geosynchronous Equatorial Orbit") {
                    GEO_num2 += 1;
                } else if (sat_category2 == "Highly Elliptical Orbit") {
                    HEO_num2 += 1;
                } else if (sat_category2 == "Unknown") {
                    unknown_num2 += 1;
                }

                /* Code for the status part*/
                if (operation_status2 in operational_list2) {
                    // 如果已经在列表中，增加其值
                    operational_list2[operation_status2] += 1;
                } else {
                    // 如果还不在列表中，将其值设为1
                    operational_list2[operation_status2] = 1;
                }
                /*End of code for status part*/

            } // end of for loop


            let all_28 = document.getElementById("all-28")
            let act_28 = document.getElementById("act-28")
            let inact_28 = document.getElementById("inact-28")
            all_28.innerHTML = satcat2.getNumberTotal();
            act_28.innerHTML = active2;
            inact_28.innerHTML = inactive2;

            let entries = Object.entries(ownershipList2);
            entries.sort((a, b) => b[1] - a[1]);

            for (let i = 0; i < 4; i++) {
                ownerdata2.push(
                    {
                        value: entries[i][1],
                        name: entries[i][0]
                    }
                )
            }

            for (let i = 4; i < entries.length; i++) {
                otherCountries2 += entries[i][1]
            }
            ownerdata2.push(
                {
                    value: otherCountries2,
                    name: "Other Countries"
                }
            )
            console.log(ownerdata2)
            data_load2 = true;

            console.log(ownershipList2)
            // console.log(results_active2)
            // console.log(results_inactive2)

            if (selected_height == "scatter plot") {
                let height_2028 = document.getElementById('height_2028');
                let height_2028_ini = echarts.init(height_2028, "dark");

                option2 = {
                    title: {
                        text: 'Distribution of Future Space Population by Height in 2028',
                        left: 'center',
                        padding: [20, 0, 0, 0] // 设置标题的上内边距为20，其他方向为0
                    },
                    legend: {
                        right: '5%',  // 10% from the right
                        top: '5%'  // 5% from the top
                    },
                    xAxis: {
                        type: 'value',
                        name: 'Height (km)', // X-axis label
                        min: 160,
                        max: 2000,
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [10, 0, 0, 0]
                        }
                    },
                    yAxis: {},
                    backgroundColor: "#1F2A40",
                    grid: {
                        left: '5%', // 将图表左侧空白缩小为容器宽度的 2%
                        right: '5%', // 将图表右侧空白缩小为容器宽度的 2%
                    },
                    series: [
                        {
                            symbolSize: 3,
                            data: results_active2,
                            type: 'scatter',
                            color: ["#00CC00"],
                            name: "Active"
                        },
                        {
                            symbolSize: 3,
                            data: results_inactive2,
                            type: 'scatter',
                            color: ["#FF3333"],
                            name: "Inactive"
                        }
                    ]
                };
                height_2028_ini.clear();
                option2 && height_2028_ini.setOption(option2);
            }
            else if (selected_height == "histogram") {
                let height_2028 = document.getElementById('height_2028');
                let height_2028_ini = echarts.init(height_2028, "dark");


                // 遍历 results_active_hist 和 results_inactive_hist
                for (let i = 0; i < results_active2_hist.length; i++) {
                    // ge the range
                    let range2 = results_active2_hist[i].height;

                    // 获取当前区间的 active 和 inactive 数据
                    let active2 = results_active2_hist[i].number;
                    let inactive2 = results_inactive2_hist[i].number;

                    // 将当前区间的数据添加到 source 数组
                    source2.push([range2, active2, inactive2]);
                }


                option2 = {
                    title: {
                        text: 'Distribution of Future Space Population by Height in 2028',
                        left: 'center',
                        padding: [20, 0, 0, 0] // 设置标题的上内边距为20，其他方向为0
                    },
                    xAxis: {
                        type: 'category',
                        name: 'Height (km)', // X-axis label
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [10, 0, 0, 0]
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Counting', // Y-axis label
                        min: 0,
                        max: 1600,
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [0, 0, 25, 0]
                        },
                        splitNumber: 10

                    },
                    backgroundColor: "#1F2A40",
                    grid: {
                        left: '5%', // 将图表左侧空白缩小为容器宽度的 2%
                        right: '5%', // 将图表右侧空白缩小为容器宽度的 2%
                    },
                    legend: {
                        right: '5%',  // 10% from the right
                        top: '5%'  // 5% from the top
                    },
                    tooltip: {},
                    dataset: {
                        source: source2
                    },

                    // Declare several bar series, each will be mapped
                    // to a column of dataset.source by default.
                    series: [{ type: 'bar', color: ["#00CC00"] }, { type: 'bar', color: ["#FF3333"] }]
                };
                height_2028_ini.clear();
                option2 && height_2028_ini.setOption(option2);
            }

            // code for pie chart (owner)
            if (selected_owner == "pie chart") {
                // initialize the echart
                let owner_2028 = document.getElementById('owner_2028');
                let owner_2028_ini = echarts.init(owner_2028, "dark");

                option2 = {
                    title: {
                        text: 'Ownership Distribution of Space Population in 2028',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: ownerdata2,
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                owner_2028_ini.clear();
                option2 && owner_2028_ini.setOption(option2);


            }
            else if (selected_owner == "histogram") {
                // initialize the echart
                let owner_2028 = document.getElementById('owner_2028');
                let owner_2028_ini = echarts.init(owner_2028, "dark");
                console.log("its histogram")
                let values2 = ownerdata2.map(item => item.value);
                let names2 = ownerdata2.map(item => item.name);

                let names2Formatted = names2.map(name => {
                    if (name === "Commonwealth of Independent States (former USSR)") {
                        // 对特定字符串进行处理，并插入换行符
                        return "Commonwealth of\nIndependent States\n(former USSR)";
                    }
                    if (name === "People's Republic of China") {
                        return "People's Republic\nof China";
                    }
                    return name; // 如果不是特定字符串，返回原始字符串
                });


                option2 = {
                    title: {
                        text: 'Ownership Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: names2Formatted,
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 10000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: values2
                    }
                };
                owner_2028_ini.clear();
                option3 && owner_2028_ini.setOption(option2);
                data_load2 = true;
            }

            if (selected_orbit == "histogram") {
                // initialize the echart
                let orbit_2028 = document.getElementById('orbit_2028');
                let orbit_2028_ini = echarts.init(orbit_2028, "dark");

                option2 = {
                    title: {
                        text: 'Orbit Distribution of Space Population in 2028',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: ["LEO", "MEO", "GEO", "HEO", "Unknown"],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 15000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: [
                            { value: LEO_num2, itemStyle: { color: "#ee8026" } },
                            { value: MEO_num2, itemStyle: { color: '#bdbf47' } },
                            { value: GEO_num2, itemStyle: { color: '#5ec491' } },
                            { value: HEO_num2, itemStyle: { color: '#3399FF' } },
                            { value: unknown_num2, itemStyle: { color: "#a9a9a9" } }
                        ]
                    }
                };
                orbit_2028_ini.clear();
                option2 && orbit_2028_ini.setOption(option2);
                data_load2 = true;
            }
            else if (selected_orbit == "pie chart") {


                // initialize the echart
                let orbit_2028 = document.getElementById('orbit_2028');
                let orbit_2028_ini = echarts.init(orbit_2028, "dark");

                option2 = {
                    title: {
                        text: 'Orbit Distribution of Space Population in 2028',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: LEO_num2, name: 'LEO', itemStyle: { color: '#ee8026' } },
                                { value: MEO_num2, name: 'MEO', itemStyle: { color: '#bdbf47' } },
                                { value: GEO_num2, name: 'GEO', itemStyle: { color: '#5ec491' } },
                                { value: HEO_num2, name: 'HEO', itemStyle: { color: '#3399FF' } },
                                { value: unknown_num2, name: 'Unknown', itemStyle: { color: '#a9a9a9' } }
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                orbit_2028_ini.clear()
                option2 && orbit_2028_ini.setOption(option2);
            }

            if (selected_status == "pie chart") {
                // initialize the echart
                let status_2028 = document.getElementById('status_2028');
                let status_2028_ini = echarts.init(status_2028, "dark");


                option2 = {
                    title: {
                        text: 'Operatiuonal Status Distribution of Space Population in 2028',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: operational_list2["Operational"], name: 'Operational', itemStyle: { color: '#66FF66' } },
                                { value: operational_list2["Non-operational"], name: 'Non-operational', itemStyle: { color: '#FF6666' } },
                                { value: operational_list2["Partially operational"], name: 'Partially operational', itemStyle: { color: '#FFB266' } },
                                { value: operational_list2["Backup/Standby"], name: 'Backup/Standby', itemStyle: { color: '#66FFB2' } },
                                { value: operational_list2["Spare"], name: 'Spare', itemStyle: { color: '#66FFFF' } },
                                { value: operational_list2["Extened mission"], name: 'Extened mission', itemStyle: { color: '#B266FF' } },
                                { value: operational_list2["Decayed"], name: 'Decayed', itemStyle: { color: '#FFFF66' } },
                                { value: operational_list2["Unknown"], name: 'Unknown', itemStyle: { color: '#808080' } },
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                status_2028_ini.clear();
                option2 && status_2028_ini.setOption(option2);
                data_load2 = true


            }
            else if (selected_status == "histogram") {
                // initialize the echart
                let status_2028 = document.getElementById('status_2028');
                let status_2028_ini = echarts.init(status_2028, "dark");

                option2 = {
                    title: {
                        text: 'Operational Status Distribution of Space Population in 2028',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: ["Operational", "Non-operational", "Partially operational", "Backup/Standby", "Spare", "Extened mission","Decayed", "Unknown"],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            },
                            rotate: 30,
                        },
                        
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 11000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: [
                            { value: operational_list2["Operational"], itemStyle: { color: '#66FF66' }},
                            { value: operational_list2["Non-operational"], itemStyle: { color: '#FF6666' } },
                            { value: operational_list2["Partially operational"], itemStyle: { color: '#66FFB2' } },
                            { value: operational_list2["Backup/Standby"], itemStyle: { color: '#66FFB2' } },
                            { value: operational_list2["Spare"], itemStyle: { color: '#66FFFF' } },
                            { value: operational_list2["Extened mission"], itemStyle: { color: '#B266FF' } },
                            { value: operational_list2["Decayed"], itemStyle: { color: '#FFFF66' } },
                            { value: operational_list2["Unknown"], itemStyle: { color: '#808080' } },
                        ]
                    }
                };
                status_2028_ini.clear();
                option2 && status_2028_ini.setOption(option2);
                data_load2 = true;
            }
        }

    }, 1000);




    setInterval(function () {
        if (satcat3.data_load_complete == true && data_load3 == false) {
            for (let debrisID = 0; debrisID < satcat3.getNumberTotal(); debrisID++) {
                let operation_status3 = satcat3.getDebriOperation_status("isat", debrisID);
                let sat_category3 = satcat3.getDebriCategory(debrisID);
                let cross_section3 = satcat3.getDebriCross_Section(debrisID);
                let country3 = satcat3.getDebriCountry(debrisID);
                let sat_infor3 = satcat3.getDebriInfo(debrisID);
                let sat_name3 = satcat3.getDebriName(debrisID).trim();
                let sat_Id3 = satcat3.getDebriID(debrisID).trim();
                let sat_type3 = satcat3.getDebriType(debrisID).trim();
                let sat_sma3 = satcat3.getSemiMajorAxis(debrisID);
                let apogee3 = parseFloat(satcat3.getApogee(debrisID));
                let perigee3 = parseFloat(satcat3.getPerigee(debrisID));
                let height3 = avg(apogee3, perigee3);
                let index3 = Math.floor((height3 - 160) / 10);


                /* Code for the table */
                if (operation_status3 == operation_status3 !== "Decayed" && operation_status3 !== "Non-operational" && operation_status3 !== "Unknown") {
                    active3 += 1;
                } else {
                    inactive3 += 1;
                }

                if (sat_category3 == "Low Earth Orbit") {
                    if (operation_status3 !== "Decayed" && operation_status3 !== "Non-operational" && operation_status3 !== "Unknown") {
                        results_active3.push([
                            height3,
                            Math.random()
                        ]);
                        if (index3 >= 0 && index3 < 184) {
                            results_active3_hist[index3].number++;
                        }
                    } else {
                        results_inactive3.push([
                            height3,
                            Math.random()
                        ])
                        if (index3 >= 0 && index3 < 184) {
                            results_inactive3_hist[index3].number++;
                        }
                    }
                }

                /* Code for the owner part*/

                // Check country
                if (country3 in ownershipList3) {
                    // 如果已经在列表中，增加其值
                    ownershipList3[country3] += 1;
                } else {
                    // 如果还不在列表中，将其值设为1
                    ownershipList3[country3] = 1;

                }

                /* Code for the Orbit*/
                if (sat_category3 == "Low Earth Orbit") {
                    LEO_num3 += 1;
                } else if (sat_category3 == "Middle Earth Orbit") {
                    MEO_num3 += 1;
                } else if (sat_category3 == "Geosynchronous Equatorial Orbit") {
                    GEO_num3 += 1;
                } else if (sat_category3 == "Highly Elliptical Orbit") {
                    HEO_num3 += 1;
                } else if (sat_category3 == "Unknown") {
                    unknown_num3 += 1;
                }

                /* Code for the status part*/
                if (operation_status3 in operational_list3) {
                    // if in the list add 1
                    operational_list3[operation_status3] += 1;
                } else {
                    // if not in the list, set 1
                    operational_list3[operation_status3] = 1;
                }
                /*End of code for status part*/

            } // end of for loop
            
            let all_43 = document.getElementById("all-43")
            let act_43 = document.getElementById("act-43")
            let inact_43 = document.getElementById("inact-43")
            all_43.innerHTML = satcat3.getNumberTotal();
            act_43.innerHTML = active3;
            inact_43.innerHTML = inactive3;

            let entries = Object.entries(ownershipList3);
            entries.sort((a, b) => b[1] - a[1]);

            for (let i = 0; i < 4; i++) {
                ownerdata3.push(
                    {
                        value: entries[i][1],
                        name: entries[i][0]
                    }
                )
            }

            for (let i = 4; i < entries.length; i++) {
                otherCountries3 += entries[i][1]
            }
            ownerdata3.push(
                {
                    value: otherCountries3,
                    name: "Other Countries"
                }
            )

            data_load3 = true;

            if (selected_height == "scatter plot") {
                let height_2043 = document.getElementById('height_2043');
                let height_2043_ini = echarts.init(height_2043, "dark");

                option3 = {
                    title: {
                        text: 'Distribution of Future Space Population by Height in 2043',
                        left: 'center',
                        padding: [20, 0, 0, 0] // 设置标题的上内边距为20，其他方向为0
                    },
                    legend: {
                        right: '5%',  // 10% from the right
                        top: '5%'  // 5% from the top
                    },
                    xAxis: {
                        type: 'value',
                        name: 'Height (km)', // X-axis label
                        min: 160,
                        max: 2000,
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [10, 0, 0, 0]
                        }
                    },
                    yAxis: {},
                    backgroundColor: "#1F2A40",
                    grid: {
                        left: '5%', // 将图表左侧空白缩小为容器宽度的 2%
                        right: '5%', // 将图表右侧空白缩小为容器宽度的 2%
                    },
                    series: [
                        {
                            symbolSize: 3,
                            data: results_active3,
                            type: 'scatter',
                            color: ["#00CC00"],
                            name: "Active"
                        },
                        {
                            symbolSize: 3,
                            data: results_inactive3,
                            type: 'scatter',
                            color: ["#FF3333"],
                            name: "Inactive"
                        }
                    ]
                };
                height_2043_ini.clear();
                option3 && height_2043_ini.setOption(option3);
            }
            else if (selected_height == "histogram") {
                let height_2043 = document.getElementById('height_2043');
                let height_2043_ini = echarts.init(height_2043, "dark");



                // 遍历 results_active_hist 和 results_inactive_hist
                for (let i = 0; i < results_active3_hist.length; i++) {
                    // ge the range
                    let range3 = results_active3_hist[i].height;

                    // 获取当前区间的 active 和 inactive 数据
                    let active3 = results_active3_hist[i].number;
                    let inactive3 = results_inactive3_hist[i].number;

                    // 将当前区间的数据添加到 source 数组
                    source3.push([range3, active3, inactive3]);

                }




                option3 = {
                    title: {
                        text: 'Distribution of Future Space Population by Height in 2043',
                        left: 'center',
                        padding: [20, 0, 0, 0] // 设置标题的上内边距为20，其他方向为0
                    },
                    xAxis: {
                        type: 'category',
                        name: 'Height (km)', // X-axis label
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [10, 0, 0, 0]
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Counting', // Y-axis label
                        min: 0,
                        max: 1600,
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 16,
                            padding: [0, 0, 25, 0]
                        },
                        splitNumber: 10

                    },
                    backgroundColor: "#1F2A40",
                    grid: {
                        left: '5%', // 将图表左侧空白缩小为容器宽度的 2%
                        right: '5%', // 将图表右侧空白缩小为容器宽度的 2%
                    },
                    legend: {
                        right: '5%',  // 10% from the right
                        top: '5%'  // 5% from the top
                    },
                    tooltip: {},
                    dataset: {
                        source: source3
                    },

                    // Declare several bar series, each will be mapped
                    // to a column of dataset.source by default.
                    series: [{ type: 'bar', color: ["#00CC00"] }, { type: 'bar', color: ["#FF3333"] }]
                };
                height_2043_ini.clear();
                option3 && height_2043_ini.setOption(option3);
                console.log(source3)

            }

            // code for the plot of pie chart (owner)
            if (selected_owner == "pie chart") {

                // initialize the echart
                let owner_2043 = document.getElementById('owner_2043');
                let owner_2043_ini = echarts.init(owner_2043, "dark");

                option3 = {
                    title: {
                        text: 'Ownership Distribution of Space Population in 2043',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: ownerdata3,
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                owner_2043_ini.clear()
                option3 && owner_2043_ini.setOption(option3);
            }
            else if (selected_owner == "histogram") {
                // initialize the echart
                let owner_2043 = document.getElementById('owner_2043');
                let owner_2043_ini = echarts.init(owner_2043, "dark");
                console.log("its histogram")
                let values3 = ownerdata3.map(item => item.value);
                let names3 = ownerdata3.map(item => item.name);

                let names3Formatted = names3.map(name => {
                    if (name === "Commonwealth of Independent States (former USSR)") {
                        // 对特定字符串进行处理，并插入换行符
                        return "Commonwealth of\nIndependent States\n(former USSR)";
                    }
                    if (name === "People's Republic of China") {
                        return "People's Republic\nof China";
                    }
                    return name; // 如果不是特定字符串，返回原始字符串
                });


                option3 = {
                    title: {
                        text: 'Ownership Distribution of Space Population in 2023',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: names3Formatted,
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 10000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: values3
                    }
                };
                owner_2043_ini.clear();
                option3 && owner_2043_ini.setOption(option3);
                data_load3 = true;
            }

            if (selected_orbit == "histogram") {
                // initialize the echart
                let orbit_2043 = document.getElementById('orbit_2043');
                let orbit_2043_ini = echarts.init(orbit_2043, "dark");

                option3 = {
                    title: {
                        text: 'Orbit Distribution of Space Population in 2043',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: ["LEO", "MEO", "GEO", "HEO", "Unknown"],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 15000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: [
                            { value: LEO_num3, itemStyle: { color: "#ee8026" } },
                            { value: MEO_num3, itemStyle: { color: '#bdbf47' } },
                            { value: GEO_num3, itemStyle: { color: '#5ec491' } },
                            { value: HEO_num3, itemStyle: { color: '#3399FF' } },
                            { value: unknown_num3, itemStyle: { color: "#a9a9a9" } }
                        ]
                    }
                };
                orbit_2043_ini.clear();
                option3 && orbit_2043_ini.setOption(option3);
                data_load3 = true;
            }
            else if (selected_orbit == "pie chart") {


                // initialize the echart
                let orbit_2043 = document.getElementById('orbit_2043');
                let orbit_2043_ini = echarts.init(orbit_2043, "dark");

                option3 = {
                    title: {
                        text: 'Orbit Distribution of Space Population in 2043',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: LEO_num3, name: 'LEO', itemStyle: { color: '#ee8026' } },
                                { value: MEO_num3, name: 'MEO', itemStyle: { color: '#bdbf47' } },
                                { value: GEO_num3, name: 'GEO', itemStyle: { color: '#5ec491' } },
                                { value: HEO_num3, name: 'HEO', itemStyle: { color: '#3399FF' } },
                                { value: unknown_num3, name: 'Unknown', itemStyle: { color: '#a9a9a9' } }
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                orbit_2043_ini.clear()
                option3 && orbit_2043_ini.setOption(option3);
            }

            if (selected_status == "pie chart") {
                // initialize the echart
                let status_2043 = document.getElementById('status_2043');
                let status_2043_ini = echarts.init(status_2043, "dark");


                option3 = {
                    title: {
                        text: 'Operatiuonal Status Distribution of Space Population in 2043',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'horizontal', // 设置图例为水平排列
                        left: 'center',       // 将图例居中
                        top: 'bottom'         // 将图例放置在底部
                    },
                    backgroundColor: "#1F2A40",
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: operational_list1["Operational"], name: 'Operational', itemStyle: { color: '#66FF66' } },
                                { value: operational_list1["Non-operational"], name: 'Non-operational', itemStyle: { color: '#FF6666' } },
                                { value: operational_list1["Partially operational"], name: 'Partially operational', itemStyle: { color: '#FFB266' } },
                                { value: operational_list1["Backup/Standby"], name: 'Backup/Standby', itemStyle: { color: '#66FFB2' } },
                                { value: operational_list1["Spare"], name: 'Spare', itemStyle: { color: '#66FFFF' } },
                                { value: operational_list1["Extened mission"], name: 'Extened mission', itemStyle: { color: '#B266FF' } },
                                { value: operational_list1["Decayed"], name: 'Decayed', itemStyle: { color: '#FFFF66' } },
                                { value: operational_list1["Unknown"], name: 'Unknown', itemStyle: { color: '#808080' } },
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                status_2043_ini.clear();
                option3 && status_2043_ini.setOption(option3);
                data_load3 = true
            }
            else if (selected_status == "histogram") {
                // initialize the echart
                let status_2043 = document.getElementById('status_2043');
                let status_2043_ini = echarts.init(status_2043, "dark");

                option3 = {
                    title: {
                        text: 'Operational Status Distribution of Space Population in 2043',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },

                    label: {
                        show: true, // 显示标签
                        position: 'top', // 标签的位置，'top' 表示在柱顶部
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: ["Operational", "Non-operational", "Partially operational", "Backup/Standby", "Spare", "Extened mission","Decayed", "Unknown"],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 10
                            },
                            rotate: 30,
                        },
                        
                    }],
                    yAxis: [{
                        type: 'value',
                        max: 11000,
                        name: "Counting",
                        nameLocation: 'center', // 将x轴标签居中对齐
                        nameTextStyle: {
                            fontWeight: 'bold', // 加粗x轴标签文本
                            fontSize: 15,
                            padding: [0, 0, 25, 0]
                        },
                    }],
                    backgroundColor: "#1F2A40",
                    series: {
                        type: "bar",
                        barWidth: '60%',
                        data: [
                            { value: operational_list3["Operational"], itemStyle: { color: '#66FF66' }},
                            { value: operational_list3["Non-operational"], itemStyle: { color: '#FF6666' } },
                            { value: operational_list3["Partially operational"], itemStyle: { color: '#66FFB2' } },
                            { value: operational_list3["Backup/Standby"], itemStyle: { color: '#66FFB2' } },
                            { value: operational_list3["Spare"], itemStyle: { color: '#66FFFF' } },
                            { value: operational_list3["Extened mission"], itemStyle: { color: '#B266FF' } },
                            { value: operational_list3["Decayed"], itemStyle: { color: '#FFFF66' } },
                            { value: operational_list3["Unknown"], itemStyle: { color: '#808080' } },
                        ]
                    }
                };
                status_2043_ini.clear();
                option3 && status_2043_ini.setOption(option3);
                data_load3 = true;
            }

        }

    }, 1000);



}

function avg(num1, num2) {
    return (num1 + num2) / 2
}