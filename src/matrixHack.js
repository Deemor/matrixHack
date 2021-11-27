const randomInt = (max) => Math.floor(Math.random() * Math.floor(max))
const delay = t => new Promise(res => setTimeout(res, t * 1000));
const shuffleArray = (array) => array.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)

function playSound(name, volume){
    const sound = new Audio(name)
    sound.volume = volume || 0.15;
    sound.play();     
    return sound
}
var amountOfShuffles = 0;
var data;
var timeToRemember = 0;
var timeToCheck = 0;
const SQUARE_SIZE = 100;
const SQUARE_MARGIN = 15;
const SHUFFLE_TIME = 3;
const TIME_TO_PREPARE = 2;
async function getPosition(x,y)
{
  var start_pos_x = $('#matrix').offset().left;
  var start_pos_y = $('#matrix').offset().top;

  return [start_pos_x +(SQUARE_SIZE+(SQUARE_MARGIN*2))*x,start_pos_y +(SQUARE_SIZE+(SQUARE_MARGIN*2))*y];
}
async function generateMatrix()
{
  var tempData = [];
  for(var i = 1; i < 10;i++)
  {
    tempData.push(i);
  }
  tempData = shuffleArray(tempData);
  for(var i = 0; i < 3;i++)
  {
    data.push([]);
    for(var j = 0; j < 3;j++)
    {
      data[i].push(tempData[i*3+j]);
    }
  }

}
async function createMatrix()
{
  await generateMatrix();
  for(var i = 0; i < 3;i++)
  {
    data.push([]);
    for(var j = 0; j < 3;j++)
    {
      $("#matrix").append(`<div class="square noselect" id="s`+String(data[i][j])+`"></div>`);
      var position = await getPosition(j,i);
      $("#s"+String(data[i][j])).css("left",String(position[0])+"px");
      $("#s"+String(data[i][j])).css("top",String(position[1])+"px");
    }
  }
}
async function drawNumbers()
{
  for(var i = 0; i < 3;i++)
  {
    for(var j = 0; j < 3;j++)
    {
      $("#s"+String(data[i][j])).html(String(data[i][j]));
    }
  }
}
async function clearSquares()
{
  for(var i = 0; i < 3;i++)
  {
    for(var j = 0; j < 3;j++)
    {
      $("#s"+String(data[i][j])).html("");
    }
  }
}
async function changeRows(firstRow, secondRow)
{
  for(var i = 0; i < 3;i++)
  {
    var firstSquarePosition = await getPosition(i,firstRow);
    var secondSquarePosition = await getPosition(i,secondRow)
    $("#s"+String(data[firstRow][i])).animate({ top: secondSquarePosition[1], left: secondSquarePosition[0] }, SHUFFLE_TIME*1000);
    $("#s"+String(data[secondRow][i])).animate({ top: firstSquarePosition[1], left: firstSquarePosition[0] }, SHUFFLE_TIME*1000);
    var temp = data[firstRow][i];
    data[firstRow][i] = data[secondRow][i];
    data[secondRow][i] = temp;
  }
}
async function changeColumns(firstColumn, secondColumn)
{
  for(var i = 0; i < 3;i++)
  {
    var firstSquarePosition = await getPosition(firstColumn,i);
    var secondSquarePosition = await getPosition(secondColumn,i)
    $("#s"+String(data[i][firstColumn])).animate({ top: secondSquarePosition[1], left: secondSquarePosition[0] }, SHUFFLE_TIME*1000);
    $("#s"+String(data[i][secondColumn])).animate({ top: firstSquarePosition[1], left: firstSquarePosition[0] }, SHUFFLE_TIME*1000);
    var temp = data[i][firstColumn];
    data[i][firstColumn] = data[i][secondColumn];
    data[i][secondColumn] = temp;
  }
}
async function selectRow(row)
{
  var pos = await getPosition(0,row);
  $("#matrix").append(`<div id="frameRow" style="left:`+String(pos[0] + 2)+`px; top:`+String(pos[1] + 2)+`px"></div>`);
}
async function getAnswerAndSelect()
{
  var randomNum = randomInt(3);
  var answer;
  var columnOrRow = randomInt(2);
  if(columnOrRow==0)//row
  {
    answer = data[randomNum];
    selectRow(randomNum);
  }else //column
  {
    answer = [data[0][randomNum],data[1][randomNum],data[2][randomNum]];
    selectColumn(randomNum);
  }
  return answer;
}
async function selectColumn(column)
{
  var pos = await getPosition(column,0);
  $("#matrix").append(`<div id="frameColumn" style="left:`+String(pos[0] + 2)+`px; top:`+String(pos[1] + 2)+`px"></div>`);
}
async function stopProgressBar()
{
  $("#progress-bar").stop(true,true);
}
async function startHack(){
  $(`#navText`).html("MatrixHack");
  $('#answer').hide();
  $("#textBox").show();
  $("#text").html("PRZYGOTUJ SIĘ");
  var progBar = $("#progress-bar");
  progBar.css("width","100%");
  progBar.animate({
    width: "0px"
  }, {
    duration: TIME_TO_PREPARE*1000,
    ease: "linear",
  });
  await delay(TIME_TO_PREPARE);
  await stopProgressBar();
  $(`#navText`).html("ZAPAMIETAJ");
  $("#textBox").hide();
  $("#game").show();
  await createMatrix();
  await drawNumbers();
  progBar.css("width","100%");
  progBar.animate({
    width: "0px"
  }, {
    duration: timeToRemember*1000,
    ease: "linear",
  });
  await delay(timeToRemember);
  await clearSquares();
  await stopProgressBar();
  $(`#navText`).html("MIESZANIE");
  for(var i = 0; i < amountOfShuffles;i++)
  {
    if(i%2==0)
    {
      changeRows(1,shuffleArray([0,2])[0]);
      await delay(SHUFFLE_TIME);
    }else
    {
      var columnsToShuffle = shuffleArray([0,1,2]);
      changeColumns(columnsToShuffle[0],columnsToShuffle[1]);
      await delay(SHUFFLE_TIME);
    }
  }
  var answer = await getAnswerAndSelect();
  $(`#navText`).html("PODAJ ODPOWIEDZ");
  $("#answer").val("");
  $('#answer').show();
  $("#answer").focus();
  progBar.css("width","100%");
  progBar.animate({
    width: "0px"
  }, {
    duration: timeToCheck*1000,
    ease: "linear",
  });
  console.log("SIATKA:");
  console.log(String(data[0][0])+String(data[0][1])+String(data[0][2]));
  console.log(String(data[1][0])+String(data[1][1])+String(data[1][2]));
  console.log(String(data[2][0])+String(data[2][1])+String(data[2][2]));
  return new Promise(async (output) => {

    $("#answer").on("keyup", (event) => {
        if (event.keyCode === 13) {
            $("#progress-bar").stop(true,true);
            if(String(answer[0])+String(answer[1])+String(answer[2]) == $("#answer").val())
            {
              output([true,String(answer[0])+String(answer[1])+String(answer[2]),$("#answer").val()]);
            }else
            {
              output([false,String(answer[0])+String(answer[1])+String(answer[2]),$("#answer").val()]);
            }
        }
    });

    await delay(timeToCheck)
    output([false,String(answer[0])+String(answer[1])+String(answer[2]),$("#answer").val()]);
  });

}

async function start()
{
  $("#buttonDiv").hide();
  $('#correctAnswerButton').hide();
  $("#mainSpot").show();
  $("#progress-bar").stop(true,true);

  progBar = $("#progress-bar");
  progBar.css("width","100%");
  var result = await startHack();
  $("#buttonDiv").show();
  $("#mainSpot").hide();
  $("#progress-bar").stop(true,true);
  $("#matrix").empty();
  drawNumbers();
  if(result[0] == false)
  {
    $(`#buttonStart`).html("Failed. Try again");
  }else
  {
    $(`#buttonStart`).html("Success. Try again");
  }
  console.log("POPRAWNA ODPOWIEDZ:");
  console.log(result[1]);
  console.log("TWOJA ODPOWIEDZ:");
  console.log(result[2]);
}

$("#buttonStart").on( "click", function() {
  data = [];
  $("#progress-bar").stop(true,true);
  timeToCheck = document.getElementById("timeToCheck").value;
  timeToRemember = document.getElementById("timeToRemember").value;
  amountOfShuffles = document.getElementById("amount").value;
  start();
});
