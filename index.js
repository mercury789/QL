window.onerror = function (message, source, lineno, colno, error) {
   console.log('============= ERROR ============');
   console.error("ошибка:", message);
   console.error("стек:", error?.stack);
   console.log('============= ERROR ============');

};


function set(name, value) {
   localStorage.setItem(name, value)
}
function rem(name) {
   localStorage.removeItem(name)
}
function get(name) {

   return localStorage.getItem(name)
}
function clear() {
   localStorage.clear()
}
function log(info) {
   const err = new Error()
   const stackLine = err.stack.split('\n')[2] // третья строка — это место вызова
   const match = stackLine.match(/:(\d+):\d+\)?$/)
   const line = match ? match[1] : '?'

   document.querySelector('[data-log-body]').insertAdjacentHTML('beforeend', `
     <div data-log-point>
         <div data-log-info>${info}</div>
         <div data-log-span>${line}</div>
     </div>
   `)

   console.log(`${info} [${line}]`);

}





function waterTimer() {

   const end = get('waterEnd')

   if (end) {
      let left = (parseInt(end) - Date.now()) / 1000
      log('сталось секунд:', left)

      if (left <= 0) {
         left = 0
      }

      setTimeout(() => {

         log('etTimeout start');

         navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(`вода`)
         })

         get('waterEnd') && rem('waterEnd')




      }, left * 1000)

   }

}
waterTimer()



function taskTimer() {

   const end = get('taskEnd')

   if (end) {
      let left = (parseInt(end) - Date.now()) / 1000
      log('сталось секунд:', left)

      if (left <= 0) {
         left = 0
      }

      setTimeout(() => {

         const targ = document.querySelector('[data-shell]._taskEnd')

         if (targ) {

            log('etTimeout end');

            navigator.serviceWorker.ready.then(reg => {
               reg.showNotification(targ.querySelector('[data-text]').innerText)
            })

            get('taskEnd') && rem('taskEnd')

            const shellAll = document.querySelectorAll('[data-shell]')
            shellAll.forEach((shell) => {
               shell.classList.remove('_taskEnd')

            })

         }


      }, left * 1000)

   }

}
taskTimer()



import { videos } from './videos.js'

const memorySizes = {
   general: 30,
   absolute: 1,
   upgrade: 1,
   lose: 5,
   finance: 3,
}

var up = false

const ranks = [
   { min: 500, rank: 22 },  // 🏆
   { min: 365, rank: 21 },  // 🆎
   { min: 300, rank: 20 },  // 🅱️
   { min: 250, rank: 19 },  // 🅰️
   { min: 200, rank: 18 },  // 🔮
   { min: 180, rank: 17 },  // 🟪
   { min: 150, rank: 16 },  // 🟣
   { min: 120, rank: 15 },  // 💎
   { min: 100, rank: 14 },  // 🟦
   { min: 90, rank: 13 },   // 🔹
   { min: 75, rank: 12 },   // 3️⃣
   { min: 60, rank: 11 },   // 2️⃣
   { min: 50, rank: 10 },   // 1️⃣
   { min: 40, rank: 9 },    // 🟨
   { min: 30, rank: 8 },    // 🟡
   { min: 21, rank: 7 },    // 🔅
   { min: 14, rank: 6 },    // ◻️
   { min: 10, rank: 5 },    // ◽️
   { min: 7, rank: 4 },     // ▫️
   { min: 5, rank: 3 },     // 🔶
   { min: 3, rank: 2 },     // 🔸
   { min: 1, rank: 1 },     // 🟠
   { min: 0, rank: 0 }      // ❌
];

function downgradeMin(minValue) {
   // ищем первый ранг, чей min меньше чем текущий
   const lower = ranks.find(r => r.min < minValue)
   return lower ? lower : 0
}

let url = window.location.href;
// https://mercury789.github.io/ql/
log(url);

// url = 'https://mercury789.github.io/ql/'

const local = url === 'http://127.0.0.1:5501/' ? true : false

log(local);


if (local) {

   if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
         .then(() => log("sw зарегистрирован"))
         .catch(err => console.error("❌ Ошибка sw:", err))
   }

} else {

   if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ql/sw.js')
         .then(() => log("sw зарегистрирован"))
         .catch(err => console.error("❌ Ошибка sw:", err))
   }

}

if (Notification.permission !== "granted") {
   Notification.requestPermission().then(permission => {
      if (permission === "granted") {
         log("разрешение на уведомления получено")
      } else {
         log("разрешение на уведомления отклонено")
      }
   })
}

// загружаем из localStorage
function loadMemory(mode) {
   const raw = localStorage.getItem(`memory_${mode} `)
   return raw ? JSON.parse(raw) : []
}

// сохраняем в localStorage
function saveMemory(mode, memory) {
   localStorage.setItem(`memory_${mode} `, JSON.stringify(memory))
}





function random(mode) {
   const max = videos[mode]
   let memorySize = memorySizes[mode] || 1
   if (memorySize >= max) memorySize = max - 1

   let memory = loadMemory(mode)

   const options = []
   for (let i = 1; i <= max; i++) {
      if (!memory.includes(i)) options.push(i)
   }

   if (options.length === 0) {
      memory.splice(0, memory.length - 1) // оставим последний
      for (let i = 1; i <= max; i++) {
         if (!memory.includes(i)) options.push(i)
      }
   }

   const src = options[Math.floor(Math.random() * options.length)]

   memory.push(src)
   if (memory.length > memorySize) memory.shift()

   saveMemory(mode, memory)

   log(`${mode} MEMORY: ${memory}`)
   return src
}

function video(mode) {
   let src = random(mode)
   // src = 62
   log(`SELECTED: ${src}`)

   const videoElement = document.querySelector('[data-video]');
   if (videoElement && document.querySelector('[data-turn="edit"]').classList.contains('_active')) {
      const source = videoElement.querySelector('source');

      // Устанавливаем новый источник видео
      source.setAttribute('src', `video/${mode}/${src}.mp4`);

      // Загружаем видео
      videoElement.load();

      // Слушаем событие загрузки данных видео
      videoElement.onloadeddata = () => {
         // Меняем стиль видео, когда оно готово
         videoElement.style.opacity = '1';
         videoElement.style.pointerEvents = 'all';

         // Воспроизводим видео
         videoElement.play();
      };

      // Можно добавить тайм-аут, если видео загружается слишком медленно
      setTimeout(() => {
         if (videoElement.paused) {
            videoElement.play();
         }
      }, 1000); // 1000 мс задержка
   } else {
      log('эдиты выкл');
   }



   // set(mode, src) // если тебе надо сохранять куда-то ещё
}

function rang(num) {
   if (num <= 0) return 0; // Обработка случаев, когда num <= 0
   const step = 4.3;
   const src = Math.ceil(num / step) - 1; // Вычисляем нужный индекс
   return Math.min(src, 22); // Ограничиваем максимум до 22 (для num > 94.6)
}
function bgRang(num) {
   if (num <= 0) return 0;

   const thresholds = [4.3, 17.2, 30.1, 43.0, 55.9, 68.8, 81.7, 94.6];

   for (let i = 0; i < thresholds.length; i++) {
      if (num < thresholds[i]) {
         return i; // Убираем +1, чтобы соответствовать диапазонам
      }
   }

   return thresholds.length; // Если num больше всех порогов
}

if (get('bgRang')) {

   document.querySelector('body').style = get('bgRang')
}

var initialDateStr = new Date().toUTCString();

var ctx = document.getElementById('chart').getContext('2d');
ctx.canvas.width = 1000;
ctx.canvas.height = 700;

var ctx2 = document.getElementById('chart2').getContext('2d');
ctx2.canvas.width = 1000;
ctx2.canvas.height = 700;

var ctx3 = document.getElementById('chart3').getContext('2d');
ctx3.canvas.width = 1000;
ctx3.canvas.height = 700;

if (get('burger') && get('burger') !== 'undefined') {
   document.querySelector('[data-burger]').innerHTML = get('burger')

}

if (document.querySelector('[data-log-body]')) {
   document.querySelector('[data-log-body]').innerHTML = ''
}


if (get('barData') && JSON.parse(get('barData')).length !== 0) {
   document.querySelector('[data-start]')?.remove();

   var barData = JSON.parse(get('barData'));
   log(`barData: ${JSON.stringify(barData)}`);

   if (barData.length === 37) {
      barData.shift()
   }

   let endObj = barData[barData.length - 1];
   let oldProcent = endObj.c;
   log(`endObj: ${JSON.stringify(endObj)}`);

   const pad = (n) => String(n).padStart(2, '0');

   const parseDateStr = (dateStr) => {
      const d = String(dateStr).padStart(8, '0');
      const day = Number(d.slice(0, 2));
      const month = Number(d.slice(2, 4)) - 1;
      const year = Number(d.slice(4));
      return new Date(year, month, day);
   };

   const formatDateStr = (date) => {
      return `${pad(date.getDate())}${pad(date.getMonth() + 1)}${date.getFullYear()}`;
   };

   const lastDate = parseDateStr(endObj.date);
   const today = new Date();

   const daysDiff = Math.floor((today - lastDate) / 86400000);

   log(`дата ласт бара: ${lastDate.toDateString()}`);
   log(`сегодня: ${today.toDateString()}`);
   log(`разница в днях: ${daysDiff}`);

   if (daysDiff > 0) {
      for (let i = 1; i <= daysDiff; i++) {
         const nextDate = new Date(lastDate.getTime() + i * 86400000);
         const nextDateStr = formatDateStr(nextDate);
         const newX = barData[barData.length - 1].x + 86400000;

         log(`добавляем бар за: ${nextDateStr}]`);

         barData.push({ x: newX, o: oldProcent, h: oldProcent, l: oldProcent, c: oldProcent, date: nextDateStr });

         log(`
            barData.push({ x: ${newX}, o: ${oldProcent}, h: ${oldProcent}, l: ${oldProcent}, c: ${oldProcent}, date: ${nextDateStr} });
            `);

      }

      if (barData.length === 3 && barData[0].date === '') {
         log('далён пустой первый бар');
         barData.shift();
      }

      set('barData', JSON.stringify(barData));
   } else {
      log('нет пропущенных дней, ничего не добавлено');
   }



} else {
   log('barData не найден или пуст');
   var barData = [];
}


if (get('barData2') && JSON.parse(get('barData2')).length !== 0) {
   document.querySelector('[data-money-start]')?.remove();

   var barData2 = JSON.parse(get('barData2'));
   log(`barData2: ${JSON.stringify(barData2)}`);


   if (barData2.length === 37) {
      barData2.shift()
   }

   let endObj = barData2[barData2.length - 1];
   let oldNum = endObj.c;
   oldNum = Number(oldNum.toFixed(2))

   // log('Последний бар barData2:', endObj);

   const pad = (n) => String(n).padStart(2, '0');

   const parseDateStr = (dateStr) => {
      const d = String(dateStr).padStart(8, '0');
      const day = Number(d.slice(0, 2));
      const month = Number(d.slice(2, 4)) - 1;
      const year = Number(d.slice(4));
      return new Date(year, month, day);
   };

   const formatDateStr = (date) => {
      return `${pad(date.getDate())}${pad(date.getMonth() + 1)}${date.getFullYear()}`;
   };

   const lastDate = parseDateStr(endObj.date);
   const today = new Date();

   const daysDiff = Math.floor((today - lastDate) / 86400000);

   log(`дата последнего бара barData2: ${lastDate.toDateString()}`);
   log(`сегодня: ${today.toDateString()}`);
   log(`разница в днях: ${daysDiff}`);

   if (daysDiff > 0) {
      for (let i = 1; i <= daysDiff; i++) {
         const nextDate = new Date(lastDate.getTime() + i * 86400000);
         const nextDateStr = formatDateStr(nextDate);
         const newX = barData2[barData2.length - 1].x + 86400000;

         log(`добавляем бар в barData2 за ${nextDateStr}]`);

         barData2.push({ x: newX, o: oldNum, h: oldNum, l: oldNum, c: oldNum, date: nextDateStr });

         log(`
            barData2.push({ x: ${newX}, o: ${oldNum}, h: ${oldNum}, l: ${oldNum}, c: ${oldNum}, date: ${nextDateStr} });
         `);
      }

      if (barData2.length === 3 && barData2[0].date === '') {
         log('удалён пустой первый бар в barData2]');
         barData2.shift();
      }

      set('barData2', JSON.stringify(barData2));
      log('barData2 обновлён и сохранён]');
   } else {
      log('нет пропущенных дней в barData2, ничего не добавлено');
   }

   document.querySelector('[data-money]').innerHTML = get('money');
   document.querySelector('[data-assets]').innerHTML = get('assets');

} else {
   log('barData2 не найден или пуст]');
   var barData2 = [];
   document.querySelector('[data-money-neg-add]').classList.add('_block');
   document.querySelector('[data-money-neg-add]').style.display = 'none';
   document.querySelector('[data-money-pos-add]').style = 'bottom: 60px; right: 10px;';
}

if (get('barData3') && JSON.parse(get('barData3')).length !== 0) {
   var barData3 = JSON.parse(get('barData3'));
   log(`barData3: ${JSON.stringify(barData3)}`);

   if (barData3.length === 37) {
      barData3.shift()
   }

   let endObj = barData3[barData3.length - 1];
   let oldNum = endObj.c;

   const pad = (n) => String(n).padStart(2, '0');

   const parseDateStr = (dateStr) => {
      const d = String(dateStr).padStart(8, '0');
      const day = Number(d.slice(0, 2));
      const month = Number(d.slice(2, 4)) - 1;
      const year = Number(d.slice(4));
      return new Date(year, month, day);
   };

   const formatDateStr = (date) => {
      return `${pad(date.getDate())}${pad(date.getMonth() + 1)}${date.getFullYear()}`;
   };

   const lastDate = parseDateStr(endObj.date);
   const today = new Date();
   const daysDiff = Math.floor((today - lastDate) / 86400000);

   if (daysDiff > 0) {
      for (let i = 1; i <= daysDiff; i++) {
         const nextDate = new Date(lastDate.getTime() + i * 86400000);
         const nextDateStr = formatDateStr(nextDate);
         const newX = barData3[barData3.length - 1].x + 86400000;

         barData3.push({ x: newX, o: oldNum, h: oldNum, l: oldNum, c: oldNum, date: nextDateStr });
      }

      if (barData3.length === 3 && barData3[0].date === '') {
         barData3.shift();
      }

      set('barData3', JSON.stringify(barData3));
   }

   if (get('noteBody')) {
      document.querySelector('[data-note-body]').innerHTML = get('noteBody');
   }

} else {
   var barData3 = [];

   const pad = (n) => String(n).padStart(2, '0');
   const today = new Date();
   const dateStr = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;
   const zero = 0;

   barData3.push({ x: Date.now() - 86400000, o: zero, h: zero, l: zero, c: zero, date: '' });
   barData3.push({ x: Date.now(), o: zero, h: zero, l: zero, c: zero, date: dateStr });

   set('barData3', JSON.stringify(barData3));
}


// var lineData = barData.map(data => ({ x: data.x, y: data.c }));
// var lineData2 = barData.map(data => ({ x: data.x, y: data.c }));
// var lineData3 = barData.map(data => ({ x: data.x, y: data.c }));

var chart = new Chart(ctx, {
   type: 'candlestick',
   data: {
      datasets: [

         {
            label: '',
            data: barData,
            borderColor: 'transparent'
         },


      ]
   }
});
var chart2 = new Chart(ctx2, {
   type: 'candlestick',
   data: {
      datasets: [
         {
            label: '',
            data: barData2,

            borderColor: 'transparent',
            backgroundColors: {
               up: 'rgba(255, 230, 2, 0.5)',
               down: 'rgba(255, 99, 132, 0.5)',
               unchanged: 'rgba(201, 203, 207, 0.5)',
            },
            borderColors: {
               up: 'rgb(255, 230, 2)',
               down: 'rgb(255, 99, 132)',
               unchanged: 'rgb(201, 203, 207)',
            }
         },

      ]
   }
});
var chart3 = new Chart(ctx3, {
   type: 'candlestick',
   data: {
      datasets: [
         {
            label: '',
            data: barData3,

            borderColor: 'transparent',
            backgroundColors: {
               up: 'rgba(100, 75, 192, 0.5)',
               down: 'rgba(255, 99, 132, 0.5)',
               unchanged: 'rgba(201, 203, 207, 0.5)',
            },
            borderColors: {
               up: 'rgb(100, 75, 192)',
               down: 'rgb(255, 99, 132)',
               unchanged: 'rgb(201, 203, 207)',
            }
         },


      ]
   }
});

if (get('base')) {
   document.querySelector('[data-body]').innerHTML = get('base')
   document.querySelector('[data-stat]').innerHTML = get('stat')


} else {

   document.querySelector('[data-body]').innerHTML = `
  
   <div class='block'>
   
     <div class='pos-block'>
   
        <div data-pos-list>
   
        </div>
     </div>
   
     <div class='neg-block'>

        <div data-neg-list>
   
        </div>
     </div>

   </div>

     `

   document.querySelector('[data-stat]').innerHTML = `
  
  <div class='stat-top'>
     <div class='icon'><img data-rang src='icon/0.png'></div>
     <span> </span>
     <span class='name'>QL/PRC</span>
     <span> </span>
     <span data-profit>0.00%</span>
  </div>
 
  <div><span data-procent>0.00</span><span> </span></div>
  
  
  `

   document.querySelector('[data-money-stat]').innerHTML = `
  
   <div class='stat-top'>
      <div class='icon'><img data-rang src='icon/0.png'></div>
      <span> </span>
      <span class='name'>MN/PRC</span>
      <span> </span>
      <span data-statmoney-procent>0.00</span>
   </div>
 
   <div data-statmoney-flex>
      <span data-statmoney-num>0.00</span>
      <span data-statmoney-usdt>0.00</span>
   </div>
  
  
  `

}
if (get('moneyStat')) {
   document.querySelector('[data-money-stat]').innerHTML = get('moneyStat')


} else {

   document.querySelector('[data-money-stat]').innerHTML = `
  
   <div class='stat-top'>
      <div class='icon'><img data-money-rang src='icon/0.png'></div>
      <span> </span>
      <span class='name'>MN/PRC</span>
      <span> </span>
      <span data-statmoney-procent>0.00</span>
   </div>
 
   <div data-statmoney-flex>
      <span data-statmoney-num>0.00</span>
      <span data-statmoney-usdt>0.00</span>
   </div>
  
  
  `

}
if (get('noteStat')) {
   document.querySelector('[data-note-stat]').innerHTML = get('noteStat')


} else {

   document.querySelector('[data-note-stat]').innerHTML = `
  
   <div class='stat-top'>
      <div class='icon'><img data-note-rang src='icon/0.png'></div>
      <span> </span>
      <span class='name'>NT/PRC</span>
      <span> </span>
      <span data-statnote-procent>0.00</span>
   </div>
 
   <div><span data-statnote-num>0.00</span><span> </span></div>
  
  
  `

}


