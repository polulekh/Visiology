const filterDim = '231fe510429245a49d254ec651abd398';
const dimension = 'Работники';
let flag;
let firstLoadFlag = 0;
let xCategories = [];
let yCategories = [];
let data;

function preRender(){

    let rows = [...new Set(w.data.rows)];
    
    let values = w.data.values[0].map((item, index) =>{
        return [item, rows[index][0], rows[index][1]];
    });
    
    rows = rows.sort((a, b) => {
       if (a[1] < b[1]) return -1;
       if (a[1] > b[1]) return 1;
       return 0;
    });
    
    yCategories = [...new Set(rows.map(item=>item[1]))];
    
    rows = rows.sort((a, b) => {
       if (a[0] < b[0]) return -1;
       if (a[0] > b[0]) return 1;
       return 0;
    });
    
    xCategories = [...new Set(rows.map(item=>item[0]))];
    
    data = [];
    
    xCategories.forEach((x, x_index) => {
        
        let filtered_arr = values.filter(value => value[1] === x);
        let filtered_val = filtered_arr.map(item => item.join(', ')).join(', ').split(', ');
        
        filtered_arr = filtered_arr.map(arr => [x_index, yCategories.indexOf(arr[2]), arr[0]]);
        
        yCategories.forEach((y, y_index) => {
            if (filtered_val.indexOf(y) === -1) filtered_arr.push([x_index, y_index, 0]);
        });
        
        filtered_arr.sort((a, b) => {
           if (a[1] < b[1]) return -1;
           if (a[1] > b[1]) return 1;
           return 0;
        });
        
        data.push(...filtered_arr);
        
    });
    
}

function firstLoad(){
    
    if(dimension == visApi().getWidgetByGuid(filterDim).widgetState.selectedFilterValues.values[0][0]) {
        flag = 1;
        firstLoadFlag = 1;
        preRender();
        render();
    }
    else {
        flag = 0;
        document.body.querySelector('#widget-'+w.general.renderTo).style.visibility = 'hidden';
    }
    
}

firstLoad();

function getPointCategoryName(point, dimension) {
    var series = point.series,
        isY = dimension === 'y',
        axis = series[isY ? 'yAxis' : 'xAxis'];
    return axis.categories[point[isY ? 'y' : 'x']];
}

function render(){
    Highcharts.chart({
    
        chart: {
            renderTo: w.general.renderTo,
            type: 'heatmap',
            marginTop: 40,
            marginBottom: 120,
            plotBorderWidth: 1
        },
    
    
        title: {
            text: 'Расход запчастей по работникам',
            style: {
                    color: 'black',
                    fontSize:'20px',
                   
                }
        },
    
        xAxis: {
            categories: xCategories,
            labels: {
                style: {
                    color: 'black',
                    fontSize:'15px',
                    
                }
            }
        },
    
        yAxis: {
            categories: yCategories,
            title: null,
            reversed: true,
            labels: {
                style: {
                    color: 'black',
                    fontSize:'15px'
                }
            }
        },
    
        accessibility: {
            point: {
                descriptionFormatter: function (point) {
                    var ix = point.index + 1,
                        xName = getPointCategoryName(point, 'x'),
                        yName = getPointCategoryName(point, 'y'),
                        val = point.value;
                    return ix + '. ' + xName + ' sales ' + yName + ', ' + val + '.';
                }
            }
        },
    
        colorAxis: {
            min: 0,
            minColor: '#FFFFFF',
            maxColor: Highcharts.getOptions().colors[0]
        },
    
        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 5,
            symbolHeight: 280,
        },
    
        tooltip: {
            formatter: function () {
                return 'Работник <b>' + getPointCategoryName(this.point, 'y') + '</b> израсходовал <br><b>' +
                    this.point.value + '</b> запчастей <b>' + getPointCategoryName(this.point, 'x') + '</b>';
            }
        },
    
        series: [{
            name: '',
            borderWidth: 1,
            data: data,
            dataLabels: {
                enabled: true,
                color: '#000000',
                style: {
                    color: '#000000',
                    fontSize:'16px'
                }
            },
        }],
    
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1000
                },
                chartOptions: {
                    yAxis: {
                        labels: {
                            formatter: function () {
                                return this.value.charAt(0);
                            }
                        }
                    }
                }
            }]
        }
    
    });
}

render();

visApi().onSelectedValuesChangedListener({guid: w.general.renderTo + filterDim, widgetGuid: filterDim }, function (filterInfo) {
    
    if (filterInfo.selectedValues[0][0] == dimension) {
        
        if (firstLoadFlag === 0) {
            preRender();
            render();
            firstLoadFlag = 1;
        }
        document.body.querySelector('#widget-'+w.general.renderTo).style.visibility = 'visible';
    	flag = 1;
    	
	}
    else {
    	flag = 0;
    	document.body.querySelector('#widget-'+w.general.renderTo).style.visibility = 'hidden';
	}
});
