if (window.location.pathname != '/control'){


webSocket = new WebSocket('ws://localhost:3001');
let dona = [];
let bar = [];
let line = [];
let pie = [];
let text = [];
let parameter = [];
charts = {}

async function getData(){
  try {
    let response = await fetch('http://localhost:3000/charts_data');
    let data = await response.json();
    return data
  } catch (error) {
    console.error(new Error(error));
  }
}

getData().then((charts)=>{
  let div = document.getElementById('father');
  let div2 = [];
  let divButton = [];
  let buttonDelGraf = [];
  let canvas = [];
  let ids = [];
  let index = 0;
  let graficas = {};
  let ctx = {};

  Object.values(charts).forEach(chart => {
    div2[chart._id] = document.createElement('div');
    div2[chart._id].setAttribute('id',chart._id);
    div2[chart._id].classList.add("div-graf");
    divButton[chart._id] = document.createElement('div');
    divButton[chart._id].classList.add('div-button-del-graf');
    buttonDelGraf[chart._id] = document.createElement('button');
    buttonDelGraf[chart._id].setAttribute('id',chart._id);
    buttonDelGraf[chart._id].classList.add('button-del-graf', 'btn-floating', 'btn-large', 'waves-effect', 'waves-light', 'red', 'btn-small');
    buttonDelGraf[chart._id].innerHTML = '-'
    buttonDelGraf[chart._id].onclick = () => deleteGraf(chart._id);
    divButton[chart._id].appendChild(buttonDelGraf[chart._id]);
    canvas[chart._id] = document.createElement("canvas");
    canvas[chart._id].setAttribute('id', chart._id);
    canvas[chart._id].setAttribute('width','300')
    canvas[chart._id].setAttribute('height','300')
    div2[chart._id].appendChild(canvas[chart._id]);
    div.appendChild(div2[chart._id]);
    div2[chart._id].appendChild(divButton[chart._id]);
    ids[index] = chart._id;
    index +=1;
    ctx[chart._id] = canvas[chart._id].getContext('2d');
    switch (chart.type.chartType){
      case 'midDoughnut':
        dona[chart._id] =  {
          type: 'doughnut',
          data: {
            labels: [],
            datasets: [{
              label: [],
              data: [],
              borderWidth: 1,
              backgroundColor: []
            }]
          },
          options: {
            cutout: 50,
            rotation: -90,
            circumference: 180,
            radius: 100,
            plugins:{ 
              tooltip: {
                  enabled: true,
                  callbacks:{
                    label: function (context){
                      if (context.dataIndex === 0){
                        return context.dataset.label + ': ' + context.parsed;
                      }else{
                        return null;
                      }
                    }
                  }, 
                },
              arrowPlugin: { value: .10 },
              scales: {
              y: {
                suggestedMax: 100
              }
            }
            },
          },
        }
        dona[chart._id].data.labels = [chart.labels]
        dona[chart._id].data.datasets[0].backgroundColor = chart.backgroundColor
        graficas[chart._id] = new Chart(ctx[chart._id], dona[chart._id])
      break;
      case 'bar':
        bar[chart._id] =  {
          type: 'bar',
          data: {
            labels: [],
            datasets: [{
              label: [],
              data: [],
              borderWidth: 1,
              backgroundColor: []
            }]
          },
          options: {
            scales: {
              y: {
                suggestedMax: 100,
                ticks: {
                precision: 0.0
                }
              },
            }
          }
        }
        bar[chart._id].data.labels = [chart.labels]
        bar[chart._id].data.datasets[0].backgroundColor = chart.backgroundColor
        graficas[chart._id] = new Chart(ctx[chart._id], bar[chart._id])
      break;
      case 'line':
        line[chart._id] =  {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: [],
              data: [0],
              borderWidth: 1,
              backgroundColor: []
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: 100
              }
            }
          }
      }
        line[chart._id].data.labels = [chart.labels]
        line[chart._id].data.datasets[0].backgroundColor = chart.backgroundColor
        graficas[chart._id] = new Chart(ctx[chart._id], line[chart._id]);
      break;
      case 'pie' :
        pie[chart._id] =  {
          type: 'pie',
          data: {
            labels: [],
            datasets: [{
              label: [],
              data: [],
              borderWidth: 1,
              backgroundColor: []
            }]
          },
          options: {
            plugins:{ 
              tooltip: {
                  enabled: true,
                  callbacks:{
                    label: function (context){
                      if (context.dataIndex === 0){
                        return context.dataset.label + ': ' + context.parsed;
                      }else{
                        return null;
                      }
                    }
                  }, 
                },
              arrowPlugin: { value: .10 },
            },
          },
        }
        pie[chart._id].data.labels = [chart.labels]
        pie[chart._id].data.datasets[0].backgroundColor = chart.backgroundColor
        graficas[chart._id] = new Chart(ctx[chart._id], pie[chart._id])
      break;
      case 'text':
        parameter[chart._id] = 0;
        ctx[chart._id].textAlign = "center"
        ctx[chart._id].fillStyle = "black";
        ctx[chart._id].font = "bold 25px serif"
        ctx[chart._id].fillText(chart.labels,150,30);
        ctx[chart._id].font = "bold 70px serif"
        ctx[chart._id].fillText(parameter[chart._id],150,150);
        graficas[chart._id] = ctx[chart._id]; 
        //console.log(graficas[chart._id].fillText);
      break;
    }
  });
  let labelLine = 0
  webSocket.onmessage = (event) =>{
    data = JSON.parse(event.data)
    charts.forEach((chart) =>{
      if (chart.topic == data.topic){
        //console.log(chart.type.chartType)
        switch (chart.type.chartType){
          case 'midDoughnut':
            graficas[chart._id].data.datasets[0].data = [data.data,chart.percent]
          break;
          case 'line':
            if (data.data > chart.maxValue){
              graficas[chart._id].data.datasets[0].backgroundColor = [chart.backgroundColor[1]]
            }else{
              graficas[chart._id].data.datasets[0].backgroundColor = [chart.backgroundColor[0]]
            }
            if (labelLine == 50){
              labelLine = 0;
              graficas[chart._id].data.labels = [labelLine];
              graficas[chart._id].data.datasets[0].data = [data.data];
              graficas[chart._id].update();
            }
            graficas[chart._id].data.labels.push(labelLine)
            graficas[chart._id].data.datasets[0].data.push([data.data]);
            labelLine += 1
          break;
          case 'pie':
            graficas[chart._id].data.datasets[0].data = [data.data,chart.percent]
          break;
          case 'text':
            if (data.data > chart.maxValue){
              ctx[chart._id].fillStyle = chart.backgroundColor[1];
            }else{
              ctx[chart._id].fillStyle = chart.backgroundColor[0];
            }
            ctx[chart._id].clearRect(0,0,300,300)
            parameter[chart._id] = data.data;
            ctx[chart._id].textAlign = "center"
            ctx[chart._id].font = "bold 25px serif"
            ctx[chart._id].fillText(chart.labels,150,30);
            ctx[chart._id].font = "bold 70px serif"
            ctx[chart._id].fillText(parameter[chart._id],150,150);
            graficas[chart._id] = ctx[chart._id]; 
          break;
          default :
            if (data.data > chart.maxValue){
              graficas[chart._id].data.datasets[0].backgroundColor = [chart.backgroundColor[1]]
            }else{
              graficas[chart._id].data.datasets[0].backgroundColor = [chart.backgroundColor[0]]
            }
            graficas[chart._id].data.datasets[0].data = [data.data]
          break;
        }
        if (chart.type.chartType != 'text'){
          graficas[chart._id].update()
        }
      }
      
    })

  }
});


}else{
  webSocket = new WebSocket('ws://localhost:3001');
  async function getData(){
    try {
      let response = await fetch('http://localhost:3000/controls_data');
      let data = await response.json();
      return data
    } catch (error) {
      console.error(new Error(error));
    }
}

getData().then(controls => {
    let div = document.getElementById('controlFather');
    let div1 = [];
    let div2 = [];
    let div3 = [];
    let h2 = [];
    let divButton = [];
    let theButtons =[];
    let buttonDelControl = [];
    let ids = [];
    let index = 0;


    Object.values(controls).forEach(control => {
        div1[control._id] = document.createElement('div');
        div1[control._id].classList.add('divControlTitle');
        div3[control._id] = document.createElement('div');
        div3[control._id].classList.add('divContentButton');
        h2[control._id] = document.createElement('h2');
        h2[control._id].classList.add('controlTitle');
        h2[control._id].innerHTML = control.name;
        div1[control._id].appendChild(h2[control._id]);
        div2[control._id] = document.createElement('div');
        div2[control._id].setAttribute('id',control._id);
        div2[control._id].classList.add("div-control");
        divButton[control._id] = document.createElement('div');
        divButton[control._id].classList.add('div-button-del-control');
        buttonDelControl[control._id] = document.createElement('button');
        buttonDelControl[control._id].setAttribute('id',control._id);
        buttonDelControl[control._id].classList.add('button-del-graf', 'btn-floating', 'btn-large', 'waves-effect', 'waves-light', 'red', 'btn-small');
        buttonDelControl[control._id].innerHTML = '-'
        buttonDelControl[control._id].onclick = () => deleteControl(control._id);
        divButton[control._id].appendChild(buttonDelControl[control._id]);
        div2[control._id].appendChild(div1[control._id]);
        control.buttons.forEach(button =>{
          theButtons[button.button] = document.createElement('button');
          theButtons[button.button].setAttribute('id',button.action);
          theButtons[button.button].onclick = function(){ enviarComando(this);}
          theButtons[button.button].innerHTML = button.button;
          theButtons[button.button].classList.add('button-control', 'btn-large', 'waves-effect', 'waves-light','btn-floating', 'green')
          theButtons[button.button].setAttribute('value',control.deviceId)
          div3[control._id].appendChild(theButtons[button.button]);
        })
        div2[control._id].appendChild(div3[control._id]);
        div2[control._id].appendChild(divButton[control._id]);


        div.appendChild(div2[control._id]);
        ids[index] = control._id;
        index +=1;

      });
});

function buttonsForControl(){
  let cant = document.getElementById('cant').value;
  let div = document.getElementById('buttons');
  div.innerHTML = '';
  for (let i = 1; i <= cant; i++ ){
    console.log(i)
    let input = document.createElement('input');
    input.placeholder = 'Nombre para boton: '+ i
    input.type = 'text';
    input.name = 'B'+i
    div.appendChild(input);
  }
}

}

