//Константы отображения карты
const NUMBER_OF_INPUTS = 3;
const NUMBER_OF_NEURONS_BY_WIDTH = 40;
const NUMBER_OF_NEURONS_BY_HEIGHT = 40;
const NEURON_SIZE = 10;

//Dataset
import { DATA_SET } from "./weather_dataset.js";

//Константы и переменные
//Число итераций
const NUMBER_OF_TRAINING_STEPS = DATA_SET.length;
//Текущая итерация
let numberOfTrainingStep = 0;
//Константа для расчёта функции распространения sigma
const sigma0 = Math.max(NEURON_SIZE * NUMBER_OF_NEURONS_BY_WIDTH, NEURON_SIZE * NUMBER_OF_NEURONS_BY_HEIGHT) / 5;
//Переменная для подсчёта распространения
let sigma;
//Константа для расчёта функции распространения sigma
const lambda = NUMBER_OF_TRAINING_STEPS / Math.log(sigma0);
//Переменная для подсчёта плотности обучения
let theta;
//Скорость обучения
const learningRate0 = 0.1;
//Переменная для подсчёта скорости обучения
let learningRate;

//Элементы HTML
//Canvas
let mapElement = document.getElementById("map");
mapElement.width = NEURON_SIZE * NUMBER_OF_NEURONS_BY_WIDTH;
mapElement.height = NEURON_SIZE * NUMBER_OF_NEURONS_BY_HEIGHT;
let context = mapElement.getContext("2d");
//Menu
let menuElement = document.getElementById("menu");
menuElement.style.height = `${NUMBER_OF_NEURONS_BY_HEIGHT * NEURON_SIZE}px`;
//Buttons
document.querySelector('#teach-button').addEventListener('click', () => {
  som.teach();
});
document.querySelector('#teach-all-button').addEventListener('click', () => {
  som.fullTeach();
});
/*document.querySelector('#teach-0-button').addEventListener('click', () => {
  som.renderForParam(0);
});
document.querySelector('#teach-1-button').addEventListener('click', () => {
  som.renderForParam(1);
});
document.querySelector('#teach-2-button').addEventListener('click', () => {
  som.renderForParam(2);
});*/
document.querySelector('#find-winner-for-cusom-input').addEventListener('click', () => {
  let data = JSON.parse(document.querySelector('#custom-input').value.replace(/'/g, '"'));
  let winner = som.findWinner(data);
  som.showNeuron(winner, "black");
});

//Класс нейрона
class Neuron {
  constructor(x_coordinate, y_coordinate) {
    //Координата по X
    this.x_coordinate = x_coordinate;
    //Координата по Y
    this.y_coordinate = y_coordinate;
    //Массив весов для каждого входного сигнала
    this.weights = Array.from({length: NUMBER_OF_INPUTS}, () => Math.random() * ((1 / Math.sqrt(NUMBER_OF_INPUTS)) + (1 / Math.sqrt(NUMBER_OF_INPUTS))) + (-(1 / Math.sqrt(NUMBER_OF_INPUTS))));
  }
  //? function finding the average of all weight of neuron weights
  //? use to color map in grayscale like rgb(average*255, average*255, average*255)
  /*getAverageWeight() {
    let averageWeight = 0;
    for (let i = 0; i < this.weights.length; i++) {
      averageWeight += this.weights[i];
    }
    // should add (1 / Math.sqrt(NUMBER_OF_INPUTS)) to make the range like 0..1 not like -(1 / Math.sqrt(NUMBER_OF_INPUTS))..(1 / Math.sqrt(NUMBER_OF_INPUTS)) 
    return averageWeight / this.weights.length + (1 / Math.sqrt(NUMBER_OF_INPUTS));
  }*/
}

//Класс карты
class SOM {
  constructor() {
    //Массив всех нейронов
    this.map = new Array(NUMBER_OF_NEURONS_BY_WIDTH * NUMBER_OF_NEURONS_BY_HEIGHT);
    for (let i = 0; i < this.map.length; i++) {
      //Координаты по X, Y
      let x_coordinate = Math.floor(i / NUMBER_OF_NEURONS_BY_WIDTH);
      let y_coordinate = i % NUMBER_OF_NEURONS_BY_WIDTH;
      //Инициализация нейрона по коодинатам
      this.map[i] = new Neuron(x_coordinate, y_coordinate);
    }
  }
  //Отрисовка всех нейронов на карте
  render() {
    //Очистка карты
    context.clearRect(0,0,mapElement.width,mapElement.height);
    //Отрисовка нейронов на карте по координатам
    for (let i = 0; i < this.map.length; i++) {
      //Заливка нейрона
      context.fillStyle = `rgb(${this.map[i].weights[0] * 255}, ${this.map[i].weights[1] * 255}, ${this.map[i].weights[2] * 255})`;
      context.fillRect(this.map[i].y_coordinate * NEURON_SIZE, this.map[i].x_coordinate * NEURON_SIZE, NEURON_SIZE, NEURON_SIZE);
    }
  }
  //Поиск победителя
  findWinner(input) {
    //Массив расстояний для каждого нейрона
    let distancesMap = new Array(NUMBER_OF_NEURONS_BY_WIDTH * NUMBER_OF_NEURONS_BY_HEIGHT);
    //Нейрон с минимальным расстоянием
    let minDistanceIndex = 0;
    //По каждому расстоянию для нейронов
    for (let i = 0; i < distancesMap.length; i++) {
      //По формуле подсчёта расстояния
      let sum = 0;
      for (let j = 0; j < NUMBER_OF_INPUTS; j++) {
        sum += (input[j] - this.map[i].weights[j])**2;
      }
      distancesMap[i] = Math.sqrt(sum);
      //Проверка на минимальное расстояние
      if (distancesMap[i] < distancesMap[minDistanceIndex]) {
        minDistanceIndex = i;
      }
    }
    //Индекс нейрона победителя
    return this.map[minDistanceIndex];
  }
  
  showNeuron(neuron, color) {
    context.fillStyle = color;
    context.fillRect(neuron.y_coordinate * NEURON_SIZE, neuron.x_coordinate * NEURON_SIZE, NEURON_SIZE, NEURON_SIZE);
  }
  //? function displaying win neurons for all rows of the dataset on map at the same time
  showAllWinners() {
    for (let i = 0; i < DATA_SET.length; i++) {
      this.showNeuron(this.findWinner(DATA_SET[i]), "red");
    }
  }
  //Обучение 
  fullTeach() {
    while (DATA_SET.length > 0) {
      this.teach();
    }
    this.render();
  }
  //Обучение
  teach() {
    //Пока в dataset ещё остались объекты
    if (DATA_SET.length > 0) {
      //Выбор случайного объекта из dataset
      let randomInputIndex = Math.floor(Math.random() * DATA_SET.length);
      let randomInput = DATA_SET[randomInputIndex];
      //Удаление объекта из dataset
      DATA_SET.splice(randomInputIndex,1);
      //Поиск нейрона победителя
      let winnerNeuron = this.findWinner(randomInput);
      this.showNeuron(winnerNeuron, "blue");
      //Поиск нейронов соседей нейрона победителя
      sigma = sigma0 * Math.exp(-(numberOfTrainingStep / lambda));
      let nearbyMap = [];
      for (let i = 0; i < this.map.length; i++) {
        //Определение расстояния нейрона до нейрона победителя
        let distance = Math.sqrt((this.map[i].x_coordinate - winnerNeuron.x_coordinate)**2 + (this.map[i].y_coordinate - winnerNeuron.y_coordinate)**2);
        //Если расстояние меньше sigma
        if (distance < sigma) {
          //Добавление нейрона соседа в массив
          nearbyMap.push(this.map[i]);
        }
      }
      //Корректировка весов
      for (let i = 0; i < nearbyMap.length; i++) {
        //Определение расстояния нейрона до нейрона победителя
        let distance =  Math.sqrt((nearbyMap[i].x_coordinate - winnerNeuron.x_coordinate)**2 + (nearbyMap[i].y_coordinate - winnerNeuron.y_coordinate)**2);
        //Рассчёт плотности обучения для нейрона
        theta = Math.exp(-(distance**2 / (2 * sigma**2)));
        //Рассчёт скорости обучения для нейрона
        learningRate = learningRate0 * Math.exp(-(numberOfTrainingStep / lambda));
        //Корректировка весов  соседей
        for (let j = 0; j < nearbyMap[i].weights.length; j++) {
          nearbyMap[i].weights[j] += theta * learningRate * (randomInput[j] - nearbyMap[i].weights[j]);
        }
      }
      this.render();
      numberOfTrainingStep++;
    }
  }
  /*? render grayscale map for each input parameter
  renderForParam(p) {
    context.clearRect(0,0,mapElement.width,mapElement.height);
    // draw all neurons
    for (let i = 0; i < this.map.length; i++) {
      context.fillStyle = `rgb(${this.map[i].weights[p] * 255}, ${this.map[i].weights[p] * 255}, ${this.map[i].weights[p] * 255})`;
      // x_coordinate = height, y_coordinate = width
      context.fillRect(this.map[i].y_coordinate * NEURON_SIZE, this.map[i].x_coordinate * NEURON_SIZE, NEURON_SIZE, NEURON_SIZE);
    }
  }*/
}

let som = new SOM();
som.render();
