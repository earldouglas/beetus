function roundComponent(x) {
  return Math.max(0, x.toFixed(2));
}

function roundTotal(sum) {
  var whole = Math.trunc(sum);
  var remainder = sum - whole;

  var round;

  if (remainder < 0.25) {
    round = 0;
  } else if (remainder < 0.75) {
    round = 0.5;
  } else {
    round = 1;
  }

  return Math.max(0, whole + round);
}

var bloodGlucoseOffset = document.getElementById("bloodGlucoseOffset");
var bloodGlucoseRatio = document.getElementById("bloodGlucoseRatio");

var carbsRatio = document.getElementById("carbsRatio");
var isBreakfast = document.getElementById("isBreakfast");
var isLunch = document.getElementById("isLunch");
var isDinner = document.getElementById("isDinner");

var bloodGlucose = document.getElementById("bloodGlucose");
var carbs = document.getElementById("carbs");

var dateElement = document.getElementById("date");
var timeElement = document.getElementById("time");
var carbsUnits = document.getElementById("carbsUnits");
var bloodGlucoseUnits = document.getElementById("bloodGlucoseUnits");
var total = document.getElementById("total");

function getCurrentDateAndTime() {

  var now = new Date();

  var theDate =
    now.toLocaleString(
      "en-us",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );

  var theTime =
    now.toLocaleTimeString(
      "en-us",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  return {
    date: theDate,
    time: theTime,
  };
}

function go() {

  var calculatedDateAndTime = getCurrentDateAndTime();

  dateElement.innerHTML = calculatedDateAndTime.date;
  timeElement.innerHTML = calculatedDateAndTime.time;

  var carbsRatioValue =
    carbsRatio.value || carbsRatio.placeholder;

  var carbsValue =
    carbs.value || carbs.placeholder;

  var bloodGlucoseValue =
    bloodGlucose.value || bloodGlucose.placeholder;

  var bloodGlucoseOffsetValue =
    bloodGlucoseOffset.value || bloodGlucoseOffset.placeholder;

  var bloodGlucoseRatioValue =
    bloodGlucoseRatio.value || bloodGlucoseRatio.placeholder;

  var carbsCorrection = roundComponent(carbsValue / carbsRatioValue);
  carbsUnits.innerHTML = carbsCorrection;

  var bloodGlucoseCorrection = roundComponent((bloodGlucoseValue - bloodGlucoseOffsetValue) / bloodGlucoseRatioValue);
  bloodGlucoseUnits.innerHTML = bloodGlucoseCorrection;

  var totalCorrection = roundTotal(bloodGlucoseCorrection + carbsCorrection);
  total.innerHTML = totalCorrection;

  var clipboardData = [
    `carbs ratio: ${carbsRatioValue}`,
    `blood sugar offset: ${bloodGlucoseOffsetValue}`,
    `blood sugar ratio: ${bloodGlucoseRatioValue}`,
    `---`,
    `calculated on: ${calculatedDateAndTime.date}`,
    `calculated at: ${calculatedDateAndTime.time}`,
    `copied on: COPIED_ON`,
    `---`,
    `copied at: COPIED_AT`,
    `blood sugar: ${bloodGlucoseValue}`,
    `carbs: ${carbsValue}`,
    `insulin for carbs: ${carbsCorrection}`,
    `insulin for blood sugar: ${bloodGlucoseCorrection}`,
    `total insulin dose: ${totalCorrection}`,
  ];

  document.getElementById('copy').onclick =
    function () {

      var copiedDateAndTime = getCurrentDateAndTime();

      var dataToCopy =
        clipboardData
          .map((x) => x.replaceAll("COPIED_ON", copiedDateAndTime.date))
          .map((x) => x.replaceAll("COPIED_AT", copiedDateAndTime.time))
          .map((x) => x + "\n");

      var type = "text/plain";
      var blob = new Blob(dataToCopy, { type });
      var data = [new ClipboardItem({ [type]: blob })];

      navigator.clipboard.write(data);
    };
}

[
  carbsRatio,
  bloodGlucoseOffset,
  bloodGlucoseRatio,
  carbs,
  bloodGlucose
].forEach((x) => {
    x.onchange = go;
    x.onkeypress = go;
    x.onpaste = go;
    x.oninput = go;
});

[
  isBreakfast,
  isLunch,
  isDinner
].forEach((x) => {
  x.onchange = () => {

    if (isBreakfast.checked) {
      carbsRatio.value = `${isBreakfast.value}`
    } else if (isLunch.checked) {
      carbsRatio.value = `${isLunch.value}`
    } else if (isDinner.checked) {
      carbsRatio.value = `${isDinner.value}`
    } else {
      carbsRatio.value = '';
    }

    go();
  };
});

carbsRatio.value = '';
bloodGlucoseRatio.value = '';
bloodGlucoseOffset.value = '';
bloodGlucose.value = '';
carbs.value = '';

var nowHours = (new Date()).getHours();
if (nowHours <= 9) {
  isBreakfast.click();
  carbsRatio.value = `${isBreakfast.value}`
} else if (nowHours <= 15) {
  isLunch.click();
  carbsRatio.value = `${isLunch.value}`
} else {
  isDinner.click();
  carbsRatio.value = `${isDinner.value}`
}

bloodGlucose.focus();

go();