//////////////////////////

var modal = document.getElementById("myModal");

// Obtén el botón que abre el modal
var btn = document.querySelector(".togle-modal");

// Obtén el elemento <span> que cierra el modal
var span = document.getElementsByClassName("close")[0];

// Cuando el usuario haga clic en el botón, abre el modal 
// btn.onclick = function() {
//  modal.style.display = "block";
// }

// Cuando el usuario haga clic en <span> (x), cierra el modal
// span.onclick = function() {
//  modal.style.display = "none";
// }

// Cuando el usuario haga clic en cualquier lugar fuera del modal, cierra el modal
window.onclick = function(event) {
 if (event.target == modal) {
    modal.style.display = "none";
 }
}


async function deleteGraf(id){
  console.log(id);
  try {
    let postData = {
      id: id
    }
    let response = await fetch('http://localhost:3000/delGraf',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(postData)
    });
    let data = await response.json();
    console.log(data);
    if (data.status){
      location.reload()
    }
  } catch (error) {
    console.error(new Error(error));
  }
}

function limit(obj){
  let percent = document.getElementById('percent');
  let max = document.getElementById('max');
  //console.log(percent);
  let index = obj.options.selectedIndex;
  let opc = obj.options[index].innerHTML.trim();
  console.log(opc)
  if ( opc == 'midDoughnut' || opc == 'pie'){
    percent.hidden = false;
    max.hidden = true;
  }else{
    percent.hidden = true;
    max.hidden = false;
  }
}

function enviarComando(obj){
  console.log(obj.value)
  let comand = {}
  comand.type = 'command'
  comand.deviceId = obj.value;
  comand.comand = obj.id;
  webSocket.send(JSON.stringify(comand))
  console.log(comand)
}


///////Alertas

//////Alertas

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems, '');
  console.log("openModal")
});

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems, '');
});