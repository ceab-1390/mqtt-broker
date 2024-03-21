webSocket = new WebSocket('ws://localhost:3001');
let dona = [];
let bar = [];
let line = [];
charts = {}

async function getData(){
  try {
    let response = await fetch('http://localhost:3000/charts_data');
    let data = await response.json()
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
    buttonDelGraf[chart._id].classList.add('button-del-graf');
    buttonDelGraf[chart._id].innerHTML = 'delete'
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
        dona[chart._id] =  {
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
        dona[chart._id].data.labels = [chart.labels]
        dona[chart._id].data.datasets[0].backgroundColor = chart.backgroundColor
        graficas[chart._id] = new Chart(ctx[chart._id], dona[chart._id])
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
          default :
            if (data.data > chart.maxValue){
              graficas[chart._id].data.datasets[0].backgroundColor = [chart.backgroundColor[1]]
            }else{
              graficas[chart._id].data.datasets[0].backgroundColor = [chart.backgroundColor[0]]
            }
            graficas[chart._id].data.datasets[0].data = [data.data]
          break;
        }
        graficas[chart._id].update()
      }
      
    })

  }
});




//////////////////////////

var modal = document.getElementById("myModal");

// Obtén el botón que abre el modal
var btn = document.querySelector(".togle-modal");

// Obtén el elemento <span> que cierra el modal
var span = document.getElementsByClassName("close")[0];

// Cuando el usuario haga clic en el botón, abre el modal 
btn.onclick = function() {
 modal.style.display = "block";
}

// Cuando el usuario haga clic en <span> (x), cierra el modal
span.onclick = function() {
 modal.style.display = "none";
}

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

///////Alertas

//////Alertas