function showDateTime() {
   const now = new Date()

   const year = now.getFullYear()
   const month = String(now.getMonth() + 1).padStart(2, '0') // добавляем 0, если число < 10
   const day = String(now.getDate()).padStart(2, '0')

   const hours = String(now.getHours()).padStart(2, '0')
   const minutes = String(now.getMinutes()).padStart(2, '0')
   const seconds = String(now.getSeconds()).padStart(2, '0')

   const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`

   return formattedDate
}

function timePassed(dateString) {
   const past = new Date(dateString)
   const now = new Date()

   let diffMs = now - past // разница в миллисекундах
   let hours = Math.floor(diffMs / (1000 * 60 * 60))
   let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

   return minutes
}

function convertTimeToMilliseconds(timeStr) {
   // Разделяем строку по точке (часы и минуты)
   const [hours, minutes] = timeStr.split('.').map(Number);

   // Переводим часы и минуты в миллисекунды
   const totalMilliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
   return totalMilliseconds;
}

document.addEventListener('click', (event) => {

   const targ = event.target

   if (targ.closest('[data-footer-name]')) {
      const att = targ.closest('[data-footer-name]').getAttribute('data-footer-name')

      const dropdown = document.querySelector('[data-dropdown]')
      dropdown && dropdown.remove('_active')
      const politic = document.querySelector('[data-politic]')
      politic && politic.classList.remove('_active')
      const collection = document.querySelector('[data-collection]')
      collection && collection.classList.remove('_active')
      const burger2ShadowAll = document.querySelectorAll('[data-burger2-shadow]')
      burger2ShadowAll.forEach((burger2Shadow) => {
         burger2Shadow.classList.remove('_active')
      })
      const politicPoint = document.querySelector('[data-politic-point]')
      politicPoint && politicPoint.classList.remove('_active')
      const collectionPoint = document.querySelector('[data-collection-point]')
      collectionPoint && politicPoint.classList.remove('_active')

      const mn = document.querySelector('[data-mn]')
      const ql = document.querySelector('[data-ql]')
      const note = document.querySelector('[data-note]')

      const footerAll = document.querySelectorAll('[data-footer-name]')
      footerAll.forEach((footer) => {

         if (footer.getAttribute('data-footer-name') !== att) {
            footer.classList.remove('_active')
            document.querySelector(`[data-${att}]`).style.display = 'none'
         } else {
            footer.classList.add('_active')
            document.querySelector(`[data-${att}]`).style.display = 'block'

         }
      })


      if (att === 'mn') {
         targ.classList.add('_active')

         ql.style.display = 'none'
         note.style.display = 'none'
         mn.style.display = 'block'
      }

      if (att === 'ql') {
         targ.classList.add('_active')

         mn.style.display = 'none'
         note.style.display = 'none'
         ql.style.display = 'block'
      }

      if (att === 'note') {
         targ.classList.add('_active')

         mn.style.display = 'none'
         ql.style.display = 'none'
         note.style.display = 'block'
      }


      const burger = document.querySelector('[data-burger]')
      const shadow = document.querySelector('[data-shadow]')

      burger.classList.remove('_active')
      shadow.classList.remove('_active')

      document.querySelector('[data-burger-2]').classList.remove('_active')
      document.querySelector('[data-task-shadow]').classList.remove('_active')





      const dropDown = document.querySelector('[data-dropdown]')
      const text = document.querySelector('[data-text]._active')
      const input = document.querySelector("input[tabindex='-1']")
      const assetTextActive = document.querySelector('[data-asset-text]._active')
      const inputSecond = document.querySelector('[data-input-second]')
      const inputThird = document.querySelector('[data-input-third]')
      document.querySelector('[data-collection]')?.classList.remove('_active')
      document.querySelector('[data-politic]')?.classList.remove('_active')
      document.querySelector('[data-polreward]')?.classList.remove('_active')

      // document.querySelector('[data-money-pos-add]').style.display = 'flex'
      // if (!document.querySelector('[data-money-start]')) document.querySelector('[data-money-neg-add]').style.display = 'flex'
      // document.querySelector('[data-pos-add]').style.display = 'flex'
      // document.querySelector('[data-neg-add]').style.display = 'flex'
      document.querySelector('[data-money-categories]').style.display = 'none'

      shadow.classList.remove('_active')
      dropDown && dropDown.remove()

      text && text.classList.remove('_active')
      assetTextActive && assetTextActive.classList.remove('_active')
      input && input.remove('_active')
      inputSecond && inputSecond.remove('_active')
      inputThird && inputThird.remove('_active')

      const tempPoint = document.querySelector('[data-lobby-point]._temp')
      tempPoint && tempPoint.classList.remove('_temp')

      document.querySelector('[data-burger-2]').classList.remove('_active')





   }

   if (targ.closest('[data-stat]') || targ.closest('[data-money-stat]') || targ.closest('[data-note-stat]')) {
      document.querySelector('[data-burger-2]').classList.add('_active')
      document.querySelector('[data-task-shadow]').classList.add('_active')
   }



   if (targ.closest('[data-money-categorie]')) {

      const text = targ.closest('[data-money-categorie]').innerText
      let input = document.querySelector("input[tabindex='-1']")

      if (input) {

         const inputValue = Number(input.value)
         const inputAtt = document.querySelector('[data-temp-input]').getAttribute('data-temp-input')

         if (inputValue) {

            const pad = (n) => String(n).padStart(2, '0');
            const today = new Date();
            const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

            const usdt = inputValue * 0.024

            if (inputAtt === 'pos') {
               document.querySelector('[data-money]').insertAdjacentHTML('afterbegin', `
               <div data-money-shell>
                  <div data-money-main>
                     <div data-money-text>${text}</div>
                     <div data-money-profit>${inputValue.toFixed(2)}</div>
                  </div>
                  <div data-money-usdt>${usdt.toFixed(2)}</div>
               </div>
               `)
            } else {
               document.querySelector('[data-money]').insertAdjacentHTML('afterbegin', `
             
               <div data-money-shell>
                  <div data-money-main>
                     <div data-money-text>${text}</div>
                     <div data-money-lose>${inputValue.toFixed(2)}</div>
                  </div>
                  <div data-money-usdt>${usdt.toFixed(2)}</div>
               </div>

               `)
            }


            document.querySelector('[data-statmoney-num]').innerText = Number(inputValue).toFixed(2)

            let num = Number(inputValue)

            let checkDate = barData2.find(obj => obj.date === date)

            if (checkDate) {

               if (num) {

                  if (!document.querySelector('[data-money-start]')) {

                     if (inputAtt === 'pos') {
                        const profitClose = checkDate.c + num
                        const cleanProfitUP = profitClose - checkDate.o
                        const cleanProfitDOWN = checkDate.o - profitClose
                        checkDate.c = Number(profitClose.toFixed(2))

                        const statNum = document.querySelector('[data-statmoney-num]')
                        const statUsdt = document.querySelector('[data-statmoney-usdt]')
                        const statProcent = document.querySelector('[data-statmoney-procent]')

                        const asset = document.querySelectorAll('[data-asset]')
                        asset.forEach((asset) => {
                           if (asset.querySelector('[data-asset-text]').innerText === text) {
                              const newAssetNum = inputValue + Number(asset.querySelector('[data-asset-num]').innerText)
                              asset.querySelector('[data-asset-num]').innerText = newAssetNum.toFixed(2)
                              asset.querySelector('[data-asset-usdt]').innerText = (newAssetNum * 0.024).toFixed(2)
                           }
                        })

                        statNum.innerText = profitClose.toFixed(2)
                        statUsdt.innerText = (profitClose * 0.024).toFixed(2)
                        if (profitClose >= checkDate.o) {
                           statProcent.innerText = `+${cleanProfitUP.toFixed(2)}`
                           statNum.style = 'color: rgb(255, 230, 2);'
                           statProcent.style = 'color: rgb(255, 230, 2); background-color: rgba(255, 230, 2, 0.5);'
                        } else {
                           statProcent.innerText = `-${cleanProfitDOWN.toFixed(2)}`
                           statNum.style = 'color:  rgb(255, 99, 132);'
                           statProcent.style = 'color:  rgb(255, 99, 132); background-color: rgba(255, 99, 132, 0.5);'
                        }
                        set('moneyStat', document.querySelector('[data-money-stat]').innerHTML)

                        if (profitClose >= checkDate.h) {
                           checkDate.h = Number(profitClose.toFixed(2))

                           video('finance')
                        } else {
                           video('general') // oldWin

                        }

                     } else {

                        const loseClose = checkDate.c - num
                        const cleanLoseDOWN = checkDate.o - loseClose
                        const cleanLoseUP = loseClose - checkDate.o
                        checkDate.c = Number(loseClose.toFixed(2))

                        const statNum = document.querySelector('[data-statmoney-num]')
                        const statUsdt = document.querySelector('[data-statmoney-usdt]')

                        const statProcent = document.querySelector('[data-statmoney-procent]')

                        const asset = document.querySelectorAll('[data-asset]')
                        asset.forEach((asset) => {
                           if (asset.querySelector('[data-asset-text]').innerText === text) {
                              const newAssetNum = Number(asset.querySelector('[data-asset-num]').innerText) - inputValue
                              asset.querySelector('[data-asset-num]').innerText = newAssetNum.toFixed(2)
                           }
                        })

                        statNum.innerText = loseClose.toFixed(2)
                        statUsdt.innerText = (loseClose * 0.024).toFixed(2)
                        if (loseClose <= checkDate.o) {
                           statProcent.innerText = `-${cleanLoseDOWN.toFixed(2)}`
                           statNum.style = 'color:  rgb(255, 99, 132);'
                           statProcent.style = 'color: rgb(255, 99, 132); background-color: rgba(255, 99, 132, 0.5);'

                        } else {
                           statProcent.innerText = `+${cleanLoseUP.toFixed(2)}`
                           statNum.style = 'color:  rgb(255, 230, 2);'
                           statProcent.style = 'color: rgb(255, 230, 2); background-color: rgba(255, 230, 2, 0.5);'
                        }
                        set('moneyStat', document.querySelector('[data-money-stat]').innerHTML)

                        if (loseClose <= checkDate.l) {
                           checkDate.l = Number(loseClose.toFixed(2))

                           // video('lose')


                        } else {
                           // video('lose') // oldLose

                        }

                     }

                  }

               }

               chart2.update()

               set('barData2', JSON.stringify(barData2))
               const money = document.querySelector('[data-money]').innerHTML
               set('money', money)
               set('assets', document.querySelector('[data-assets]').innerHTML)


            } else {

               if (num) {

                  if (document.querySelector('[data-money-start]')) {

                     document.querySelector('[data-money-start]').remove()

                     let profitSum = Number(document.querySelector('[data-money-profit]').innerText)

                     barData2.push({ x: Date.now() - 86400000, o: profitSum, h: profitSum, l: profitSum, c: profitSum, date: '' })

                     barData2.push({ x: Date.now(), o: profitSum, h: profitSum, l: profitSum, c: profitSum, date: date })

                     document.querySelector('[data-money-neg-add]').classList.remove('_block')
                     document.querySelector('[data-money-pos-add]').style = 'bottom: 105px; right: 10px;'
                     document.querySelector('[data-money-neg-add]').style = 'bottom: 60px; right: 10px;'

                     const asset = document.querySelectorAll('[data-asset]')
                     asset.forEach((asset) => {
                        if (asset.querySelector('[data-asset-text]').innerText === text) {
                           const newAssetNum = Number(asset.querySelector('[data-asset-num]').innerText) + inputValue
                           asset.querySelector('[data-asset-num]').innerText = newAssetNum.toFixed(2)
                           asset.querySelector('[data-asset-usdt]').innerText = (newAssetNum * 0.024).toFixed(2)

                        }
                     })

                     set('barData2', JSON.stringify(barData2))
                     chart2.update()
                     const money = document.querySelector('[data-money]').innerHTML
                     set('money', money)
                     set('assets', document.querySelector('[data-assets]').innerHTML)


                  }

               }
            }


            // if (inputAtt === 'pos') {
            //    video('finance')

            // } else {
            //    video('lose') // oldLose

            // }


         }

         document.querySelector('[data-task-shadow]').classList.remove('_active')
         input.remove()
         targ.closest('[data-money-categories]').style.display = 'none'

      } else {
         const oldAsset = targ.closest('[data-asset]')
         const oldAssetNum = oldAsset.querySelector('[data-asset-num]')
         const oldUsdt = oldAsset.querySelector('[data-asset-usdt]')
         document.querySelector('[data-dropdown]').remove()

         input = document.createElement('input')

         input.type = 'number'
         input.style = 'position: fixed; bottom: 60px; left: 10px; width: 40px; color: #FCFCFC;'
         input.setAttribute('tabindex', '-1')

         document.body.appendChild(input)

         input.focus()

         input.addEventListener('keydown', (event) => {

            if (event.key === 'Enter') {
               event.preventDefault()

               const inputValue = Number(input.value)

               if (inputValue && inputValue <= Number(oldAssetNum.innerText)) {

                  const oldNewNum = Number(oldAssetNum.innerText) - inputValue
                  oldAssetNum.innerText = oldNewNum.toFixed(2)

                  const oldNewUsdt = oldNewNum * 0.024
                  oldUsdt.innerText = oldNewUsdt.toFixed(2)

                  const assetTextAll = document.querySelectorAll('[data-asset-text]')
                  assetTextAll.forEach((assetText) => {

                     if (assetText.innerText === text) {
                        const assetNum = assetText.closest('[data-asset]').querySelector('[data-asset-num]')
                        const assetUsdt = assetText.closest('[data-asset]').querySelector('[data-asset-usdt]')

                        const newNum = Number(assetNum.innerText) + inputValue
                        log(newNum.toFixed(2));
                        log((newNum * 0.024).toFixed(2));

                        assetNum.innerText = newNum.toFixed(2)
                        assetUsdt.innerText = (newNum * 0.024).toFixed(2)


                     }
                  })
               }

               input.remove()

               document.querySelector('[data-task-shadow]').classList.remove('_active')
               document.querySelector('[data-asset-text]').classList.remove('_active')
               document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()

            }

         })
      }

      set('assets', document.querySelector('[data-assets]').innerHTML)
      set('moneyStat', document.querySelector('[data-money-stat]').innerHTML)
      set('money', document.querySelector('[data-money]').innerHTML)

   }


   if (targ.closest('[data-asset-create]')) {
      document.querySelector('[data-money-pos-add]').style.display = 'none'
      document.querySelector('[data-money-neg-add]').style.display = 'none'
      document.querySelector('[data-dropdown]').remove()

      let input = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')

      document.body.appendChild(input)

      input.focus()

      function mainText() {

         if (input.value && input.value !== '') {

            document.querySelector('[data-money-categories]').insertAdjacentHTML('afterbegin', `
            <div data-money-categorie>${input.value}</div>
            `)

            document.querySelector('[data-asset-text]._active').closest('[data-asset]').insertAdjacentHTML('afterend', `
               <div data-asset>
                  <div data-asset-text>${input.value}</div>
                  <div class="asset-flex">
                     <div data-asset-num>0.00</div>
                     <div data-asset-usdt>0.00</div>
                  </div>
               </div>
            `)


         }

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            document.querySelector('[data-money-pos-add]').style.display = 'flex'
            document.querySelector('[data-money-neg-add]').style.display = 'flex'
            document.querySelector('[data-task-shadow]').classList.remove('_active')
            document.querySelector('[data-asset-text]').classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()

            set('assets', document.querySelector('[data-assets]').innerHTML)


         }

      })

   }

   if (targ.closest('[data-lobby-add]')) {
      document.querySelector('[data-task-shadow]').classList.add('_active')

      let input = document.createElement('input')
      let inputSecond = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: rgb(252, 252, 252);'
      input.setAttribute('tabindex', '-1')
      input.setAttribute('placeholder', 'название')

      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 40px; color: rgba(100, 75, 192, 1);'
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('placeholder', '1')
      inputSecond.setAttribute('data-input-second', '')

      inputSecond.value = '1'

      document.body.appendChild(input)
      document.body.appendChild(inputSecond)

      input.focus()

      function mainText() {

         const lobbyBodyAll = document.querySelectorAll('[data-lobby-body]')
         lobbyBodyAll.forEach((lobbyBody) => {

            if (lobbyBody.style.display === 'block') {

               lobbyBody.insertAdjacentHTML('beforeend', `
                  <div data-lobby-point>
                     <div data-lobby-task>
                        <div data-lobby-text>${input.value}</div>
                        <div data-lobby-reward>${inputSecond.value}</div>
                     </div>
                  </div>
               `)
            }

         })

      }

      input.addEventListener('keydown', (event) => {


         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })

      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            if (input.value && inputSecond.value !== '') {

               mainText()

               input.remove()
               inputSecond.remove()

               document.querySelector('[data-lobby-add]').style.display = 'flex'
               document.querySelector('[data-task-shadow]').classList.remove('_active')

               set('noteBody', document.querySelector('[data-note-body]').innerHTML)

            }

         }

      })

   }

   if (targ.closest('[data-season-get]')) {

      document.querySelector('[data-season-shadow]').classList.add('_active')

      let input = document.createElement('input')
      let inputSecond = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC; z-index: 1500; background-color: rgb(48, 44, 63);'
      input.setAttribute('placeholder', 'название')
      input.setAttribute('tabindex', '-1')
      document.body.appendChild(input)

      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 60px; color: #FCFCFC; z-index: 1500;; background-color: rgb(48, 44, 63)'
      inputSecond.setAttribute('placeholder', 'число')
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('data-input-second', '')
      document.body.appendChild(inputSecond)

      input.focus()

      function maintext() {

         let color
         const inputSecondValue = Number(inputSecond.value)

         if (inputSecondValue === 1) {
            color = 'brown'
         }
         if (inputSecondValue === 2) {
            color = 'gray'
         }
         if (inputSecondValue === 3) {
            color = 'yellow'
         }
         if (inputSecondValue === 4) {
            color = 'goluboy'
         }
         if (inputSecondValue === 5) {
            color = 'blue'
         }
         if (inputSecondValue === 6) {
            color = 'fiolet'
         }

         if (input.value !== '' && inputSecond.value) {

            const actSeason = Number(document.querySelector('[data-actual-season]').innerText)
            console.log(actSeason);


            if (document.querySelector(`[data-season="${actSeason}"]`)) {
               document.querySelector(`[data-season="${actSeason}"]`).insertAdjacentHTML('beforeend', `
   
                  <div data-titul="${color}">${input.value}</div>
          
                  `)

            }
            // else {

            //    document.querySelector('[data-tituls]').insertAdjacentHTML('beforeend', `
            //       <div data-season="${actSeason}">
            //          <div data-titul="${color}">${input.value}</div>
            //        </div>
            //    `)
            // }



         }

      }

      input.addEventListener('keydown', (event) => {


         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })


      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            maintext()

            input.remove()
            inputSecond.remove()

            document.querySelector('[data-season-shadow]').classList.remove('_active')

         }

      })

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)


   }
   if (targ.closest('[data-season-clear]')) {
      const dinamNumAll = document.querySelectorAll('[data-dinam-titul-num]')
      dinamNumAll.forEach((dinamNum) => {
         dinamNum.innerText = '0'
      })

      const actualSeason = document.querySelector('[data-actual-season]')
      const seasonDay = document.querySelector('[data-season-day]')
      actualSeason.innerText = Number(actualSeason.innerText) + 1
      seasonDay.innerText = '30'


      const pad = (n) => String(n).padStart(2, '0');
      const today = new Date();
      const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

      set(`startSeason`, date)

      targ.closest('[data-season-clear]').style = 'display: none;'
      document.querySelector('[data-season-get]').style = 'display: none;'

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

   }
   if (targ.closest('[data-money-pos-add]')) {

      document.querySelector('[data-money-categories]').style.display = 'flex'
      document.querySelector('[data-task-shadow]').classList.add('_active')

      let input = document.createElement('input')

      input.type = 'number'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 40px; color: rgb(255, 230, 2);'
      input.setAttribute('placeholder', '20')
      input.setAttribute('tabindex', '-1')
      input.setAttribute('data-temp-input', 'pos')

      document.body.appendChild(input)

      input.focus()

   }
   if (targ.closest('[data-money-neg-add]')) {

      document.querySelector('[data-money-categories]').style.display = 'flex'
      document.querySelector('[data-task-shadow]').classList.add('_active')

      let input = document.createElement('input')

      input.type = 'number'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 40px; color: rgb(255, 99, 132);'
      input.setAttribute('placeholder', '20')
      input.setAttribute('tabindex', '-1')
      input.setAttribute('data-temp-input', 'neg')

      document.body.appendChild(input)

      input.focus()

   }

   if (targ.closest('[data-pos-add]')) {

      document.querySelector('[data-task-shadow]').classList.add('_active')

      let input = document.createElement('input')
      let inputSecond = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')


      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 40px; color: rgb(75, 192, 192);'
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('data-input-second', '')

      document.body.appendChild(input)
      document.body.appendChild(inputSecond)

      input.focus()

      function mainText() {


         if (input.value && inputSecond.value || inputSecond.value === 0) {

            let decorProc = inputSecond.value

            if (inputSecond.value >= 10) {
               decorProc = 10
            }


            document.querySelector('[data-pos-list]').insertAdjacentHTML('beforeend', `
            <div data-point data-pos-point>

            <div data-decor data-pos-decor style='width: ${decorProc * 10}%'>
            </div>

            <div class='flex'>

             <div data-name>${input.value}</div>
             <div data-pos-span data-span>${inputSecond.value}</div>

             </div>

            </div>
            `)


         }


      }

      function mainNum() {


         let num = Number(inputSecond.value)


         if ((num || num === 0) && input.value) {

            if (!document.querySelector('[data-start]')) {


               let sum = 0;
               document.querySelectorAll('[data-span]').forEach(div => {
                  let num = parseFloat(div.textContent);
                  if (!isNaN(num)) sum += num;
               });

               let posSum = 0;
               document.querySelectorAll('[data-pos-span]').forEach(div => {
                  let num = parseFloat(div.textContent);
                  if (!isNaN(num)) posSum += num;
               });


               let procentBig = sum > 0 ? (posSum / sum) * 100 : 0;
               let procent = Number(procentBig.toFixed(2))

               log(`
               ======== [data-pos-add]
               posSum: ${posSum}
               sum: ${sum}
               procent: ${procent} = (${posSum} / ${sum}) * 100
               `)


               const pad = (n) => String(n).padStart(2, '0');
               const today = new Date();
               const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

               const oldRang = Number(document.querySelector('[data-rang]').getAttribute('src').match(/\d+/))
               const nowRang = rang(Number(procent))
               log(nowRang);


               document.querySelector('[data-procent]').innerText = `${procent}`
               document.querySelector('[data-rang]').setAttribute('src', `icon/${nowRang}.png`)
               document.querySelector('[data-money-rang]').setAttribute('src', `icon/${nowRang}.png`)
               document.querySelector('[data-note-rang]').setAttribute('src', `icon/${nowRang}.png`)
               document.querySelector('body').style = `background-image: url('bg/${bgRang(Number(procent))}.jpg');`
               set('bgRang', `background-image: url('bg/${bgRang(Number(procent))}.jpg');`)
               log(`RANG: ${bgRang(Number(procent))}`);



               if (nowRang > oldRang) {
                  // повышен ранг 

                  video('upgrade')


                  up = true

               } else {

                  // if (nowRang !== oldRang) {
                  //    // понижен ранг 

                  //    document.querySelector('[data-video-2]').style = 'display: block;'
                  //    document.querySelector('[data-video-2]').play()
                  // }

               }

               log(`UPPPPPPP${up}`);



               let checkDate = barData.find(obj => obj.date === date)

               if (checkDate) {


                  if (procent > checkDate.o) {

                     document.querySelector('[data-procent]').style.color = 'rgb(75, 192, 192)'

                     let profit = procent - checkDate.o
                     profit = profit.toFixed(2)

                     let docProfit = document.querySelector('[data-profit]')

                     docProfit.innerText = `+${profit}%`
                     docProfit.style.color = 'rgb(75, 192, 192)'
                     docProfit.style.backgroundColor = 'rgba(75, 192, 192, 0.5)'

                     if (procent > checkDate.c) {

                        if (checkDate.c < checkDate.o) {
                           if (!up) {
                              video('general')
                              log(`general: ${checkDate.c} < ${checkDate.o}`);
                           }
                        } else {
                           if (procent > checkDate.h) {
                              checkDate.h = procent

                              if (!up) {
                                 video('general')
                                 log(`general: ${procent} > ${checkDate.h}`);
                              }
                           } else {
                              if (!up) {
                                 video('general') // oldWin
                                 log(`general: ${procent} > ${checkDate.c}`);
                              }
                           }
                        }


                     } else {

                        if (!up) {
                           // video('lose') // oldLose
                           log(`lose: ${procent} < ${checkDate.c}`);
                        }

                     }

                  } else {

                     document.querySelector('[data-procent]').style.color = 'rgb(255, 99, 132)'


                     let profit = procent - checkDate.o
                     profit = profit.toFixed(2)

                     let docProfit = document.querySelector('[data-profit]')

                     docProfit.innerText = `${profit}%`
                     docProfit.style.color = 'rgb(255, 99, 132)'
                     docProfit.style.backgroundColor = 'rgba(255, 99, 132, 0.5)'

                     if (procent > checkDate.c) {

                        if (!up) {
                           video('general') // oldWin
                           log(`general: ${procent} > ${checkDate.l}`);
                        }

                     } else {

                        if (procent < checkDate.l) {
                           checkDate.l = procent

                           if (!up) {
                              video('lose')
                              log(`lose: ${procent} < ${checkDate.l}`);
                           }
                        } else {
                           if (!up) {
                              // video('lose') // oldLose
                              log(`lose: ${procent} < ${checkDate.c}`);
                           }
                        }

                     }


                  }

                  checkDate.c = procent

               }

               chart.update()

               set('barData', JSON.stringify(barData))

               procent = procent.toFixed(2)
               document.querySelector('[data-procent]').innerText = `${procent}`
               document.querySelector('[data-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
               document.querySelector('[data-money-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
               document.querySelector('[data-note-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
               document.querySelector('body').style = `background-image: url('bg/${bgRang(Number(procent))}.jpg');`
               set('bgRang', `background-image: url('bg/${bgRang(Number(procent))}.jpg');`)
               log(`RANG: ${bgRang(Number(procent))}`);

               const base = document.querySelector('[data-body]').innerHTML
               set('base', base)

               const stat = document.querySelector('[data-stat]').innerHTML
               set('stat', stat)

               const moneyStat = document.querySelector('[data-money-stat]').innerHTML
               set('moneyStat', moneyStat)
               const noteStat = document.querySelector('[data-note-stat]').innerHTML
               set('noteStat', noteStat)

            }

            let points = document.querySelectorAll('[data-pos-point]')

            if (points.length > 1) {

               let sortPoints = Array.from(points).sort((a, b) => {
                  return Number(b.querySelector('[data-span]').innerText) - Number(a.querySelector('[data-span]').innerText)
               })

               let posList = document.querySelector('[data-pos-list]')
               posList.innerHTML = ''

               sortPoints.forEach(e => {

                  posList.insertAdjacentHTML('beforeend', `${e.outerHTML}`)
               })


            }

            const base = document.querySelector('[data-body]').innerHTML
            set('base', base)

            const stat = document.querySelector('[data-stat]').innerHTML
            set('stat', stat)

            const moneyStat = document.querySelector('[data-money-stat]').innerHTML
            set('moneyStat', moneyStat)
            const noteStat = document.querySelector('[data-note-stat]').innerHTML
            set('noteStat', noteStat)

         }

      }

      input.addEventListener('keydown', (event) => {


         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })


      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            mainNum()
            input.remove()
            inputSecond.remove()

            document.querySelector('[data-pos-add]').style.display = 'flex'
            document.querySelector('[data-neg-add]').style.display = 'flex'
            document.querySelector('[data-task-shadow]').classList.remove('_active')

         }

      })

   }

   if (targ.closest('[data-neg-add]')) {

      document.querySelector('[data-task-shadow]').classList.add('_active')


      let input = document.createElement('input')
      let inputSecond = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')


      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 40px; color: rgb(255, 99, 132);'
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('data-input-second', '')


      document.body.appendChild(input)
      document.body.appendChild(inputSecond)

      input.focus()

      function mainText() {

         if (input.value && inputSecond.value || inputSecond.value === 0) {

            let decorProc = inputSecond.value

            if (inputSecond.value >= 10) {
               decorProc = 10
            }

            document.querySelector('[data-neg-list]').insertAdjacentHTML('beforeend', `
        <div data-point data-neg-point>
        
         <div data-decor data-neg-decor style='width: ${decorProc * 10}%'>
         </div>
        
        <div class='flex'>
        
        
         <span data-name>${input.value}</span>
          <div data-neg-span data-span>${inputSecond.value}</div>
        
         
         </div>
         
        </div>
        `)

         }

      }

      function mainNum() {


         let num = Number(inputSecond.value)

         if ((num || num === 0) && input.value) {

            if (!document.querySelector('[data-start]')) {

               let sum = 0;
               document.querySelectorAll('[data-span]').forEach(div => {
                  let num = parseFloat(div.textContent);
                  if (!isNaN(num)) sum += num;
               });

               let posSum = 0;
               document.querySelectorAll('[data-pos-span]').forEach(div => {
                  let num = parseFloat(div.textContent);
                  if (!isNaN(num)) posSum += num;
               });


               let procentBig = sum > 0 ? (posSum / sum) * 100 : 0;
               let procent = Number(procentBig.toFixed(2))


               log(`
               ======== [data-neg-add]
               posSum: ${posSum}
               sum: ${sum}
               procent: ${procent} = (${posSum} / ${sum}) * 100
               `)

               const pad = (n) => String(n).padStart(2, '0');
               const today = new Date();
               const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;


               let checkDate = barData.find(obj => obj.date === date)

               if (checkDate) {

                  if (procent > checkDate.o) {

                     document.querySelector('[data-procent]').style.color = 'rgb(75, 192, 192)'

                     let profit = procent - checkDate.o
                     profit = profit.toFixed(2)

                     let docProfit = document.querySelector('[data-profit]')

                     docProfit.innerText = `+${profit}%`
                     docProfit.style.color = 'rgb(75, 192, 192)'
                     docProfit.style.backgroundColor = 'rgba(75, 192, 192, 0.5)'

                     if (procent > checkDate.c) {

                        if (checkDate.c < checkDate.o) {
                           if (!up) {
                              video('general')
                              log(`general: ${checkDate.c} < ${checkDate.o}`);
                           }
                        } else {
                           if (procent > checkDate.h) {
                              checkDate.h = procent

                              if (!up) {
                                 video('general')
                                 log(`general: ${procent} > ${checkDate.h}`);
                              }
                           } else {
                              if (!up) {
                                 video('general') // oldWin
                                 log(`general: ${procent} > ${checkDate.c}`);
                              }
                           }
                        }


                     } else {

                        if (!up) {
                           // video('lose') // oldLose
                           log(`lose: ${procent} < ${checkDate.c}`);
                        }

                     }

                  } else {

                     document.querySelector('[data-procent]').style.color = 'rgb(255, 99, 132)'

                     let profit = procent - checkDate.o
                     profit = profit.toFixed(2)

                     let docProfit = document.querySelector('[data-profit]')

                     docProfit.innerText = `${profit}%`
                     docProfit.style.color = 'rgb(255, 99, 132)'
                     docProfit.style.backgroundColor = 'rgba(255, 99, 132, 0.5)'


                     if (procent > checkDate.c) {

                        if (!up) {
                           video('general') // oldWin
                           log(`general: ${procent} > ${checkDate.l}`);
                        }

                     } else {

                        if (procent < checkDate.l) {
                           checkDate.l = procent

                           if (!up) {
                              video('lose')
                              log(`lose: ${procent} < ${checkDate.l}`);
                           }
                        } else {
                           if (!up) {
                              // video('lose') // oldLose
                              log(`lose: ${procent} < ${checkDate.c}`);
                           }
                        }

                     }

                  }

                  checkDate.c = procent

               }

               chart.update()

               set('barData', JSON.stringify(barData))


               procent = procent.toFixed(2)
               document.querySelector('[data-procent]').innerText = `${procent}`
               document.querySelector('[data-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
               document.querySelector('[data-money-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
               document.querySelector('[data-note-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
               document.querySelector('body').style = `background-image: url('bg/${bgRang(Number(procent))}.jpg');`
               set('bgRang', `background-image: url('bg/${bgRang(Number(procent))}.jpg');`)
               log(`RANG: ${bgRang(Number(procent))}`);


               const base = document.querySelector('[data-body]').innerHTML
               set('base', base)

               const stat = document.querySelector('[data-stat]').innerHTML
               set('stat', stat)

               const moneyStat = document.querySelector('[data-money-stat]').innerHTML
               set('moneyStat', moneyStat)
               const noteStat = document.querySelector('[data-note-stat]').innerHTML
               set('noteStat', noteStat)


            }

            let points = document.querySelectorAll('[data-neg-point]')

            if (points.length > 1) {

               let sortPoints = Array.from(points).sort((a, b) => {
                  return Number(b.querySelector('[data-span]').innerText) - Number(a.querySelector('[data-span]').innerText)
               })

               let posList = document.querySelector('[data-neg-list]')
               posList.innerHTML = ''

               sortPoints.forEach(e => {

                  posList.insertAdjacentHTML('beforeend', `${e.outerHTML}`)
               })


            }


            const base = document.querySelector('[data-body]').innerHTML
            set('base', base)

            const stat = document.querySelector('[data-stat]').innerHTML
            set('stat', stat)

            const moneyStat = document.querySelector('[data-money-stat]').innerHTML
            set('moneyStat', moneyStat)
            const noteStat = document.querySelector('[data-note-stat]').innerHTML
            set('noteStat', noteStat)

         }

      }

      input.addEventListener('keydown', (event) => {


         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })


      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            mainNum()
            input.remove()
            inputSecond.remove()

            document.querySelector('[data-pos-add]').style.display = 'flex'
            document.querySelector('[data-neg-add]').style.display = 'flex'
            document.querySelector('[data-task-shadow]').classList.remove('_active')

         }

      })

   }

   if (targ.closest('[data-clear]')) {

      clear()
      targ.style.backgroundColor = '#33181B'

   }

   if (targ.closest('[data-money-clear]')) {

      rem('money')
      rem('moneyStat')
      rem('barData2')
      rem('assets')
      targ.style.backgroundColor = '#33181B'

   }

   if (targ.closest('[data-note-clear]')) {

      rem('noteBody')
      rem('noteStat')
      rem('barData3')
      targ.style.backgroundColor = '#33181B'

   }

   if (targ.closest('[data-start]')) {


      targ.remove()

      let sum = 0;
      document.querySelectorAll('[data-span]').forEach(div => {
         let num = parseFloat(div.textContent);
         if (!isNaN(num)) sum += num;
      });

      let posSum = 0;
      document.querySelectorAll('[data-pos-span]').forEach(div => {
         let num = parseFloat(div.textContent);
         if (!isNaN(num)) posSum += num;
      });


      let procentBig = sum > 0 ? (posSum / sum) * 100 : 0;
      let procent = Number(procentBig.toFixed(2))

      log(`
      ======== [data-start]
      posSum: ${posSum}
      sum: ${sum}
      procent: ${procent} = (${posSum} / ${sum}) * 100
      `)


      const pad = (n) => String(n).padStart(2, '0');
      const today = new Date();
      const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;


      barData.push({ x: Date.now() - 86400000, o: procent, h: procent, l: procent, c: procent, date: '' })

      barData.push({ x: Date.now(), o: procent, h: procent, l: procent, c: procent, date: date })

      set('barData', JSON.stringify(barData))
      chart.update()

      document.querySelector('[data-procent]').innerText = `${procent.toFixed(2)}`
      document.querySelector('[data-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
      document.querySelector('[data-money-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
      document.querySelector('[data-note-rang]').setAttribute('src', `icon/${rang(Number(procent))}.png`)
      document.querySelector('body').style = `background-image: url('bg/${bgRang(Number(procent))}.jpg');`
      set('bgRang', `background-image: url('bg/${bgRang(Number(procent))}.jpg');`)
      log(`RANG: ${bgRang(Number(procent))}`);


      const base = document.querySelector('[data-body]').innerHTML
      set('base', base)

      const stat = document.querySelector('[data-stat]').innerHTML
      set('stat', stat)

      const moneyStat = document.querySelector('[data-money-stat]').innerHTML
      set('moneyStat', moneyStat)
      const noteStat = document.querySelector('[data-note-stat]').innerHTML
      set('noteStat', noteStat)
      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

      document.querySelector('[data-burger]').classList.remove('_active')
      document.querySelector('[data-shadow]').classList.remove('_active')

   }


   if (targ.closest('[data-export]')) {
      const base = get('base');
      const stat = get('stat');
      const bgRang = get('bgRang');
      const noteBody = get('noteBody');

      // const barData2 = get('barData2');
      // const barData3 = get('barData3');
      const money = get('money');
      const moneyStat = get('moneyStat');
      const noteStat = get('noteStat');
      const assets = get('assets');
      const burger2 = get('burger2');

      const pad = (n) => String(n).padStart(2, '0');
      const today = new Date();
      const date = `${pad(today.getDate())}.${pad(today.getMonth() + 1)}.${today.getFullYear()}`;

      targ.style.backgroundColor = '#112A21';

      const copy = barData;
      const copy2 = barData2;
      const copy3 = barData3;
      const content = `${JSON.stringify(copy)}@${JSON.stringify(copy2)}@${JSON.stringify(copy3)}@${stat}@${moneyStat}@${noteStat}@${base}@${money}@${noteBody}@${bgRang}@${assets}@${burger2}`;
      navigator.clipboard.writeText(content);


      // Создаем Blob (файл в памяти)
      const blob = new Blob([content], { type: 'text/plain' });

      // Создаем ссылку на Blob и эмулируем клик по ней для скачивания файла
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ql_${date}.txt`; // Имя файла
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Освобождаем память
      URL.revokeObjectURL(a.href);
   }

   // if (targ.closest('[data-import]')) {

   //    targ.style.backgroundColor = '#112A21'

   //    navigator.clipboard.readText().then(text => {

   //       let parts = text.split('@');
   //       let firstText = parts[0];
   //       firstText = JSON.parse(firstText)
   //       let secondText = parts[1];
   //       let thirdText = parts[2]

   //       set('barData', JSON.stringify(firstText))
   //       set('base', secondText)
   //       set('stat', thirdText)


   //    }).catch(err => {
   //       console.error('Ошибка при чтении с буфера обмена:', err);
   //    });

   // }

   if (targ.closest('[data-span]')) {

      const taskShadow = document.querySelector('[data-task-shadow]')
      taskShadow.classList.add('_active')


      let oldValueString = targ.innerText
      let oldValue = Number(oldValueString)

      let input = document.createElement('input')

      input.type = 'number'
      input.setAttribute('tabindex', '-1')


      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 40px;'
      input.setAttribute('tabindex', '-1')
      input.setAttribute('placeholder', targ.innerText)

      if (targ.closest('[data-pos-list]')) {
         input.style.color =
            'rgb(75, 192, 192)'
      } else {
         input.style.color =
            'rgb(255, 99, 132)'
      }

      document.body.appendChild(input)

      input.focus()


      function mainNum() {

         let num = Number(input.value)

         targ.innerHTML = num


         if ((num || num === 0) && (num !== oldValue)) {

            let decorProc = num

            if (decorProc >= 10) {
               decorProc = 10
            }

            targ.closest('[data-point]').querySelector('[data-decor]').style.width = `${decorProc * 10}%`

            if (!document.querySelector('[data-start]')) {


               let sum = 0;
               document.querySelectorAll('[data-span]').forEach(div => {
                  let num = parseFloat(div.textContent);
                  if (!isNaN(num)) sum += num;
               });

               let posSum = 0;
               document.querySelectorAll('[data-pos-span]').forEach(div => {
                  let num = parseFloat(div.textContent);
                  if (!isNaN(num)) posSum += num;
               });


               let procentBig = sum > 0 ? (posSum / sum) * 100 : 0;
               let procent = Number(procentBig.toFixed(2))

               log(`
               ======== [data-span]
               posSum: ${posSum}
               sum: ${sum}
               procent: ${procent} = (${posSum} / ${sum}) * 100
               `)

               const pad = (n) => String(n).padStart(2, '0');
               const today = new Date();
               const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

               let checkDate = barData.find(obj => obj.date === date)

               procent = procent.toFixed(2)

               const oldRang = Number(document.querySelector('[data-rang]').getAttribute('src').match(/\d+/))
               const nowRang = rang(Number(procent))
               log(nowRang);


               document.querySelector('[data-procent]').innerText = `${procent}`
               document.querySelector('[data-rang]').setAttribute('src', `icon/${nowRang}.png`)
               document.querySelector('[data-money-rang]').setAttribute('src', `icon/${nowRang}.png`)
               document.querySelector('[data-note-rang]').setAttribute('src', `icon/${nowRang}.png`)
               document.querySelector('body').style = `background-image: url('bg/${bgRang(Number(procent))}.jpg');`
               set('bgRang', `background-image: url('bg/${bgRang(Number(procent))}.jpg');`)
               log(`RANG: ${bgRang(Number(procent))}`);

               let up = false

               if (nowRang > oldRang) {
                  // повышен ранг 

                  video('upgrade')


                  up = true

               } else {

                  // if (nowRang !== oldRang) {
                  //    // понижен ранг 

                  //    document.querySelector('[data-video-2]').style = 'display: block;'
                  //    document.querySelector('[data-video-2]').play()
                  // }

               }

               log(`UPPPPPPP${up}`);


               if (checkDate) {

                  if (procent > checkDate.o) {
                     // (больше open)

                     document.querySelector('[data-procent]').style.color = 'rgb(75, 192, 192)'

                     let profit = procent - checkDate.o
                     profit = profit.toFixed(2)

                     let docProfit = document.querySelector('[data-profit]')

                     docProfit.innerText = `+${profit}%`
                     docProfit.style.color = 'rgb(75, 192, 192)'
                     docProfit.style.backgroundColor = 'rgba(75, 192, 192, 0.5)'

                     if (procent > checkDate.c) {

                        if (checkDate.c < checkDate.o) {
                           if (!up) {
                              video('general')
                              log(`general: ${checkDate.c} < ${checkDate.o}`);
                           }
                        }

                        if (procent > checkDate.h) {
                           checkDate.h = procent

                           if (!up) {
                              video('general')
                              log(`general: ${procent} > ${checkDate.h}`);
                           }
                        } else {
                           if (!up) {
                              video('general') // oldWin
                              log(`general: ${procent} > ${checkDate.c}`);
                           }
                        }


                     } else {

                        log('est1');


                        if (!up) {
                           log('est2');

                           video('lose') // oldLose
                           log(`lose: ${procent} < ${checkDate.c}`);
                        }

                     }


                  } else {
                     // (меньше open)

                     document.querySelector('[data-procent]').style.color = 'rgb(255, 99, 132)'


                     let profit = procent - checkDate.o
                     profit = profit.toFixed(2)

                     let docProfit = document.querySelector('[data-profit]')

                     docProfit.innerText = `${profit}%`
                     docProfit.style.color = 'rgb(255, 99, 132)'
                     docProfit.style.backgroundColor = 'rgba(255, 99, 132, 0.5)'


                     if (procent > checkDate.c) {

                        if (!up) {
                           video('general') // oldWin
                           log(`general: ${procent} > ${checkDate.l}`);
                        }

                     } else {

                        if (procent < checkDate.l) {
                           checkDate.l = procent

                           if (!up) {
                              video('lose')
                              log(`lose: ${procent} < ${checkDate.l}`);
                           }
                        } else {
                           if (!up) {
                              video('lose') // oldLose
                              log(`lose: ${procent} < ${checkDate.c}`);
                           }
                        }

                     }

                  }

                  checkDate.c = procent

               }

               chart.update()

               set('barData', JSON.stringify(barData))

               const base = document.querySelector('[data-body]').innerHTML
               set('base', base)

               const stat = document.querySelector('[data-stat]').innerHTML
               set('stat', stat)

               const moneyStat = document.querySelector('[data-money-stat]').innerHTML
               set('moneyStat', moneyStat)
               const noteStat = document.querySelector('[data-note-stat]').innerHTML
               set('noteStat', noteStat)


            }

            if (targ.hasAttribute('data-pos-span')) {

               let points = document.querySelectorAll('[data-pos-point]')

               if (points.length > 1) {

                  let sortPoints = Array.from(points).sort((a, b) => {
                     return Number(b.querySelector('[data-span]').innerText) - Number(a.querySelector('[data-span]').innerText)
                  })

                  let posList = document.querySelector('[data-pos-list]')
                  posList.innerHTML = ''

                  sortPoints.forEach(e => {

                     posList.insertAdjacentHTML('beforeend', `${e.outerHTML}`)
                  })

               }

            }


            if (targ.hasAttribute('data-neg-span')) {

               let points = document.querySelectorAll('[data-neg-point]')

               if (points.length > 1) {

                  let sortPoints = Array.from(points).sort((a, b) => {
                     return Number(b.querySelector('[data-span]').innerText) - Number(a.querySelector('[data-span]').innerText)
                  })

                  let posList = document.querySelector('[data-neg-list]')
                  posList.innerHTML = ''

                  sortPoints.forEach(e => {

                     posList.insertAdjacentHTML('beforeend', `${e.outerHTML}`)
                  })

               }

            }

            const base = document.querySelector('[data-body]').innerHTML
            set('base', base)

            const stat = document.querySelector('[data-stat]').innerHTML
            set('stat', stat)

            const moneyStat = document.querySelector('[data-money-stat]').innerHTML
            set('moneyStat', moneyStat)
            const noteStat = document.querySelector('[data-note-stat]').innerHTML
            set('noteStat', noteStat)



         }

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainNum()
            input.remove()

            taskShadow.classList.remove('_active')


         }


      })

   }

   if (targ.closest('[data-name]')) {

      const taskShadow = document.querySelector('[data-task-shadow]')
      taskShadow.classList.add('_active')


      let oldValueString = targ.innerText
      let oldValue = oldValueString

      let input = document.createElement('input')

      input.type = 'text'
      input.value = oldValue


      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 80px;'
      input.setAttribute('tabindex', '-1')

      document.body.appendChild(input)

      input.focus()

      function name() {

         let newValue = input.value || oldValue

         let num = newValue

         input.style = ''

         targ.innerText = newValue

         const base = document.querySelector('[data-body]').innerHTML
         set('base', base)

         const stat = document.querySelector('[data-stat]').innerHTML
         set('stat', stat)

         const moneyStat = document.querySelector('[data-money-stat]').innerHTML
         set('moneyStat', moneyStat)
         const noteStat = document.querySelector('[data-note-stat]').innerHTML
         set('noteStat', noteStat)

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            name()
            input.remove()

            taskShadow.classList.remove('_active')

         }

      })


   }

   if (targ.closest('[data-mark]')) {

      let targShell = targ.closest('[data-mark]').closest('[data-shell]')
      // const targMark = targ.closest('[data-mark]')
      const targText = targShell.querySelector('[data-text]')
      const targNum = targShell.querySelector('[data-num]')
      const targMax = targShell.querySelector('[data-max]')
      const targTaskDecor = targShell.querySelector('[data-task-decor]')
      let targBody = targShell.closest('[data-task-body]')

      if (!targBody) {
         document.querySelectorAll('[data-task-body]').forEach((e) => {
            if (e.classList.contains('_active')) {
               targBody = e
            }
         })
      }

      if (!targBody.classList.contains('_start')) {
         targBody.classList.add('_start')
      }

      const targBodyAtt = targBody.getAttribute('data-task-body')
      const targDate = targShell.querySelector('[data-date]')
      const rewardNum = Number(targShell.querySelector('[data-reward]').innerText)

      const hasNoteCategorie = targShell.hasAttribute('data-note-categorie')

      const markRang = targShell.querySelector('[data-mark-rang]')

      let num = Number(targNum.innerText)
      const newNum = Number(num) + 1
      const procent = newNum / Number(targMax.innerText) * 100

      // const oldNum =  Number(targNum.innerText)

      // if (targText.innerText === 'вода' && Number(num) !== Number(targMax.innerText)) {

      //    if (document.querySelector('[data-turn="notification"]').classList.contains('_active')) {

      //       set('waterEnd', Date.now() + 3600 * 1000)

      //       setTimeout(() => {

      //          'setTimeout start'

      //          
      //             if (${Number(document.querySelector(`[data-task-body="${targBodyAtt}"] [data-num]`).innerText)} === ${newNum}) {
      //             `);
      //          Number(document.querySelector(`[data-task-body="${targBodyAtt}"] [data-num]`).innerText) === newNum)

      //          if (Number(document.querySelector(`[data-task-body="${targBodyAtt}"] [data-num]`).innerText) === newNum) {

      //             navigator.serviceWorker.ready.then(reg => {
      //                reg.showNotification(`вода`)
      //             })

      //             get('waterEnd') && rem('waterEnd')

      //             timer active'


      //          }

      //       }, convertTimeToMilliseconds('1.00'))

      //       `1.00`


      //    } else {
      //       'уведы выкл'
      //    }

      // }

      if ((newNum <= Number(targMax.innerText)) && (!hasNoteCategorie || targ.closest('[data-lobby-top]'))) {
         targNum.innerText = newNum

         // const now = new Date()
         // const templ = `${now.getHours()}.${now.getMinutes()}`
         // targDate.innerText = Number(templ)

         targShell.querySelector('[data-task-decor]').style = `width: ${procent}%; transition: width 0.3s ease 0s;`

      }

      if ((newNum === Number(targMax.innerText)) && (!hasNoteCategorie || targ.closest('[data-lobby-top]'))) {

         if (targ.closest('[data-lobby-top]')) {

            const targOpen = document.querySelector(`[data-task-body="${targBodyAtt}"] [data-mark]._open`)

            if (targOpen) {

               const openShell = targOpen.closest('[data-shell]')

               targOpen.classList.remove('_open')

               openShell.querySelector('[data-task-decor]').style = `width: ${procent}%; transition: width 0.3s ease 0s;`
               openShell.querySelector('[data-info]').style = `color: rgba(100, 75, 192, 1)`
               openShell.querySelector('[data-num]').innerText = '1'


            }

            // const shellAll = document.querySelectorAll('[data-task-body]._active [data-shell]')
            // shellAll.forEach((shell) => {

            // if (shell.querySelector('[data-text]').innerText === targText.innerText) {
            // shell.querySelector('[data-task-decor]').style = `width: ${procent}%; transition: width 0.3s ease 0s;`
            // shell.querySelector('[data-info]').style = `color: rgba(100, 75, 192, 1)`


            const lobbyPointAll = document.querySelectorAll('[data-lobby-point]')
            lobbyPointAll.forEach((lobbyPoint) => {

               if (lobbyPoint.classList.contains('_complete')) {
                  lobbyPoint.remove()
               }
            })
            // }

            // })

         }


         let points = Number(markRang.getAttribute('data-mark-rang')) + 1
         console.log(points);


         if (points >= 500) {
            points = 500
         }

         console.log(points);
         console.log(points >= 500);


         let rank = ranks.find(r => points >= r.min).rank;

         let iconSrc = `icon/${rank}.png`;

         let actives = 0
         let marks = 0


         targShell.querySelector('[data-task-decor]').style = `width: ${procent}%; transition: width 0.3s ease 0s;`
         targShell.querySelector('[data-info]').style = `color: rgba(100, 75, 192, 1)`
         targShell.querySelector('[data-mark-rang]').setAttribute('src', iconSrc)
         targShell.querySelector('[data-mark-rang]').setAttribute('data-mark-rang', points)

         targShell.querySelector('[data-num]').innerText = Number(targMax.innerText)

         const shellAll = document.querySelectorAll(`[data-task-body="${targBodyAtt}"] [data-shell]`)
         shellAll.forEach((shell) => {

            const shellText = shell.querySelector('[data-text]')

            if (shellText.innerText === targText.innerText) {

               marks++

               if (shell.querySelector('[data-task-decor]').style.width === '100%') {
                  actives++

               }


            }
         })

         if (marks === actives) {

            const shellAll = document.querySelectorAll(`[data-task-body="${targBodyAtt}"] [data-shell]`)
            shellAll.forEach((shell) => {

               const shellText = shell.querySelector('[data-text]')

               if (shellText.innerText === targText.innerText) {
                  shell.querySelector('[data-mark-rang]').setAttribute('src', iconSrc)
                  shell.querySelector('[data-mark-rang]').setAttribute('data-mark-rang', points)
               }

            })

         }

         video('general')
         log('general');

         const pad = (n) => String(n).padStart(2, '0');
         const today = new Date();
         const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

         let checkDate = barData3.find(obj => obj.date === date)

         num = rewardNum

         if (checkDate) {

            log('heckDate');
            log(num);


            const profitClose = checkDate.c + num
            const cleanProfitUP = profitClose - checkDate.o
            const cleanProfitDOWN = checkDate.o - profitClose
            checkDate.c = profitClose

            const statNum = document.querySelector('[data-statnote-num]')
            const statProcent = document.querySelector('[data-statnote-procent]')

            statNum.innerText = profitClose.toFixed(2)
            if (profitClose >= checkDate.o) {
               statProcent.innerText = `+${cleanProfitUP.toFixed(2)}`
               statNum.style = 'color: rgb(100, 75, 192);'
               statProcent.style = 'color: rgb(100, 75, 192); background-color: rgba(100, 75, 192, 0.5);'
            } else {
               statProcent.innerText = `-${cleanProfitDOWN.toFixed(2)}`
               statNum.style = 'color:  rgb(255, 99, 132);'
               statProcent.style = 'color:  rgb(255, 99, 132); background-color: rgba(255, 99, 132, 0.5);'
            }
            set('noteStat', document.querySelector('[data-note-stat]').innerHTML)

            if (profitClose >= checkDate.h) {
               checkDate.h = profitClose
            }

            chart3.update()

            set('barData3', JSON.stringify(barData3))
            const noteBody = document.querySelector('[data-note-body]').innerHTML
            set('noteBody', noteBody)


         }

      }

      if (hasNoteCategorie && !targ.closest('[data-lobby-top]')) {
         targ.classList.add('_open')

         document.querySelector('[data-task-main]').style.display = 'none'
         document.querySelector('[data-lobby-add]').style.display = 'flex'
         document.querySelector('[data-lobby-in]').innerHTML = targShell.outerHTML

         document.querySelector('[data-lobby-top]').style.display = 'block'

         if (document.querySelector(`[data-lobby-body="${targText.innerText}"]`)) {

            document.querySelector(`[data-lobby-body="${targText.innerText}"]`).style.display = 'block'

         } else {
            document.querySelector('[data-lobby]').insertAdjacentHTML('beforeend', `
               <div data-lobby-body="${targText.innerText}" style="display: block;">
               </div>
            `)
         }

      }

      const noteBody = document.querySelector('[data-note-body]').innerHTML
      set('noteBody', noteBody)

      // function timer() {

      //    if (targ.closest('[data-lobby-top]')) {

      //       const shells = targBody.querySelectorAll('[data-shell]')
      //       shells.forEach((shell) => {

      //          if (shell.querySelector('[data-text]').innerText === targText.innerText) {
      //             shell.classList.add('_temp')

      //             targShell = shell
      //          }

      //       })

      //    } else {
      //       targShell.classList.add('_temp')
      //    }


      //    let x = false
      //    let timeStart
      //    let allComplete = true

      //    const shellAll = targShell.closest('[data-task-body]').querySelectorAll('[data-shell]')
      //    shellAll.forEach((shell) => {

      //       const shellDecor = shell.querySelector('[data-task-decor]')

      //       // shell
      //       // if (${!x} && ${!shell.classList.contains('_temp')} && ${shell.querySelector('[data-text]').innerText} !== 'вода') {`

      //       if (!x && !shell.classList.contains('_temp') && shell.querySelector('[data-text]').innerText !== 'вода') {

      //          if (shellDecor.style.width !== '100%') {
      //             allComplete = false
      //          }

      //          // !x

      //       }

      //       if (x) {

      //          // x

      //          const time = shell.querySelector('[data-date]').innerText

      //          function parseTime(timeStr) {
      //             const [hours, minutes] = timeStr.split('.').map(Number)
      //             return hours * 60 + minutes
      //          }

      //          function formatTime(totalMinutes) {
      //             const h = Math.floor(totalMinutes / 60)
      //             const m = totalMinutes % 60
      //             return `${h}.${m.toString().padStart(2, '0')}`
      //          }

      //          function timeDiff(t1, t2) {
      //             const m1 = parseTime(t1)
      //             const m2 = parseTime(t2)
      //             const diff = m2 - m1
      //             return formatTime(diff)
      //          }

      //          const difference = timeDiff(timeStart, time)

      //          log
      //             timeStart: ${timeStart} timeStart: ${time}
      //          `)

      //          log
      //             const ${difference} = ${timeDiff(timeStart, time)}
      //          `)

      //          if (shellDecor.style.width !== '100%' && allComplete) {

      //             set('taskEnd', Date.now() + convertTimeToMilliseconds(difference))


      //             const shellAll = document.querySelectorAll('[data-shell]')
      //             shellAll.forEach((shell) => {
      //                shell.classList.remove('_taskEnd')

      //             })

      //             shell.classList.add('_taskEnd')


      //             setTimeout(() => {

      //                if (shellDecor.style.width !== '100%') {
      //                   navigator.serviceWorker.ready.then(reg => {
      //                      reg.showNotification(shell.querySelector('[data-text]').innerText)
      //                   })

      //                   get('taskEnd') && rem('taskEnd')

      //                }


      //             }, convertTimeToMilliseconds(difference))

      //          }


      //          if (shell && shellDecor.style.width !== '100%' && allComplete) {

      //             log
      //                               ${shell.querySelector('[data-text]').innerText}

      //             ${difference}

      //             `);
      //          }


      //          x = false

      //       }

      //       if (shell.classList.contains('_temp') && !shell.classList.contains('_water')) {
      //          const time = shell.querySelector('[data-date]').innerText

      //          x = true
      //          timeStart = time
      //       }

      //    })

      //    const dropdown = document.querySelector('[data-dropdown]')
      //    dropdown && dropdown.remove()

      //    const shadow = document.querySelector('[data-season-shadow]')
      //    shadow.classList.remove('_active')

      //    const activeDinamName = document.querySelector('[data-dinam-titul-name]._active')
      //    activeDinamName && activeDinamName.classList.remove('_active')

      //    targShell.classList.remove('_temp')


      //    set('noteBody', document.querySelector('[data-note-body]').innerHTML)

      // }
      // timer()

   }

   if (targ.closest('[data-turn]')) {
      const targTurn = targ.closest('[data-turn]')
      const att = targTurn.getAttribute('data-turn')

      if (att === 'edit') {

      }

      if (att === 'notification') {

      }

      if (!targTurn.classList.contains('_active')) {
         targTurn.classList.add('_active')
         targTurn.querySelector('[data-turn-state]').innerText = 'вкл'
      } else {
         targTurn.classList.remove('_active')
         targTurn.querySelector('[data-turn-state]').innerText = 'выкл'

      }

      document.querySelector('[data-burger]').classList.remove('_active')
      document.querySelector('[data-shadow]').classList.remove('_active')

      set('burger', document.querySelector('[data-burger]').innerHTML)

   }

   if (targ.closest('[data-end]')) {

      const elems = document.querySelectorAll('[data-task-body]._start [data-shell]') // || document.querySelectorAll('[data-task-body]._active [data-shell]')
      const decors = document.querySelectorAll('[data-task-body]._start [data-task-decor]') // || document.querySelectorAll('[data-task-body]._active [data-task-decor]')

      const length = elems.length
      let x = 0
      log(`LENGTH: ${length}`);

      elems.forEach((elem) => {
         log(`SUCCES: ${elem.style.width} === 100%`);

         const shell = elem
         const markRang = shell.querySelector('[data-mark-rang]')
         const decor = elem.querySelector('[data-task-decor]')

         if (decor.style.width === '100%') {
            x = x + 1

            log('ES');

         } else {

            const pad = (n) => String(n).padStart(2, '0');
            const today = new Date();
            const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

            let checkDate = barData3.find(obj => obj.date === date)

            let num = Number(shell.querySelector('[data-reward]').innerText)

            if (checkDate) {

               const loseClose = checkDate.c - num
               const cleanLoseDOWN = checkDate.o - loseClose
               const cleanLoseUP = loseClose - checkDate.o
               checkDate.c = loseClose

               const statNum = document.querySelector('[data-statnote-num]')
               const statProcent = document.querySelector('[data-statnote-procent]')

               statNum.innerText = loseClose.toFixed(2)
               if (loseClose <= checkDate.o) {
                  statProcent.innerText = `-${cleanLoseDOWN.toFixed(2)}`
                  statNum.style = 'color:  rgb(255, 99, 132);'
                  statProcent.style = 'color: rgb(255, 99, 132); background-color: rgba(255, 99, 132, 0.5);'

               } else {
                  statProcent.innerText = `+${cleanLoseUP.toFixed(2)}`
                  statNum.style = 'color:  rgba(100, 75, 192, 1);'
                  statProcent.style = 'color: rgba(100, 75, 192, 1); background-color: rgba(100, 75, 192, 0.5);'
               }

               if (loseClose <= checkDate.l) {
                  checkDate.l = loseClose
               }



            }

            log(shell);
            log(markRang);
            log(markRang.getAttribute('data-mark-rang'));


            const downRang = downgradeMin(Number(markRang.getAttribute('data-mark-rang')))

            log(downRang)

            log(`
               if (${Number(markRang.getAttribute('data-mark-rang'))} !== 0) {
            `)

            if (Number(markRang.getAttribute('data-mark-rang')) !== 0) {
               let points = downRang.min

               let rank = ranks.find(r => points >= r.min).rank;

               let iconSrc = `icon/${rank}.png`;

               markRang.setAttribute('src', iconSrc)
               markRang.setAttribute('data-mark-rang', points)
            }


         }

         shell.querySelector('[data-num]').innerText = '0'

         shell.querySelector('[data-info]').classList.remove('_active')

         shell.querySelector('[data-task-decor]').style = `width: 0%; transition: width 0.3s ease 0s;`
         shell.querySelector('[data-info]').style = 'color: white;'

      })


      if (x === length && length !== 0) {
         video('absolute')

      } else {
         video('lose') // oldLose

      }

      log(`SUCCES: ${x} === ${length}`);

      // decors.forEach((elem) => {

      // })


      set('startDate', showDateTime())

      set('noteStat', document.querySelector('[data-note-stat]').innerHTML)

      chart3.update()

      set('barData3', JSON.stringify(barData3))
      set('noteBody', document.querySelector('[data-note-body]').innerHTML)


      const bodyStart = document.querySelector('[data-task-body]._start')


      bodyStart && bodyStart.classList.remove('_start')
   }

   function isDropdownOutOfView(dropdownElement) {
      // Получаем позицию и размеры дропдауна
      const dropdownRect = dropdownElement.getBoundingClientRect();

      // Проверяем, выходит ли нижняя часть дропдауна за нижнюю границу окна
      const bottom = dropdownRect.bottom > window.innerHeight - 50;
      log(`
         const ${bottom} = ${dropdownRect.bottom} > ${window.innerHeight};
      `)

      // Проверяем, выходит ли левая часть дропдауна за левую границу окна
      let left = dropdownRect.left

      if (left >= 0) {
         left = false
      } else {
         left = true
      }

      log(`
         const ${left} = ${dropdownRect.left} > ${window.innerWidth};
      `)

      return { bottom, left };
   }




   if (targ.closest('[data-date]')) {
      const targShell = targ.closest('[data-shell]')
      const targDate = targShell.querySelector('[data-date]')
      const targtext = targShell.querySelector('[data-text]')
      const taskShadow = document.querySelector('[data-task-shadow]')

      let createLobby

      if (targ.closest('[data-shell]').hasAttribute('data-note-categorie')) {
         createLobby = ''
      } else {
         createLobby = '<button data-create-lobby>категория</button>'
      }


      if (!document.querySelector('[data-dropdown]')) {
         targtext.classList.add('_active')
         taskShadow.classList.add('_active')

         const rect = targDate.getBoundingClientRect()

         let main = `
          <button data-create>создать</button>
           <button data-rename>изменить</button>
           <button data-dublicate>дублировать</button>
           <button data-transport>переместить</button>
           <button data-move-up>выше</button>
           <button data-move-down>ниже</button>
           <button data-cancel>отменить</button>
           <button data-delete>удалить</button>
         `

         if (targ.closest('[data-lobby-top]')) {
            main = `
               <button data-relobby>рекатегория</button>
            `
         }

         const div = document.createElement('div')
         div.setAttribute('data-dropdown', '')
         div.style.width = "105px"
         div.style.position = 'absolute'
         div.style.left = `${rect.left + window.scrollX}px`
         div.style.visibility = 'hidden'
         div.innerHTML = `
           ${createLobby}
            ${main}
         `

         document.body.appendChild(div)

         const dropdownHeight = div.offsetHeight
         const spaceBelow = window.innerHeight - rect.bottom
         const spaceAbove = rect.top

         if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            div.style.top = `${rect.top + window.scrollY - dropdownHeight}px`
         } else {
            div.style.top = `${rect.bottom + window.scrollY}px`
         }

         div.style.visibility = 'visible'
      }


   }

   if (targ.closest('[data-view-tabs]')) {
      const targElem = targ.closest('[data-view-tabs]')

      if (!targElem.classList.contains('_active')) {
         targElem.classList.add('_active')
         targElem.querySelector('[data-view-turn]').innerText = 'вкл'
         document.querySelector('[data-task-tabs]').style.display = 'flex'

      } else {
         targElem.classList.remove('_active')
         targElem.querySelector('[data-view-turn]').innerText = 'выкл'
         document.querySelector('[data-task-tabs]').style.display = 'none'
      }

      document.querySelector('[data-burger]').classList.remove('_active')
      document.querySelector('[data-shadow]').classList.remove('_active')

      set('burger', document.querySelector('[data-burger]').innerHTML)
      set('noteBody', document.querySelector('[data-note-body]').innerHTML)


   }

   if (targ.closest('[data-dinam-lose]')) {

      const dinamTitul = targ.closest('[data-dinam-titul]')

      dinamTitul.querySelector('[data-dinam-titul-num]').innerText = '0'

      dinamTitul.querySelector('[data-dinam-rank]').setAttribute('data-dinam-rank', '0')
      dinamTitul.querySelector('[data-dinam-rank]').setAttribute('src', 'icon/0.png')

      const dropdown = document.querySelector('[data-dropdown]')
      dropdown && dropdown.remove()

      const shadow = document.querySelector('[data-season-shadow]')
      shadow.classList.remove('_active')

      const activeDinamName = document.querySelector('[data-dinam-titul-name]._active')
      activeDinamName && activeDinamName.classList.remove('_active')

      document.querySelector('[data-burger-2]').classList.remove('_active')

      video('lose')

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

   }

   if (targ.closest('[data-dinam-create]')) {

      const dinamTitul = targ.closest('[data-dinam-titul]')

      const dropdown = document.querySelector('[data-dropdown]')
      dropdown && dropdown.remove()


      let input = document.createElement('input')
      let inputSecond = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC; z-index: 1500;'
      input.setAttribute('tabindex', '-1')
      input.setAttribute('placeholder', 'название')

      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 40px; color: gray; z-index: 1500;'
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('placeholder', 'день')
      inputSecond.setAttribute('data-input-second', '')

      document.body.appendChild(input)
      document.body.appendChild(inputSecond)

      input.focus()

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })

      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            if ((inputSecond.value || inputSecond.value === 0) && (input.value !== '')) {

               const newText = input.value
               dinamTitul.insertAdjacentHTML('afterend', `
               <div data-dinam-titul style="display: flex; gap: 5px;">
                  <div data-dinam-titul-name>${newText}</div>
                  <span>-</span>
                  <div style="display: flex;">
                     <div data-dinam-titul-num>${inputSecond.value}</div>
                     <span>д</span>
                  </div>
               </div>
                `)


               input.remove()
               inputSecond.remove()

               const activeDinamName = document.querySelector('[data-dinam-titul-name]._active')
               activeDinamName && activeDinamName.classList.remove('_active')

               const shadow = document.querySelector('[data-season-shadow]')
               shadow.classList.remove('_active')

               set('burger2', document.querySelector('[data-burger-2]').innerHTML)


            }

         }

      })

   }

   if (targ.closest('[data-dinam-delete]')) {
      targ.closest('[data-dinam-titul]').remove()

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

   }

   if (targ.closest('[data-dinam-up]')) {
      const dinamTitul = targ.closest('[data-dinam-titul]')
      if (dinamTitul.previousElementSibling) {
         const dropdown = document.querySelector('[data-dropdown]')
         dropdown && dropdown.remove()
         dinamTitul.previousElementSibling.insertAdjacentHTML('beforebegin', dinamTitul.outerHTML)
         dinamTitul.remove()
      }

      const shadow = document.querySelector('[data-season-shadow]')
      const activeDinamName = document.querySelector('[data-dinam-titul-name]._active')

      shadow.classList.remove('_active')
      activeDinamName && activeDinamName.classList.remove('_active')

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)


   }

   if (targ.closest('[data-dinam-down]')) {
      const dinamTitul = targ.closest('[data-dinam-titul]')
      if (dinamTitul.nextElementSibling) {
         const dropdown = document.querySelector('[data-dropdown]')
         dropdown && dropdown.remove()
         dinamTitul.nextElementSibling.insertAdjacentHTML('afterend', dinamTitul.outerHTML)
         dinamTitul.remove()
      }

      const shadow = document.querySelector('[data-season-shadow]')
      const activeDinamName = document.querySelector('[data-dinam-titul-name]._active')

      shadow.classList.remove('_active')
      activeDinamName && activeDinamName.classList.remove('_active')

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)


   }

   if (targ.closest('[data-dinam-rename]')) {

      const input = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC; z-index: 1500;'
      input.setAttribute('tabindex', '-1')

      document.body.appendChild(input)

      input.focus()

      const dinamTitul = targ.closest('[data-dinam-titul]')
      const dinamName = dinamTitul.querySelector('[data-dinam-titul-name]')

      const dropdown = document.querySelector('[data-dropdown]')
      log(dropdown)

      dropdown && dropdown.remove()

      const shadow = document.querySelector('[data-season-shadow]')
      shadow.classList.add('_active')

      input.value = dinamName.innerText


      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            const newText = input.value
            if (newText !== '' && newText) {

               dinamName.innerText = newText

            }

            input.remove()

            shadow.classList.remove('_active')

            const activeDinamName = document.querySelector('[data-dinam-titul-name]._active')
            activeDinamName && activeDinamName.classList.remove('_active')

            set('burger2', document.querySelector('[data-burger-2]').innerHTML)


         }

      })

   }

   if (targ.closest('[data-dinam-titul]')) {
      const dinamTitul = targ.closest('[data-dinam-titul]')
      const dinamName = dinamTitul.querySelector('[data-dinam-titul-name]')
      const seasonShadow = document.querySelector('[data-season-shadow]')

      dinamName.classList.add('_active')
      seasonShadow.classList.add('_active')
      dinamTitul.insertAdjacentHTML('afterbegin', `
         <div data-dropdown>
            <button data-dinam-lose>провалить</button>
            <button data-dinam-create>создать</button>
            <button data-dinam-rename>изменить</button>
            <button data-dinam-up>выше</button>
            <button data-dinam-down>ниже</button>
            <button data-dinam-delete>удалить</button>
         </div>
            `)

      const dropdown = document.querySelector('[data-dropdown]')
      const { bottom, left } = isDropdownOutOfView(dropdown)
      if (bottom) {
         dropdown.style.top = 'auto';
         dropdown.style.bottom = '100%';
      }




   }

   if (targ.closest('[data-season-shadow]')) {
      const input = document.querySelector("input[tabindex='-1']")
      const inputSecond = document.querySelector('[data-input-second]')

      const dinamName = document.querySelector('[data-dinam-titul-name]._active')
      dinamName && dinamName.classList.remove('_active')

      const dropdown = document.querySelector('[data-dropdown]')
      dropdown && dropdown.remove()

      const shadow = targ.closest('[data-season-shadow]')
      shadow.classList.remove('_active')


      input && input.remove('_active')
      inputSecond && inputSecond.remove('_active')

   }

   if (targ.closest('[data-test]')) {
      setTimeout(() => {

         navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(`test`)
         })


      }, 3000)
   }


   if (targ.closest('[data-asset]')) {
      const asset = targ.closest('[data-asset]')
      const targtext = asset.querySelector('[data-asset-text]')
      const taskShadow = document.querySelector('[data-task-shadow]')

      if (!document.querySelector('[data-dropdown]')) {
         targtext.classList.add('_active')
         taskShadow.classList.add('_active')
         asset.insertAdjacentHTML('beforeend', `
         <div data-dropdown>
            <button data-asset-create>создать</button>
            <button data-asset-rename>изменить</button>
            <button data-asset-convert>конвертировать</button>
            <button data-asset-move-up>выше</button>
            <button data-asset-move-down>ниже</button>
            <button data-asset-delete>удалить</button>
         </div>
            `)

         const dropdown = document.querySelector('[data-dropdown]')
         const { bottom, left } = isDropdownOutOfView(dropdown)
         if (bottom) {
            dropdown.style.top = 'auto';
            dropdown.style.bottom = '100%';
         }

      }

   }

   if (targ.closest('[data-money-tab]')) {

      const elemTarg = targ.closest('[data-money-tab]')
      const att = elemTarg.getAttribute('data-money-tab')

      if (!elemTarg.classList.contains('_active')) {
         const old = document.querySelector('[data-money-tab]._active')
         old.classList.remove('_active')
         elemTarg.classList.add('_active')

         if (att === 'transactions') {
            document.querySelector('[data-money]').classList.add('_active')
            document.querySelector('[data-assets]').classList.remove('_active')

            document.querySelector('[data-money-pos-add]').style.display = 'flex'

            if (!document.querySelector('[data-money-neg-add]').classList.contains('_block')) document.querySelector('[data-money-neg-add]').style.display = 'flex'

         } else {
            document.querySelector('[data-money]').classList.remove('_active')
            document.querySelector('[data-assets]').classList.add('_active')

            document.querySelector('[data-money-pos-add]').style.display = 'none'
            document.querySelector('[data-money-neg-add]').style.display = 'none'

         }
      }

   }

   if (targ.closest('[data-delete]')) {

      log(1);


      const targShell = document.querySelector('[data-text]._active').closest('[data-shell]')
      const targText = targShell.querySelector('[data-text]')
      const textActive = document.querySelector('[data-text]._active')
      const taskShadow = document.querySelector('[data-task-shadow]')

      const taskBody = textActive.closest('[data-task-body]')

      // if (document.querySelector(`[data-lobby="${targText}"]`)) document.querySelector(`[data-lobby="${targText}"]`).remove()

      let length = 0

      if (targShell.hasAttribute('data-note-categorie')) {

         const shellAll = taskBody.querySelectorAll('[data-shell]')
         shellAll.forEach((shell) => {

            log(1);


            if (shell.querySelector('[data-text]').innerText === targText.innerText) {
               length++
            }

         })

         log(length);


         if (length === 1) {
            log(1);

            if (document.querySelector(`[data-lobby-body="${targText.innerText}"]`)) document.querySelector(`[data-lobby-body="${targText.innerText}"]`).remove()
         }

      }

      targShell.remove()
      taskShadow.classList.remove('_active')

      document.querySelector('[data-dropdown]').remove()

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-asset-delete]')) {

      const targAsset = targ.closest('[data-asset]')
      const taskShadow = document.querySelector('[data-task-shadow]')

      targAsset.remove()
      taskShadow.classList.remove('_active')

      set('assets', document.querySelector('[data-assets]').innerHTML)


   }

   if (targ.closest('[data-asset-move-up]')) {
      const asset = targ.closest('[data-asset]')
      document.querySelector('[data-dropdown]').remove()
      if (asset.previousElementSibling) {
         asset.previousElementSibling.insertAdjacentHTML('beforebegin', asset.outerHTML)
         asset.remove()
      }
      document.querySelector('[data-task-shadow]').classList.remove('_active')
      document.querySelector('[data-asset-text]._active').classList.remove('_active')

      set('assets', document.querySelector('[data-assets]').innerHTML)

   }

   if (targ.closest('[data-asset-move-down]')) {
      const asset = targ.closest('[data-asset]')
      document.querySelector('[data-dropdown]').remove()
      if (asset.nextElementSibling) {
         asset.nextElementSibling.insertAdjacentHTML('afterend', asset.outerHTML)
         asset.remove()
      }
      document.querySelector('[data-task-shadow]').classList.remove('_active')
      document.querySelector('[data-asset-text]._active').classList.remove('_active')

      set('assets', document.querySelector('[data-assets]').innerHTML)

   }

   if (targ.closest('[data-rename]')) {

      const targShell = document.querySelector('[data-text]._active').closest('[data-shell]')
      const targText = targShell.querySelector('[data-text]')
      const targDropdown = document.querySelector('[data-dropdown]')
      const taskShadow = document.querySelector('[data-task-shadow]')
      const targDate = targShell.querySelector('[data-date]')
      const targMax = targShell.querySelector('[data-max]')
      const targNum = targShell.querySelector('[data-num]')
      let waterMax
      if (targText.innerText === 'вода') {
         waterMax = Number(targMax.innerText)
      }


      taskShadow.classList.add('_active')
      targDropdown.remove()

      let input = document.createElement('input')
      let inputSecond = document.createElement('input')
      let inputThird = document.createElement('input')
      let inputFourth = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')
      input.setAttribute('placeholder', 'название')

      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 40px; color: #FCFCFC;'
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('placeholder', 'таймер')
      inputSecond.setAttribute('data-input-second', '')

      inputThird.type = 'number'
      inputThird.style = 'position: fixed; bottom: 60px; left: 200px; width: 40px; color: #FCFCFC;'
      inputThird.setAttribute('tabindex', '-1')
      inputThird.setAttribute('placeholder', 'время')
      inputThird.setAttribute('data-input-third', '')

      document.body.appendChild(input)
      document.body.appendChild(inputSecond)
      document.body.appendChild(inputThird)


      if (waterMax) {

         inputFourth.type = 'number'
         inputFourth.style = 'position: fixed; bottom: 60px; left: 265px; width: 40px; color: #FCFCFC;'
         inputFourth.setAttribute('tabindex', '-1')
         inputFourth.setAttribute('data-input-fourth', '')
         document.body.appendChild(inputFourth)
         inputFourth.value = waterMax

      }


      input.focus()

      input.value = targText.innerText
      inputSecond.value = targDate.innerText


      const infoTime = targShell.querySelector('[data-info-time]')
      const infoTimeDiv = targShell.querySelector('[data-info-time] div')

      if (infoTimeDiv) {
         inputThird.value = Number(infoTimeDiv.innerText)
      } else {
         inputThird.value = 0
      }


      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })

      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            inputThird.focus()

         }

      })

      function main() {

         if (inputSecond.value && input.value !== '') {

            const newText = input.value
            if (newText !== '' && newText) {

               if (document.querySelector(`[data-lobby-body="${targText.innerText}"]`)) {
                  document.querySelector(`[data-lobby-body="${targText.innerText}"]`).setAttribute('data-lobby-body', newText)
               }

               targText.innerText = newText
               targDate.innerText = inputSecond.value
               if ((waterMax) && (inputFourth.value > Number(targNum.innerText)) && (inputFourth.value < targMax.innerText)) {
                  targMax.innerText = inputFourth.value
               }

               log(Number(inputThird.value));

               if (Number(inputThird.value)) {

                  if (targShell.hasAttribute('data-note-categorie')) {
                     infoTimeDiv.innerText = inputThird.value
                  }

                  const nextShell = targShell.nextElementSibling

                  if (nextShell && Number(inputThird.value)) {

                     const nextShellDate = nextShell.querySelector('[data-date]')

                     const nextNewDate = Number(targDate.innerText) + Number(inputThird.value)

                     const oldTime = Number(nextShellDate.innerText)

                     nextShellDate.innerText = nextNewDate.toFixed(2)

                     nextShell.classList.add('_newTime')

                     let x = false
                     let timeStart = oldTime

                     log('est');


                     const shellAll = targShell.closest('[data-task-body]').querySelectorAll('[data-shell]')
                     shellAll.forEach((shell) => {

                        const date = shell.querySelector('[data-date]')

                        if (x) {

                           const time = Number(date.innerText)

                           const difference = time - timeStart

                           const result = nextNewDate + difference
                           date.innerText = result.toFixed(2)

                        }

                        if (shell.classList.contains('_newTime')) {
                           x = true
                        }

                     })


                  }

               }

            }

            input.remove()
            inputSecond.remove()
            inputThird.remove()
            if (waterMax) {
               inputFourth.remove()
            }


            targText.classList.remove('_active')
            taskShadow.classList.remove('_active')

            const newTime = document.querySelector('[data-shell]._newTime')
            newTime && newTime.classList.remove('_newTime')

            set('noteBody', document.querySelector('[data-note-body]').innerHTML)

         }

      }


      inputThird.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()


            if (waterMax) {
               inputFourth.focus()
            } else {
               main()
            }

         }

      })

      if (waterMax) {

         inputFourth.addEventListener('keydown', (event) => {

            if (event.key === 'Enter') {
               event.preventDefault()

               main()

            }

         })
      }


   }

   if (targ.closest('[data-asset-rename]')) {

      document.querySelector('[data-money-pos-add]').style.display = 'none'
      document.querySelector('[data-money-neg-add]').style.display = 'none'
      document.querySelector('[data-task-shadow]').classList.add('_active')

      const input = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')

      document.body.appendChild(input)

      input.focus()

      const targAsset = targ.closest('[data-asset]')
      const targText = targAsset.querySelector('[data-asset-text]')
      const moneyTextAll = document.querySelectorAll('[data-money-text]')
      const targDropdown = document.querySelector('[data-dropdown]')
      const taskShadow = document.querySelector('[data-task-shadow]')

      targDropdown.remove()
      input.value = targText.innerText
      log(`TARGTEXT: ${String(targText.innerText)}`);


      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            const newText = input.value
            if (newText !== '' && newText) {

               moneyTextAll.forEach((moneyText) => {

                  if (moneyText.innerText === targText.innerText) {
                     moneyText.innerText = newText
                  }

               })


               const categorieAll = document.querySelectorAll('[data-money-categorie]')
               categorieAll.forEach((categorie) => {

                  if (categorie.innerText === targText.innerText) {
                     categorie.innerText = newText
                  }
               })

               targText.innerText = newText

            }

            input.remove()

            targText.classList.remove('_active')
            taskShadow.classList.remove('_active')
            document.querySelector('[data-asset-text]._active') && document.querySelector('[data-asset-text]._active').classList.remove('_active')
            document.querySelector('[data-money-pos-add]').style.display = 'flex'
            document.querySelector('[data-money-neg-add]').style.display = 'flex'

            set('assets', document.querySelector('[data-assets]').innerHTML)



         }

      })

   }

   if (targ.closest('[data-asset-convert]')) {
      targ.closest('[data-asset-convert]').insertAdjacentHTML('afterbegin', document.querySelector('[data-money-categories]').outerHTML)
      document.querySelector('[data-money-categories]').style = 'top: 0px; right: 100%; display: flex; position: absolute;'

      set('assets', document.querySelector('[data-assets]').innerHTML)

   }

   if (targ.closest('[data-cancel]')) {

      const targShell = document.querySelector('[data-text]._active').closest('[data-shell]')
      const targText = targShell.querySelector('[data-text]')
      const targDropdown = document.querySelector('[data-dropdown]')
      const taskShadow = document.querySelector('[data-task-shadow]')

      const targDecor = targShell.querySelector('[data-task-decor]')
      const targNum = targShell.querySelector('[data-num]')
      const targInfo = targShell.querySelector('[data-info]')

      targText.classList.remove('_active')
      targDropdown.remove()
      taskShadow.classList.remove('_active')

      const markRang = targShell.querySelector('[data-mark-rang]')
      const markRangAtt = Number(markRang.getAttribute('data-mark-rang'))

      let actives = 0
      let marks = 0

      const targBody = targShell.closest(`[data-task-body]`)
      const shellAll = targBody.querySelectorAll('[data-shell]')

      shellAll.forEach((shell) => {

         const shellText = shell.querySelector('[data-text]')

         if (shellText.innerText === targText.innerText) {

            marks++

            if (shell.querySelector('[data-task-decor]').style.width === '100%') {
               actives++

            }

         }
      })

      if (marks === actives) {

         let points = markRangAtt - 1

         let rank = ranks.find(r => points >= r.min).rank;

         let iconSrc = `icon/${rank}.png`;

         const shellAll = targBody.querySelectorAll('[data-shell]')
         shellAll.forEach((shell) => {

            const shellText = shell.querySelector('[data-text]')

            if (shellText.innerText === targText.innerText) {
               shell.querySelector('[data-mark-rang]').setAttribute('src', iconSrc)
               shell.querySelector('[data-mark-rang]').setAttribute('data-mark-rang', points)
            }

         })

      }

      targDecor.style = 'width: 0%; transition: width 0.3s ease 0s;'
      targInfo.style = 'color: white;'
      targNum.innerText = 0

      if (targShell.querySelector('[data-task-decor]').style.width !== '100%') {

         if (markRangAtt !== 0) {

            let points = markRangAtt - 1

            let rank = ranks.find(r => points >= r.min).rank;

            let iconSrc = `icon/${rank}.png`;

            markRang.setAttribute('src', iconSrc)
            markRang.setAttribute('data-mark-rang', points)

         }

      }


      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-move-up]')) {
      const shell = document.querySelector('[data-text]._active').closest('[data-shell]')
      document.querySelector('[data-dropdown]').remove()
      if (shell.previousElementSibling) {
         shell.previousElementSibling.insertAdjacentHTML('beforebegin', shell.outerHTML)
         shell.remove()
      }
      document.querySelector('[data-task-shadow]').classList.remove('_active')
      document.querySelector('[data-text]._active').classList.remove('_active')

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)
   }

   if (targ.closest('[data-dublicate]')) {
      const shell = document.querySelector('[data-text]._active').closest('[data-shell]')
      document.querySelector('[data-text]._active').classList.remove('_active')

      if (shell.nextElementSibling) {
         shell.nextElementSibling.insertAdjacentHTML('beforebegin', shell.outerHTML)
      }
      document.querySelector('[data-task-shadow]').classList.remove('_active')
      document.querySelector('[data-dropdown]').remove()

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)
   }

   if (targ.closest('[data-move-down]')) {
      const shell = document.querySelector('[data-text]._active').closest('[data-shell]')
      document.querySelector('[data-dropdown]').remove()
      if (shell.nextElementSibling) {
         shell.nextElementSibling.insertAdjacentHTML('afterend', shell.outerHTML)
         shell.remove()
      }
      document.querySelector('[data-task-shadow]').classList.remove('_active')
      document.querySelector('[data-text]._active').classList.remove('_active')

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-create]')) {

      const targShell = document.querySelector('[data-text]._active').closest('[data-shell]')
      const targText = targShell.querySelector('[data-text]')
      const targDropdown = document.querySelector('[data-dropdown]')
      const taskShadow = document.querySelector('[data-task-shadow]')

      targDropdown.remove()

      taskShadow.classList.add('_active')

      let input = document.createElement('input')
      let inputSecond = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')
      input.setAttribute('placeholder', 'название')

      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 40px; color: gray;'
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('placeholder', 'таймер')
      inputSecond.setAttribute('data-input-second', '')

      document.body.appendChild(input)
      document.body.appendChild(inputSecond)

      input.focus()

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })

      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            if (inputSecond.value && input.value !== '') {

               const newText = input.value
               targShell.insertAdjacentHTML('afterend', `

                          <div data-shell>
                  <div data-mark>
                     <div data-task-decor style="width: 0%; transition: width 0.3s ease 0s;"></div>
                     <div class="mark-text">
                        <div data-text>${newText}</div>
                        <div data-reward>1</div>
                     </div>
                     <div data-info="">
                        <div data-info-time="">

                        </div>
                        <div data-data="">
                           <div data-num="">0</div>
                           <div>/</div>
                           <div data-max="">1</div>
                        </div>
                     </div>
                  </div>
                  <div data-right>
                     <div data-date>${Number(inputSecond.value).toFixed(2)}</div>
                     <div class="icon"><img data-mark-rang="0" src="icon/0.png"></div>
                  </div>
               </div>
                `)


               input.remove()
               inputSecond.remove()

               targText.classList.remove('_active')
               taskShadow.classList.remove('_active')

               set('noteBody', document.querySelector('[data-note-body]').innerHTML)

            }

         }

      })

   }

   if (targ.closest('[data-settings]')) {
      const burger = document.querySelector('[data-burger]')
      const shadow = document.querySelector('[data-shadow]')

      if (burger.classList.contains('_active')) {
         burger.classList.remove('_active')
         shadow.classList.remove('_active')

      } else {
         burger.classList.add('_active')
         shadow.classList.add('_active')

      }

   }

   if (targ.closest('[data-shadow]')) {
      const burger = document.querySelector('[data-burger]')
      const shadow = document.querySelector('[data-shadow]')
      burger.classList.remove('_active')
      shadow.classList.remove('_active')
      document.querySelector('[data-log]')?.classList.remove('_active')
      document.querySelector('[data-about]')?.classList.remove('_active')

   }

   if (targ.closest('[data-lobby-back]')) {
      document.querySelector('[data-lobby-top]').style.display = 'none'
      document.querySelector('[data-task-main]').style.display = 'block'



      const lobbyBodyAll = document.querySelectorAll('[data-lobby-body]')
      lobbyBodyAll.forEach((lobbyBody) => {
         lobbyBody.style.display = 'none'
      })

      const marks = document.querySelectorAll('[data-mark]')
      marks.forEach((mark) => {
         if (mark.classList.contains('_open')) {
            mark.classList.remove('_open')
         }
      })

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-relobby]')) {

      document.querySelector('[data-lobby-top]').style.display = 'none'
      document.querySelector('[data-task-main]').style.display = 'block'


      const lobbyBodyAll = document.querySelectorAll('[data-lobby-body]')
      lobbyBodyAll.forEach((lobbyBody) => {
         lobbyBody.style.display = 'none'
      })

      const targBody = document.querySelector('[data-mark]._open').closest('[data-task-body]')
      const nameCategorie = document.querySelector('[data-text]._active')

      const marks = targBody.querySelectorAll('[data-mark]')
      marks.forEach((mark) => {
         const markShell = mark.closest('[data-shell]')

         if (mark.querySelector('[data-text]').innerText === nameCategorie.innerText) {

            mark.classList.remove('_open')
            markShell.querySelector('[data-reward]').innerText = '1'
            markShell.querySelector('[data-info-time]').innerHTML = ' '
            markShell.removeAttribute('data-note-categorie')

         }
      })

      document.querySelector(`[data-lobby-body="${nameCategorie.innerText}"]`).remove()

      const taskShadow = document.querySelector('[data-task-shadow]')
      const dropdown = document.querySelector('[data-dropdown]')

      taskShadow.classList.remove('_active')
      dropdown.remove('_active')

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-about-cross]')) {
      document.querySelector('[data-about]').classList.remove('_active')

   }
   if (targ.closest('[data-log-cross]')) {
      document.querySelector('[data-log]').classList.remove('_active')

   }
   if (targ.closest('[data-collection-cross]')) {
      document.querySelector('[data-collection]').classList.remove('_active')

   }
   if (targ.closest('[data-politic-cross]')) {
      document.querySelector('[data-politic]').classList.remove('_active')

   }
   if (targ.closest('[data-polreward-cross]')) {
      document.querySelector('[data-polreward]').classList.remove('_active')

   }

   if (targ.closest('[data-about-button]')) {

      document.querySelector('[data-about]').classList.add('_active')

   }

   if (targ.closest('[data-log-button]')) {

      document.querySelector('[data-log]').classList.add('_active')

   }

   if (targ.closest('[data-collection-button]')) {

      document.querySelector('[data-collection]').classList.add('_active')

   }

   if (targ.closest('[data-politic-button]')) {

      document.querySelector('[data-politic]').classList.add('_active')

   }

   if (targ.closest('[data-polreward-button]')) {

      document.querySelector('[data-polreward]').classList.add('_active')

   }



   if (targ.closest('[data-burger2-shadow]')) {
      const dropdown = document.querySelector('[data-dropdown]')
      dropdown && dropdown.remove()
      document.querySelector('[data-politic-point]._active')?.classList.remove('_active')
      document.querySelector('[data-collection-point]._active')?.classList.remove('_active')

      const textArea = document.querySelector('textarea')
      textArea && textArea.remove('_active')
      const input = document.querySelector('input[tabindex="-1"]')
      input && input.remove('_active')
      targ.closest('[data-burger2-shadow]').classList.remove('_active')

   }


   if (targ.closest('[data-politic-up]')) {
      const point = targ.closest('[data-politic-point]')
      const burger2Shadow = targ.closest('[data-politic]').querySelector('[data-burger2-shadow]')

      document.querySelector('[data-dropdown]').remove()
      if (point.previousElementSibling) {
         point.previousElementSibling.insertAdjacentHTML('beforebegin', point.outerHTML)
         point.remove()
      }
      burger2Shadow.classList.remove('_active')
      document.querySelector('[data-politic-point]._active').classList.remove('_active')

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

   }

   if (targ.closest('[data-politic-down]')) {
      const point = targ.closest('[data-politic-point]')
      const burger2Shadow = targ.closest('[data-politic]').querySelector('[data-burger2-shadow]')

      document.querySelector('[data-dropdown]').remove()
      if (point.nextElementSibling) {
         point.nextElementSibling.insertAdjacentHTML('afterend', point.outerHTML)
         point.remove()
      }
      burger2Shadow.classList.remove('_active')
      document.querySelector('[data-politic-point]._active').classList.remove('_active')

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

   }
   if (targ.closest('[data-collection-up]')) {
      const point = targ.closest('[data-collection-point]')
      const burger2Shadow = targ.closest('[data-collection]').querySelector('[data-burger2-shadow]')

      document.querySelector('[data-dropdown]').remove()
      if (point.previousElementSibling) {
         point.previousElementSibling.insertAdjacentHTML('beforebegin', point.outerHTML)
         point.remove()
      }
      burger2Shadow.classList.remove('_active')
      document.querySelector('[data-collection-point]._active').classList.remove('_active')

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

   }

   if (targ.closest('[data-collection-down]')) {
      const point = targ.closest('[data-collection-point]')
      const burger2Shadow = targ.closest('[data-collection]').querySelector('[data-burger2-shadow]')

      document.querySelector('[data-dropdown]').remove()
      if (point.nextElementSibling) {
         point.nextElementSibling.insertAdjacentHTML('afterend', point.outerHTML)
         point.remove()
      }
      burger2Shadow.classList.remove('_active')
      document.querySelector('[data-collection-point]._active').classList.remove('_active')

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)

   }


   if (targ.closest('[data-politic-point]') && !targ.closest('[data-dropdown]')) {

      targ.closest('[data-politic-point]').insertAdjacentHTML('beforeend', `
         <div data-dropdown>
            <button data-politic-create>создать</button>
            <button data-politic-edit>изменить</button>
            <button data-politic-up>выше</button>
            <button data-politic-down>ниже</button>
            <button data-politic-delete>удалить</button>
         </div>
            `)

      const dropdown = document.querySelector('[data-dropdown]')
      const { bottom, left } = isDropdownOutOfView(dropdown)

      dropdown.style.width = '100px';

      if (bottom) {
         dropdown.style.top = 'auto';
         dropdown.style.bottom = '100%';
      }
      // if (left) {
      //    dropdown.style.roght = 'auto';
      //    dropdown.style.left = '0px';
      // }

      targ.closest('[data-politic-point]').classList.add('_active')
      targ.closest('[data-politic]').querySelector('[data-burger2-shadow]').classList.add('_active')

   }

   if (targ.closest('[data-collection-point]') && !targ.closest('[data-dropdown]')) {

      targ.closest('[data-collection-point]').insertAdjacentHTML('beforeend', `
         <div data-dropdown>
            <button data-collection-create>создать</button>
            <button data-collection-edit>изменить</button>
            <button data-collection-up>выше</button>
            <button data-collection-down>ниже</button>
            <button data-collection-delete>удалить</button>
         </div>
            `)

      const dropdown = document.querySelector('[data-dropdown]')
      const { bottom, left } = isDropdownOutOfView(dropdown)

      dropdown.style.width = '100px';

      if (bottom) {
         dropdown.style.top = 'auto';
         dropdown.style.bottom = '100%';
      }
      // if (left) {
      //    dropdown.style.roght = 'auto';
      //    dropdown.style.left = '0px';
      // }

      targ.closest('[data-collection-point]').classList.add('_active')
      targ.closest('[data-collection]').querySelector('[data-burger2-shadow]').classList.add('_active')

   }


   if (targ.closest('[data-politic-delete]')) {

      const burger2Shadow = targ.closest('[data-politic]').querySelector('[data-burger2-shadow]')
      burger2Shadow.classList.remove('_active')

      targ.closest('[data-politic-point]').remove()

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)


   }
   if (targ.closest('[data-collection-delete]')) {

      const burger2Shadow = targ.closest('[data-collection]').querySelector('[data-burger2-shadow]')
      burger2Shadow.classList.remove('_active')

      targ.closest('[data-collection-point]').remove()

      set('burger2', document.querySelector('[data-burger-2]').innerHTML)


   }

   if (targ.closest('[data-politic-edit]')) {

      const targElem = targ.closest('[data-politic-point]')

      const burger2Shadow = targ.closest('[data-politic]').querySelector('[data-burger2-shadow]')

      burger2Shadow.classList.add('_active')
      document.querySelector('[data-dropdown]').remove()


      let input = document.createElement('textarea')

      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 200px; font-size: 14px; height: 100px; color: #FCFCFC; border: none; border-radius: 5px; padding: 10px; background: rgba(29, 28, 34, 1); z-index: 5000;'
      // input.setAttribute('rows', '10')
      // input.setAttribute('cols', '100')
      input.setAttribute('placeholder', 'название')

      document.body.appendChild(input)

      input.value = targElem.innerText

      input.focus()

      function mainText() {

         targElem.innerText = input.value

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            burger2Shadow.classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()
            document.querySelector('[data-politic-point]._active').classList.remove('_active')

            set('burger2', document.querySelector('[data-burger-2]').innerHTML)

         }

      })

   }
   if (targ.closest('[data-collection-edit]')) {

      const targElem = targ.closest('[data-collection-point]')

      const burger2Shadow = targ.closest('[data-collection]').querySelector('[data-burger2-shadow]')

      burger2Shadow.classList.add('_active')
      document.querySelector('[data-dropdown]').remove()


      let input = document.createElement('textarea')

      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 200px; font-size: 14px; height: 100px; color: #FCFCFC; border: none; border-radius: 5px; padding: 10px; background: rgba(29, 28, 34, 1); z-index: 5000;'
      // input.setAttribute('rows', '10')
      // input.setAttribute('cols', '100')
      input.setAttribute('placeholder', 'название')

      document.body.appendChild(input)

      input.value = targElem.innerText

      input.focus()

      function mainText() {

         targElem.innerText = input.value

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            burger2Shadow.classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()
            document.querySelector('[data-collection-point]._active').classList.remove('_active')

            set('burger2', document.querySelector('[data-burger-2]').innerHTML)

         }

      })

   }

   if (targ.closest('[data-politic-create]')) {

      const targElem = targ.closest('[data-politic-point]')
      const burger2Shadow = targ.closest('[data-politic]').querySelector('[data-burger2-shadow]')

      document.querySelector('[data-dropdown]').remove()
      burger2Shadow.classList.add('_active')

      let input = document.createElement('textarea')

      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 200px; font-size: 14px; height: 100px; color: #FCFCFC; border: none; border-radius: 5px; padding: 10px; background: rgba(29, 28, 34, 1); z-index: 2000;'
      // input.setAttribute('rows', '10')
      // input.setAttribute('cols', '100')
      input.setAttribute('placeholder', 'название')

      document.body.appendChild(input)

      input.value = ''

      input.focus()

      function mainText() {

         targElem.insertAdjacentHTML('afterend', `
            <div data-politic-point>${input.value}</div>
         `)

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            burger2Shadow.classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()
            document.querySelector('[data-politic-point]._active').classList.remove('_active')

            set('burger2', document.querySelector('[data-burger-2]').innerHTML)

         }

      })

   }
   if (targ.closest('[data-collection-create]')) {

      const targElem = targ.closest('[data-collection-point]')
      const burger2Shadow = targ.closest('[data-collection]').querySelector('[data-burger2-shadow]')

      document.querySelector('[data-dropdown]').remove()
      burger2Shadow.classList.add('_active')

      let input = document.createElement('textarea')

      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 200px; font-size: 14px; height: 100px; color: #FCFCFC; border: none; border-radius: 5px; padding: 10px; background: rgba(29, 28, 34, 1); z-index: 2000;'
      // input.setAttribute('rows', '10')
      // input.setAttribute('cols', '100')
      input.setAttribute('placeholder', 'название')

      document.body.appendChild(input)

      input.value = ''

      input.focus()

      function mainText() {

         targElem.insertAdjacentHTML('afterend', `
            <div data-collection-point>${input.value}</div>
         `)

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            burger2Shadow.classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()
            document.querySelector('[data-collection-point]._active').classList.remove('_active')

            set('burger2', document.querySelector('[data-burger-2]').innerHTML)

         }

      })

   }



   if (targ.closest('[data-lobby-point]') && !targ.closest('[data-lobby-win]') && !targ.closest('[data-lobby-lose]')) {

      if (!targ.closest('[data-lobby-point]').classList.contains('_active') && !targ.closest('[data-lobby-point]').classList.contains('_complete')) {
         targ.closest('[data-lobby-point]').classList.add('_active')

         targ.closest('[data-lobby-point]').querySelector('[data-lobby-task]').insertAdjacentHTML('afterbegin', `
            <div data-lobby-check>
               <div data-lobby-win>+</div>
               <div data-lobby-lose>-</div>
            </div>
         `)

         set('noteBody', document.querySelector('[data-note-body]').innerHTML)

      } else {

         const lobbyPoint = targ.closest('[data-lobby-point]')
         // const lobbyReward = lobbyPoint.querySelector('[data-lobby-point]')
         // const lobbyText = lobbyPoint.querySelector('[data-lobby-text]')
         const taskShadow = document.querySelector('[data-task-shadow]')

         if (!document.querySelector('[data-dropdown]')) {

            taskShadow.classList.add('_active')
            targ.closest('[data-lobby-point]').querySelector('[data-lobby-task]').insertAdjacentHTML('beforeend', `
            <div data-dropdown>
               <button data-lobby-edit>изменить</button>
               <button data-lobby-cancel>отменить</button>
               <button data-lobby-delete>удалить</button>
            </div>
               `)

            const dropdown = document.querySelector('[data-dropdown]')
            const { bottom, left } = isDropdownOutOfView(dropdown)

            dropdown.style.width = '100px';


            if (bottom) {
               dropdown.style.top = 'auto';
               dropdown.style.bottom = '100%';
            }
            if (left) {
               dropdown.style.roght = 'auto';
               dropdown.style.left = '0px';
            }


         }

      }

   }

   if (targ.closest('[data-lobby-edit]')) {
      document.querySelector('[data-task-shadow]').classList.add('_active')
      targ.closest('[data-lobby-point]').classList.add('_temp')

      const input = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')

      const inputSecond = document.createElement('input')

      inputSecond.type = 'number'
      inputSecond.style = 'position: fixed; bottom: 60px; left: 135px; width: 40px; color: rgb(100, 75, 192);'
      inputSecond.setAttribute('tabindex', '-1')
      inputSecond.setAttribute('data-input-second', '')

      document.body.appendChild(input)
      document.body.appendChild(inputSecond)

      input.focus()

      const oldTempPoint = document.querySelector('[data-lobby-point]._temp')
      input.value = oldTempPoint.querySelector('[data-lobby-text]').innerText
      inputSecond.value = Number(oldTempPoint.querySelector('[data-lobby-reward]').innerText)
      targ.closest('[data-dropdown]').remove()

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            inputSecond.focus()

         }

      })
      inputSecond.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            if (inputSecond.value !== '') {

               const tempPoint = document.querySelector('[data-lobby-point]._temp')
               tempPoint.querySelector('[data-lobby-text]').innerText = input.value
               tempPoint.querySelector('[data-lobby-reward]').innerText = Number(inputSecond.value)

               input.remove()
               inputSecond.remove()

               const taskShadow = document.querySelector('[data-task-shadow]')
               taskShadow.classList.remove('_active')
               tempPoint.classList.remove('_temp')

               set('noteBody', document.querySelector('[data-note-body]').innerHTML)

            }


         }

      })


   }

   if (targ.closest('[data-lobby-win]')) {
      const lobbyPoint = targ.closest('[data-lobby-win]').closest('[data-lobby-point]')
      const reward = lobbyPoint.querySelector('[data-lobby-reward]')

      lobbyPoint.classList.add('_complete')

      video('general')
      log('general');


      const pad = (n) => String(n).padStart(2, '0');
      const today = new Date();
      const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

      let checkDate = barData3.find(obj => obj.date === date)

      let num = Number(reward.innerText)

      if (checkDate) {


         const profitClose = checkDate.c + num
         log(profitClose);

         const cleanProfitUP = profitClose - checkDate.o
         const cleanProfitDOWN = checkDate.o - profitClose
         checkDate.c = profitClose

         const statNum = document.querySelector('[data-statnote-num]')
         const statProcent = document.querySelector('[data-statnote-procent]')


         statNum.innerText = profitClose.toFixed(2)
         if (profitClose >= checkDate.o) {
            statProcent.innerText = `+${cleanProfitUP.toFixed(2)}`
            statNum.style = 'color: rgb(100, 75, 192);'
            statProcent.style = 'color: rgb(100, 75, 192); background-color: rgba(100, 75, 192, 0.5);'
         } else {
            statProcent.innerText = `-${cleanProfitDOWN.toFixed(2)}`
            statNum.style = 'color:  rgb(255, 99, 132);'
            statProcent.style = 'color:  rgb(255, 99, 132); background-color: rgba(255, 99, 132, 0.5);'
         }
         set('noteStat', document.querySelector('[data-note-stat]').innerHTML)

         if (profitClose >= checkDate.h) {
            checkDate.h = profitClose
         }

         chart3.update()

         set('barData3', JSON.stringify(barData3))
         const noteBody = document.querySelector('[data-note-body]').innerHTML
         set('noteBody', noteBody)
         lobbyPoint.classList.remove('_active')
         lobbyPoint.querySelector('[data-lobby-check]').remove()


      }

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-lobby-lose]')) {

      const lobbyPoint = targ.closest('[data-lobby-lose]').closest('[data-lobby-point]')
      const reward = lobbyPoint.querySelector('[data-lobby-reward]')

      lobbyPoint.classList.add('_lose')

      video('lose') // oldLose
      log('ose');

      const pad = (n) => String(n).padStart(2, '0');
      const today = new Date();
      const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

      let checkDate = barData3.find(obj => obj.date === date)

      let num = Number(reward.innerText)

      if (checkDate) {

         // open = 20
         // close = 10

         // input 5

         // loseClose = 5

         const loseClose = checkDate.c - num
         log(loseClose);

         const cleanLoseUP = loseClose - checkDate.o // 15 - 10 = 5
         const cleanLoseDOWN = checkDate.o - loseClose  // 20 - 5
         checkDate.c = loseClose

         const statNum = document.querySelector('[data-statnote-num]')
         const statProcent = document.querySelector('[data-statnote-procent]')


         statNum.innerText = loseClose.toFixed(2)
         if (loseClose >= checkDate.o) {
            statProcent.innerText = `+${cleanLoseUP.toFixed(2)}`
            statNum.style = 'color: rgb(100, 75, 192);'
            statProcent.style = 'color: rgb(100, 75, 192); background-color: rgba(100, 75, 192, 0.5);'
         } else {
            statProcent.innerText = `-${cleanLoseDOWN.toFixed(2)}`
            statNum.style = 'color:  rgb(255, 99, 132);'
            statProcent.style = 'color:  rgb(255, 99, 132); background-color: rgba(255, 99, 132, 0.5);'
         }
         set('noteStat', document.querySelector('[data-note-stat]').innerHTML)

         if (loseClose <= checkDate.l) {
            checkDate.l = loseClose
         }

         chart3.update()

         set('barData3', JSON.stringify(barData3))
         const noteBody = document.querySelector('[data-note-body]').innerHTML
         set('noteBody', noteBody)
         lobbyPoint.classList.remove('_active')
         lobbyPoint.querySelector('[data-lobby-check]').remove()

      }

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-lobby-delete]')) {
      targ.closest('[data-lobby-point]').remove()
      document.querySelector('[data-task-shadow]').classList.remove('_active')

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-lobby-cancel]')) {
      const lobbyPoint = targ.closest('[data-lobby-point]')

      lobbyPoint.classList.remove('_active')
      targ.closest('[data-dropdown]').remove()
      const taskShadow = document.querySelector('[data-task-shadow]')
      taskShadow.classList.remove('_active')
      lobbyPoint.querySelector('[data-lobby-check]').remove()

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)


   }

   if (targ.closest('[data-create-lobby]')) {

      document.querySelector('[data-lobby-top]').style.display = 'block'

      const targShell = document.querySelector('[data-text]._active').closest('[data-shell]')
      const text = targShell.querySelector('[data-text]').innerText

      targShell.querySelector('[data-reward]').innerText = 2

      document.querySelector('[data-lobby]').insertAdjacentHTML('beforeend', `
            <div data-lobby-body="${text}" style="display: block;"></div>
      `)

      const shadow = document.querySelector('[data-task-shadow]')
      const dropDown = document.querySelector('[data-dropdown]')
      const textActive = document.querySelector('[data-text]._active')

      shadow && shadow.classList.remove('_active')
      textActive && textActive.classList.remove('_active')
      dropDown && dropDown.remove()

      targShell.querySelector('[data-info-time]').innerHTML = `
      <div>1</div>
       <span>ч</span>
    `

      // дубляж
      document.querySelector('[data-lobby-in]').innerHTML = targShell.outerHTML

      targShell.setAttribute('data-note-categorie', '')

      document.querySelector('[data-task-main]').style.display = 'none'

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-task-shadow]')) {
      const shadow = targ.closest('[data-task-shadow]')
      const dropDown = document.querySelector('[data-dropdown]')
      const text = document.querySelector('[data-text]._active')
      const input = document.querySelector("input[tabindex='-1']")
      const assetTextActive = document.querySelector('[data-asset-text]._active')
      const inputSecond = document.querySelector('[data-input-second]')
      const inputThird = document.querySelector('[data-input-third]')
      const inputFourth = document.querySelector('[data-input-fourth]')
      document.querySelector('[data-collection]')?.classList.remove('_active')
      document.querySelector('[data-politic]')?.classList.remove('_active')
      document.querySelector('[data-polreward]')?.classList.remove('_active')

      // document.querySelector('[data-money-pos-add]').style.display = 'flex'
      // if (!document.querySelector('[data-money-start]')) document.querySelector('[data-money-neg-add]').style.display = 'flex'
      // document.querySelector('[data-pos-add]').style.display = 'flex'
      // document.querySelector('[data-neg-add]').style.display = 'flex'
      document.querySelector('[data-money-categories]').style.display = 'none'

      shadow.classList.remove('_active')
      dropDown && dropDown.remove()

      text && text.classList.remove('_active')
      assetTextActive && assetTextActive.classList.remove('_active')
      input && input.remove()
      inputSecond && inputSecond.remove()
      inputThird && inputThird.remove()
      inputFourth && inputFourth.remove()

      const tempPoint = document.querySelector('[data-lobby-point]._temp')
      tempPoint && tempPoint.classList.remove('_temp')

      document.querySelector('[data-burger-2]').classList.remove('_active')

   }

   if (targ.closest('[data-transport]')) {

      const targShell = document.querySelector('[data-text]._active').closest('[data-shell]')
      const targElem = targShell.querySelector('[data-transport]')

      document.querySelector('[data-transport]').insertAdjacentHTML('afterbegin', `
            <div data-dropdown="transport">
         
            </div>
         `)
      document.querySelector('[data-dropdown="transport"').style = 'top: 0px; right: 100%; display: flex; position: absolute;'

      const taskTabAll = document.querySelectorAll('[data-task-tab]')
      taskTabAll.forEach((taskTab) => {
         if (!taskTab.classList.contains('_active')) {

            document.querySelector('[data-dropdown="transport"]').insertAdjacentHTML('afterbegin', `
             <button data-task-categorie>${taskTab.innerText}</button>
           `)

         }
      })

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-task-categorie]')) {

      log(1);

      const targCategorie = targ.closest('[data-task-categorie]')

      const targTaskBody = document.querySelector(`[data-task-body="${targCategorie.innerText}"]`)
      log(document.querySelector('[data-text]._active'));

      const targShell = document.querySelector('[data-text]._active').closest('[data-shell]')


      document.querySelector('[data-dropdown]').remove()


      targTaskBody.insertAdjacentHTML('beforeend', targShell.outerHTML)

      document.querySelector('[data-task-shadow]').classList.remove('_active')
      document.querySelectorAll('[data-text]._active').forEach((e) => {
         e.classList.remove('_active')
      })



      set('noteBody', document.querySelector('[data-note-body]').innerHTML)

   }

   if (targ.closest('[data-task-create]')) {


      document.querySelector('[data-dropdown]').remove()
      document.querySelector('[data-task-shadow]').classList.add('_active')

      let input = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')

      document.body.appendChild(input)

      input.focus()

      function mainText() {

         if (input.value && input.value !== '') {

            let water

            const textAll = document.querySelectorAll('[data-text]')
            textAll.forEach((text) => {
               if (text.innerText === 'вода') {
                  water = text.closest('[data-shell]')
               }
            })

            document.querySelector('[data-task-tabs]').insertAdjacentHTML('beforeend', `
            <div data-task-tab>${input.value}</div>
            `)
            document.querySelector('[data-task-main]').insertAdjacentHTML('afterbegin', `
            <div data-task-body="${input.value}">
               ${water.outerHTML}
            </div>
            `)

            log(water);


         }

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            document.querySelector('[data-task-shadow]').classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()

            set('noteBody', document.querySelector('[data-note-body]').innerHTML)


         }

      })


      // document.querySelector('[data-task-tabs]').insertAdjacentHTML('beforeend', `
      //       <div data-task-tab>${}</div>

      // `)
   }

   if (targ.closest('[data-task-time]')) {

      const targTime = targ.closest('[data-task-time]')
      const targTab = targ.closest('[data-task-tab]')
      const targDropdown = targ.closest('[data-dropdown]')

      targDropdown.remove()

      let input = document.createElement('input')

      input.type = 'number'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')
      input.setAttribute('placeholder', 'время')

      document.body.appendChild(input)

      input.focus()

      function mainText() {

         let index = 0
         let inputValue = Number(input.value)
         let oldValue

         const dateAll = document.querySelectorAll(`[data-task-body]._active [data-date]`)
         dateAll.forEach((date) => {

            if (index === 0) {

               oldValue = Number(date.innerText)

               date.innerText = Number(inputValue).toFixed(2)

            } else {

               const difference = Number(date.innerText) - oldValue

               const result = difference + inputValue

               log(`
                   const ${difference} = ${Number(date.innerText)} - ${inputValue}

               const ${result} = ${difference} + ${inputValue}
               `)

               date.innerText = result.toFixed(2)

            }


            index++

         })

      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            document.querySelector('[data-task-shadow]').classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()

            set('noteBody', document.querySelector('[data-note-body]').innerHTML)


         }

      })


   }

   if (targ.closest('[data-task-rename]')) {

      const targElem = targ.closest('[data-task-rename]')
      const targTab = targElem.closest('[data-task-tab]')

      document.querySelector('[data-dropdown]').remove()
      document.querySelector('[data-task-shadow]').classList.add('_active')

      log(targTab.innerText);


      let input = document.createElement('input')

      input.type = 'text'
      input.style = 'position: fixed; bottom: 60px; left: 10px; width: 100px; color: #FCFCFC;'
      input.setAttribute('tabindex', '-1')

      document.body.appendChild(input)

      input.value = targTab.innerText

      input.focus()

      function mainText() {

         document.querySelector(`[data-task-body="${targTab.innerText}"]`).setAttribute('data-task-body', input.value)
         targTab.innerText = input.value


      }

      input.addEventListener('keydown', (event) => {

         if (event.key === 'Enter') {
            event.preventDefault()

            mainText()
            input.remove()

            document.querySelector('[data-task-shadow]').classList.remove('_active')
            document.querySelector('[data-dropdown]') && document.querySelector('[data-dropdown]').remove()

            set('noteBody', document.querySelector('[data-note-body]').innerHTML)

         }

      })


      // document.querySelector('[data-task-tabs]').insertAdjacentHTML('beforeend', `
      //       <div data-task-tab>${}</div>

      // `)
   }

   if (targ.closest('[data-task-delete]')) {
      const targElem = targ.closest('[data-task-delete]')
      const targTab = targElem.closest('[data-task-tab]')

      document.querySelector('[data-dropdown]').remove()
      document.querySelector('[data-task-shadow]').classList.remove('_active')

      document.querySelector(`[data-task-body="${targTab.innerText}"]`).remove()
      targTab.remove()

      document.querySelector('[data-task-tab]').classList.add('_active')
      document.querySelector('[data-task-body]').classList.add('_active')

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)


   }

   if (targ.closest('[data-task-tab]')) {

      const targElem = targ.closest('[data-task-tab]')
      const taskShadow = document.querySelector('[data-task-shadow]')

      if (targElem.classList.contains('_active')) {

         if (!document.querySelector('[data-dropdown]')) {
            taskShadow.classList.add('_active')

            const rect = targElem.getBoundingClientRect()

            const div = document.createElement('div')
            div.setAttribute('data-dropdown', '')
            div.style.width = "130px"
            div.style.position = 'absolute'
            div.style.left = `${rect.left + window.scrollX}px`
            div.style.visibility = 'hidden'
            div.innerHTML = `
               <button data-task-time>время</button>
               <button data-task-create>создать</button>
               <button data-task-rename>изменить</button>
               <button data-task-delete>удалить</button>
            `

            document.body.appendChild(div)

            const dropdownHeight = div.offsetHeight
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top

            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
               div.style.top = `${rect.top + window.scrollY - dropdownHeight}px`
            } else {
               div.style.top = `${rect.bottom + window.scrollY}px`
            }

            div.style.visibility = 'visible'
         }



      } else {

         let tab = targElem

         const old = document.querySelector('[data-task-tab]._active');
         if (old) old.classList.remove('_active');
         tab.classList.add('_active');

         const att = tab.innerText;
         const oldBody = document.querySelector(`[data-task-body]._active`);
         const newBody = document.querySelector(`[data-task-body="${att}"]`);

         if (oldBody) oldBody.classList.remove('_active');
         if (newBody) newBody.classList.add('_active');

         document.querySelector('[data-lobby-top]').style = 'display: none;'

         const lobbyBodyAll = document.querySelectorAll('[data-lobby-body]')
         lobbyBodyAll.forEach((lobbyBody) => {
            lobbyBody.style.display = 'none'
         })
         document.querySelector('[data-task-main]').style.display = 'block'


      }

      set('noteBody', document.querySelector('[data-note-body]').innerHTML)


   }

})

