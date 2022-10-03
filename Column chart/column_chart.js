const currentDate = new Date(getCurrentDate());
const msInDay = 86400000;

let index_arr = []; 

w.data.rows = w.data.rows.filter((item, index) => {

    if(item[0] === '<Пусто>'){
        index_arr.push(index);
        return false;
    }
    else return true;
    
});

index_arr.forEach((item, index) => w.data.values[0].splice(item-index, 1));

let dayCountofUsage = w.data.rows.map(item => {
    
    let date_arr = item[1].split('-').reverse(); //[day, month, year]
    let date = new Date(+date_arr[2], +date_arr[1], +date_arr[0]);
    return (currentDate.getTime() - date.getTime()) / msInDay;
    
});

w.data.values[0] = w.data.values[0].map((item, index)=>{
   return item - dayCountofUsage[index]; 
});

let val_index = w.data.values[0].map((item, index) => [item, index]);
let row_index = w.data.rows.map((item, index) => [item, index]);

val_index.sort(function(a, b){
        return a[0] - b[0];
});

let data = val_index.map(item => {
    let value = {};
    value.y = item[0];
    value.colorValue = getColorValue(value.y);
    return value;
});

let categories = [];
val_index.forEach(item => {
    let arr = w.data.rows[item[1]];
    arr[1] = arr[1].split('-').join('/');
    categories.push(arr.join(' - '));
});

Highcharts.chart({
    chart:{
        style:{
            fontFamily: 'Open Sans'
        },
        renderTo: w.general.renderTo
    },
    title: {
        text: 'Остаток дней до конца срока ТО (Запчасти)'
    },
    xAxis: {
        categories: categories
    },
    colorAxis: {
        minColor: '#ff0000',
        maxColor: '#98fb98',
        min: 0,
        max: 3
    },
    series: [ {
        type: 'column',
        colorKey: 'colorValue',
        name: 'Остаток дней до конца срока',
        data:  data,
        dataLabels: {
                enabled: true,
                format: '{y} дней',
                style:{
                    fontSize: '15px',
                }
        }
    }],

});

function getCurrentDate(){ 
    
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    
    return mm + '/' + dd + '/' + yyyy;
}

function getColorValue(y){
    switch(true){
        case (y <= 0):
            return 0;
        case (y <= 15 && y > 0):
            return 1;
        case (y <= 60 && y > 15):
            return 2;
        case (y < Infinity && y > 60):
            return 3;
    }
}
