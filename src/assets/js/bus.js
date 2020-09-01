// 发布订阅：


// 使用手册：

// ----app.js:

// import Bus from '/utils/bus.js';
// wx.$bus = new Bus();


// -----页面使用：

//监听：

// wx.$bus.on('name', (options) => {
//     console.info('options', options);
// });


// 触发：

// wx.$bus.emit('name', (options) => {
//     console.info('options', options);
// });


//移除：

// wx.$bus.off('name');


class CommonBus {
    constructor() {
        this.busList = [];
    };

    on(messName, cb) {
        this.busList.push({
            name: messName,
            cb
        });
    };

    off(messName) {
        let _busList = this.busList;

        _busList.forEach(item => {
            if (item.name === messName) {
                item.isRemove = true;
            }
        });

        this.busList = _busList.filter(item => item.isRemove !== true);
    };

    emit(messName, data) {
        this.busList.forEach(item => {
            if (item.name === messName) {
                item.cb(data);
            }
        });
    };
}



// 使用手册：

// ----app.js:

// import Bus from '/utils/bus.js';
// wx.$bus_unique = new Bus();


// -----页面使用：

//监听：

// wx.$bus_unique.on('name', 'uniqueID', (options) => {
//     console.info('options', options);
// });


// 触发：

// wx.$bus_unique.emit('name', (options) => {
//     console.info('options', options);
// });


//移除：

// wx.$bus_unique.off('name'); 移除全部
// wx.$bus_unique.off('name', uniqueID); 移除单一个监听

class UniqueBus {
    constructor() {
        this.busListObj = {};
    }

    on(busName, uniqueID, cb) {
        const currentBus = this.busListObj[busName] || (this.busListObj[busName] = {});
        currentBus[uniqueID] = cb;
    }

    off(busName, uniqueID) {
        let _busListObj = this.busListObj;

        for (let key in _busListObj) {
            if (busName === key) {
                uniqueID ? delete _busListObj[key][uniqueID] : delete _busListObj[key]
            }
        }
    }

    emit(busName, data) {
        const myBusObj = this.busListObj[busName];

        console.info('myBusObj', myBusObj);

        for (let key in myBusObj) {
            myBusObj[key](data);
        }
    }
}


export {
    CommonBus,
    UniqueBus,
}