const container = document.querySelector('[data-lobby-body]');
if (container) {
   container.scrollTop = container.scrollHeight;
}

const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', function () {
   if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.readAsText(file)

      reader.onload = function (event) {

         const text = event.target.result

         fileInput.style.backgroundColor = '#112A21'


         let parts = text.split('@');
         let barData = parts[0];
         let barData2 = parts[1];
         let barData3 = parts[2];
         barData = JSON.parse(barData)
         barData2 = JSON.parse(barData2)
         barData3 = JSON.parse(barData3)

         barData != 'null' && set('barData', JSON.stringify(barData))
         barData2 != 'null' && set('barData2', JSON.stringify(barData2))
         barData3 != 'null' && set('barData3', JSON.stringify(barData3))

         parts[3] != 'null' && set('stat', parts[3])
         parts[4] != 'null' && set('moneyStat', parts[4])
         parts[5] != 'null' && set('noteStat', parts[5])
         parts[6] != 'null' && set('base', parts[6])
         parts[7] != 'null' && set('money', parts[7])
         parts[8] != 'null' && set('noteBody', parts[8])
         parts[9] != 'null' && set('bgRang', parts[9])
         parts[10] != 'null' && set('assets', parts[10])
         parts[11] != 'null' && set('burger2', parts[11])


         // set('taskBody', parts[4])

         // if (barData2) {
         //    barData2 = JSON.parse(barData2)
         //    set('barData2', barData2)
         //    set('money', parts[6])
         //    set('moneyStat', parts[7])
         // }

         // log(`BGRANG: ${parts[3]}`);

         location.reload(true);

      };

   }
});


