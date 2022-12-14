const button = 
'<div style="border-top:2px solid #dcdcdc; position:absolute; bottom:0; width:100%; height:50px; display: inline-flex; justify-content: center; background: white ">' +
'<button class= button; id=mybutton style="background: #ffffff; height: 36.8px; border-radius: 5px; margin-top: 5px; border-color: rgba(27, 20, 100, 0.9); border-width: 2.4px; font-size: 12px;' +
'padding:8px 7px; text-decoration:none; font-family: Open Sans; font-weight: 700; color: rgba(27, 20, 100, 1 )">Сброс выборок</button></div>';

let countDim = {
   
    'День': w.data.values[0][0],

    'Цех': w.data.values[1][0],
    'Корпус': w.data.values[2][0],
    'Отделение': w.data.values[3][0],
    'Помещение': w.data.values[4][0],

    'Работник':  w.data.values[5][0],
    'Номер заявки':  w.data.values[6][0],
    'Статус ремонта':  w.data.values[7][0],
    'Номер запчасти':  w.data.values[8][0],
    'Запчасти': w.data.values[9][0],
    'Тип О':  w.data.values[10][0],
    'Причина отказа':  w.data.values[11][0],
        
};

const defaultkeys = ['Дата расхода ', 'Помещение ', 'Отделение ', 'Цех ', 'Корпус ', 'Работник ', 'Номер заявки ', 'Статус ремонта ', 'Номер запчасти ', 'Запчасти ', 'Тип О ', 'Причина отказа ', 'Вид ремонта ']; //названий фильтров для поиска
const calendarName = ['Год', 'Квартал', 'Месяц', 'Дата'];

let filtersGuids;
let result = [];
let keys;

let monthObj = {
    
    'Сентябрь':'09',
    'Октябрь':'10',
    'Ноябрь':'11',
    'Декабрь':'12',
    'Январь':'01',
    'Февраль':'02',
    'Март':'03',
    'Апрель':'04',
    'Май':'05',
    'Июнь':'06',
    'Июль':'07',
    'Август':'08'
    
};

firstLoad();

function getSelections(){
    
    keys = Object.keys(localStorage);
    keys = defaultkeys.filter(item => keys.includes(item, 0));
    
    for(let key of keys){
        
        if(key === 'Дата расхода ' || key === 'Календарь ' || key === 'Период анализа ' || key === 'Период сравнения ') {
            
            let calendarString = localStorage.getItem(key).substr(18).replace(/(",")/gm,'-').replace(/[\[|\]|{|}|"]/gm,'').split(',');
            let calendarValue = calendarString.map(item => item.split('-'));
            result.push(resStringCalendar(key, calendarValue).join('')+'<br>');
            
        } 
        else {
            result.push(resString(key, localStorage.getItem(key).substr(18).replace(/[\[|\]|{|}|"]/gm,'')));
        }
    }
    
}

function resString(key, value){
    
    if(value.trim().length === 0){
        return null;
    }
    else 
        if(value.split(',').length < 4){
            return '<div style=width:300px;margin-left:10px;margin-top:8px><a>' + key.trim() + ': ' + '</a>' + '<a style=color:rgba(5,18,110,0.9)>' + value.split(',').join(', ') + '.'+'</a></div>';
        }
            else {
                return '<div style=width:300px;margin-left:10px;margin-top:8px><a>' + key.trim() + ': ' + '</a>' + '<a style=color:grey>' + value.split(',').length + ' из ' + countDim[key.trim()] + '.'+ '</a></div>';
            }
            
}

function resStringCalendar(key, value){
    
    let calendar = [[], [], [], []];
    
    value.forEach(item=>{
        
        switch(item.length){
            
            case 1:
                calendar[0].push(item.join(''));
                break;
                
            case 2:
                calendar[1].push(item.join('-')+' кв.');
                break;
                
            case 3:
                calendar[2].push(item[2].slice(0,3)+'.'+'- '+item[0]);
                break;
                
            case 4:
                calendar[3].push(item[3]+'.' + monthObj[item[2]]+'.' + item[0]);
                break;
        
        }  
        
    });
    
    calendar = calendar.map((item, index) => item = resString(calendarName[index], item.join(',')) );

    let res_calendar = calendar.filter(item=>item !== '<br>'+null);
    
    res_calendar.join('').length === 0 
    ? res_calendar.unshift('<div style=width:300px;margin-left:10px;margin-top:8px><a style=color:rgb(102,205,170)>' + key.trim() + ': Весь' + '</a></div>') 
    : res_calendar.unshift('<div style=width:300px;margin-left:10px;margin-top:8px><a style=color:rgb(102,205,170)>' + key.trim() + ':' + '</a></div>');
    
    
    return res_calendar;
    
}

function setListeners(){
    
    const filtersGuids = visApi().getWidgets().filter(item => item.widgetState.type === "Filter").map(item=>item.w.general.renderTo);
            
    filtersGuids.forEach(item => {
                
        visApi().onSelectedValuesChangedListener({guid: item + w.general.renderTo , widgetGuid: item}, function (info){
            
            let key = visApi().getWidgetByGuid(item).widgetState.title.text.trim() + ' ';
            
            if(key === 'Дата расхода ' || key === 'Календарь ' || key === 'Период анализа ' || key === 'Период сравнения ') {
            
                let value = visApi().getWidgetByGuid(item).widgetState.selectedFilterValues.values;
                let index = keys.indexOf(key, 0);
                let calendarValue = resStringCalendar(key, value).join('')+'<br>';
                result[index] = calendarValue;
            
            } 
            else {
                let value = visApi().getWidgetByGuid(item).widgetState.selectedFilterValues.values.join(',');
                let index = keys.indexOf(key, 0);
                result[index] = resString(key, value);
            }
            
            render();
            
        });
        
    });
    
}

function render(){
    
    let text = result.filter(item => item !== null);
    
    w.general.text = '<br>' + text.join('') +'<br>' + button + '<br><br>';
    
    TextRender({
        text: w.general,
        style: w.style
    });
    
    $('button').hover(
     function() {
         $(this).css({'background': '#EFF4FE', 'cursor': 'pointer', 'transition': '0.2s'});
      },
     function() {
         $(this).css({'background': '#ffffff', 'transition': '0.2s' });
     
    });
    
    setClick();
    
}

function setClick(){
    
    let button = document.getElementById("mybutton");
    
    button.onclick = function() {
        for (let i of filtersGuids){
            visApi().setFilterSelectedValues(i, [], function (response) {});
        }
    };
    
}

visApi().onAllWidgetsLoadedListener({guid: w.general.renderTo + 'All'}, function(){
    
    setListeners();
    setFilterGuid();
    
});

function firstLoad(){
    
    getSelections();
    render();
    
}

function setFilterGuid(){
    filtersGuids = visApi().getWidgets().filter(item => {
        if(item.widgetState.type === "Filter" && defaultkeys.indexOf(item.widgetState.title.text) !== -1) return true;
        }).map(item=>item.w.general.renderTo);
}