const videoAll = document.querySelectorAll('[data-video]');

videoAll.forEach((video) => {

   video.addEventListener('ended', function () {

      video.style = 'opacity: 0; pointer-events: none;';
   });

})



function season() {

   if (get('burger2')) {
      document.querySelector('[data-burger-2]').innerHTML = get('burger2')
   }


   const pad = (n) => String(n).padStart(2, '0');
   const today = new Date();
   const date = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${today.getFullYear()}`;

   log(`${document.querySelector('[data-season-date]').getAttribute('data-season-date')} !== ${date}`);
   // log(document.querySelector('[data-season-date]').innerText);
   // log(date);


   if (document.querySelector('[data-season-date]').getAttribute('data-season-date') !== date) {

      const seasonDay = Number(document.querySelector('[data-season-day]').innerText)

      if (seasonDay !== 30) {

         const dinamrankAll = document.querySelectorAll('[data-dinam-rank]')

         dinamrankAll.forEach((dinamRank) => {

            const titulNum = dinamRank.closest('[data-dinam-titul]').querySelector('[data-dinam-titul-num]')

            let points = Number(dinamRank.getAttribute('data-dinam-rank')) + 1

            if (points >= 500) {
               points = 500
            }

            let rank = ranks.find(r => points >= r.min).rank;
            let iconSrc = `icon/${rank}.png`;

            titulNum.innerText = points
            dinamRank.setAttribute('data-dinam-rank', points)
            dinamRank.setAttribute('src', iconSrc)

         })


      }

      document.querySelector('[data-season-day]').innerText = seasonDay - 1
      document.querySelector('[data-season-date]').setAttribute('data-season-date', date)


   }


   if (Number(document.querySelector('[data-season-day]').innerText) <= 0) {
      document.querySelector('[data-season-get]').style = 'display: block;'
      document.querySelector('[data-season-clear]').style = 'display: block;'

      const actSeason = Number(document.querySelector('[data-actual-season]').innerText)


      if (!document.querySelector(`[data-season="${actSeason}"]`)) {

         let color
         let rang
         const src = document.querySelector('[data-rang]').getAttribute('src')
         const number = Number(src.match(/\d+/)[0])


         if (number === 0) {
            color = 'brown'
            rang = 'никто'
         }

         if (number === 1 || number === 2 || number === 3) {
            color = 'brown'
            rang = 'бронза'
         }
         if (number === 4 || number === 5 || number === 6) {
            color = 'gray'
            rang = 'серебро'

         }
         if (number === 7 || number === 8 || number === 9) {
            color = 'yellow'
            rang = 'золото'

         }
         if (number === 10 || number === 11 || number === 12) {
            color = 'goluboy'
            rang = 'платина'

         }
         if (number === 13 || number === 14 || number === 15) {
            color = 'blue'
            rang = 'даймонд'

         }
         if (number === 16 || number === 17 || number === 18) {
            color = 'fiolet'
            rang = 'чемпион'

         }
         if (number === 19 || number === 20 || number === 21) {
            color = 'red'
            rang = 'великий чемпион'

         }
         if (number === 22) {
            color = 'pink'
            rang = 'абсолютный чемпион'
         }



         const name = `с${actSeason} ${rang}`

         const titulNumAll = document.querySelectorAll('[data-dinam-titul-num]')


         document.querySelector('[data-tituls]').insertAdjacentHTML('beforeend', `
                  <div data-season="${actSeason}">
                     <div data-titul="${color}">${name}</div>
                   </div>
               `)



         let count = 0

         for (let index = 0; index < titulNumAll.length; index++) {
            const element = titulNumAll[index];


            if (Number(element.innerText) === 30) {
               count++
            }
         }

         log(`${count} === ${titulNumAll.length}`);
         log(count);
         log(titulNumAll.length);


         if (count === titulNumAll.length) {
            document.querySelector(`[data-season="${actSeason}"]`).insertAdjacentHTML('beforeend', `
   
            <div data-titul="fiolet">с${actSeason} абсолют</div>
    
            `)
         } else {

            if (count >= 3) {
               document.querySelector(`[data-season="${actSeason}"]`).insertAdjacentHTML('beforeend', `
      
               <div data-titul="goluboy">с${actSeason} полу-абсолют</div>
       
               `)
            }

         }




      }

   }


   set('burger', document.querySelector('[data-burger]').innerHTML)
   set('burger2', document.querySelector('[data-burger-2]').innerHTML)



}
season()


function polRewardRang() {

   const actSeason = Number(document.querySelector('[data-actual-season]').innerText)

   let color
   let rang
   const src = document.querySelector('[data-rang]').getAttribute('src')
   let number = Number(src.match(/\d+/)[0])


   log(src);
   log(number);


   if (number === 0) {
      color = 'brown'
      rang = 'никто'
   }

   if (number === 1 || number === 2 || number === 3) {
      color = 'brown'
      rang = 'бронза'
   }
   if (number === 4 || number === 5 || number === 6) {
      color = 'gray'
      rang = 'серебро'

   }
   if (number === 7 || number === 8 || number === 9) {
      color = 'yellow'
      rang = 'золото'

   }
   if (number === 10 || number === 11 || number === 12) {
      color = 'goluboy'
      rang = 'платина'

   }
   if (number === 13 || number === 14 || number === 15) {
      color = 'blue'
      rang = 'даймонд'

   }
   if (number === 16 || number === 17 || number === 18) {
      color = 'fiolet'
      rang = 'чемпион'

   }
   if (number === 19 || number === 20 || number === 21) {
      color = 'red'
      rang = 'великий чемпион'

   }
   if (number === 22) {
      color = 'pink'
      rang = 'абсолютный чемпион'
   }



   const name = `с${actSeason} ${rang}`

   document.querySelector('[data-polreward-point]._rang').setAttribute('data-polreward-point', color)
   document.querySelector('[data-polreward-point]._rang').innerHTML = `
         ${name}
      `


}
polRewardRang()




// document.addEventListener('mousedown', (e) => {
//    const tab = e.target.closest('[data-task-tab]');
//    if (!tab) return;

//    tab._holdTimer = setTimeout(() => {
//       tab._isHolding = true;
//       дропдаун появился

//       if (tab.classList.contains('_active')) {
//          tab.insertAdjacentHTML('afterbegin', `
//             <div data-dropdown>
//                <button data-task-create>создать</button>
//                <button data-task-rename>изменить</button>
//                <button data-task-delete>удалить</button>
//             </div>
//          `);
//       }

//    }, 500);
// });

// document.addEventListener('mouseup', (e) => {
//    const tab = e.target.closest('[data-task-tab]');
//    if (!tab) return;

//    clearTimeout(tab._holdTimer);
//    if (tab._isHolding) {
//       дропдаун исчез
//       tab._isHolding = false;

//       if (tab.classList.contains('_active')) {
//          setTimeout(() => {
//             const shadow = document.querySelector('[data-task-shadow]');
//             if (shadow) shadow.classList.add('_active');
//          }, 1);
//       }
//    }
// });

// document.addEventListener('click', (e) => {
//    const tab = e.target.closest('[data-task-tab]');
//    if (!tab) return;

//    if (tab._isHolding) {
//       e.preventDefault();
//       e.stopImmediatePropagation();
//       return false;
//    }

//    сработал обычный клик

//    if (!tab.classList.contains('_active')) {
//       const old = document.querySelector('[data-task-tab]._active');
//       if (old) old.classList.remove('_active');
//       tab.classList.add('_active');

//       const att = tab.innerText;
//       const oldBody = document.querySelector(`[data-task-body]._active`);
//       const newBody = document.querySelector(`[data-task-body="${att}"]`);

//       if (oldBody) oldBody.classList.remove('_active');
//       if (newBody) newBody.classList.add('_active');
//    }

//    document.querySelector('[data-lobby-top]').style = 'display: none;'

//    const lobbyBodyAll = document.querySelectorAll('[data-lobby-body]')
//    lobbyBodyAll.forEach((lobbyBody) => {
//       lobbyBody.style.display = 'none'
//    })
//    document.querySelector('[data-task-main]').style.display = 'block'


// });

// // мобилка — та же схема
// document.addEventListener('touchstart', (e) => {
//    const tab = e.target.closest('[data-task-tab]');
//    if (!tab) return;

//    tab._holdTimer = setTimeout(() => {
//       tab._isHolding = true;
//       дропдаун появился

//       if (tab.classList.contains('_active')) {
//          tab.insertAdjacentHTML('afterbegin', `
//             <div data-dropdown>
//                <button data-task-time>время</button>
//                <button data-task-create>создать</button>
//                <button data-task-rename>изменить</button>
//                <button data-task-delete>удалить</button>
//             </div>
//          `);
//       }

//    }, 500);
// });

// document.addEventListener('touchend', (e) => {
//    const tab = e.target.closest('[data-task-tab]');
//    if (!tab) return;

//    clearTimeout(tab._holdTimer);
//    if (tab._isHolding) {
//       дропдаун исчез
//       tab._isHolding = false;

//       if (tab.classList.contains('_active')) {
//          setTimeout(() => {
//             const shadow = document.querySelector('[data-task-shadow]');
//             if (shadow) shadow.classList.add('_active');
//          }, 1);
//       }
//    }
// });



document.querySelector('[data-polreward]').classList.remove('_active')
document.querySelector('[data-politic]').classList.remove('_active')
document.querySelector('[data-collection]').classList.remove('_active')
