const initialConfiguration = {
  bloodGlucoseRatio: 140,
  bloodGlucoseOffset: 120,

  breakfastCarbsRatio: 9,
  lunchCarbsRatio: 14,
  dinnerCarbsRatio: 14,

  negativeKeytoneMultiplier: 1,
  traceKeytoneMultiplier: 1,
  smallKeytoneMultiplier: 1,
  moderateKeytoneMultiplier: 1.1,
  largeKeytoneMultiplier: 1.2,
};

const library = {

  getCarbsRatio: function (mealtime) {
    if (mealtime === 'breakfast') {
      return initialConfiguration.breakfastCarbsRatio;
    } else if (mealtime === 'lunch') {
      return initialConfiguration.lunchCarbsRatio;
    } else if (mealtime === 'dinner') {
      return initialConfiguration.dinnerCarbsRatio;
    } else {
      throw ('invalid mealtime: ' + mealtime);
    }
  },

  getKeytoneMultiplier: function (keytoneLevel) {
    if (keytoneLevel === 'negative') {
      return initialConfiguration.negativeKeytoneMultiplier;
    } else if (keytoneLevel === 'trace') {
      return initialConfiguration.traceKeytoneMultiplier;
    } else if (keytoneLevel === 'small') {
      return initialConfiguration.smallKeytoneMultiplier;
    } else if (keytoneLevel === 'moderate') {
      return initialConfiguration.moderateKeytoneMultiplier;
    } else if (keytoneLevel === 'large') {
      return initialConfiguration.largeKeytoneMultiplier;
    } else {
      throw ('invalid keytone level: ' + keytoneLevel);
    }
  },

  roundToHundredths: function (x) {
    return Math.max(0, x.toFixed(2));
  },

  roundToNearestHalf: function (sum) {
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
  },

  getCurrentDateAndTime: function() {

    var now = new Date();

    var theDate =
      now.toLocaleString(
        'en-us',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }
      );

    var theTime =
      now.toLocaleTimeString(
        'en-us',
        {
          timeStyle: 'short',
        }
      );

    return {
      date: theDate,
      time: theTime,
    };
  },

};

const ui = {

  getInputFromDom: function () {

    const bloodGlucoseOffset = document.getElementById('bloodGlucoseOffset').value || '0';
    const bloodGlucoseRatio = document.getElementById('bloodGlucoseRatio').value || '0';

    const mealtime = document.getElementById('mealtime').value;
    const keytoneLevel = document.getElementById('keytoneLevel').value;

    const bloodGlucose = document.getElementById('bloodGlucose').value || '0';
    const carbs = document.getElementById('carbs').value || '0';

    return {

      bloodGlucoseOffset: bloodGlucoseOffset,
      bloodGlucoseRatio: bloodGlucoseRatio,

      mealtime: mealtime,
      carbsRatio: library.getCarbsRatio(mealtime),

      bloodGlucose: bloodGlucose,
      carbs: carbs,

      keytoneLevel: keytoneLevel,
      keytoneMultiplier: library.getKeytoneMultiplier(keytoneLevel),

    };
  },

  calculate: function (input) {

    const dateAndTime =
      library.getCurrentDateAndTime();

    const bloodGlucoseCorrection =
      library.roundToHundredths(
        (input.bloodGlucose - input.bloodGlucoseOffset) / input.bloodGlucoseRatio
      );

    const carbsCorrection =
      library.roundToHundredths(input.carbs / input.carbsRatio);

    const subtotalCorrection =
      library.roundToHundredths(
        bloodGlucoseCorrection + carbsCorrection
      );

    const unroundedTotalCorrection =
      library.roundToHundredths(
        input.keytoneMultiplier * subtotalCorrection
      );

    const totalCorrection =
      library.roundToNearestHalf(unroundedTotalCorrection);

    return {
      date: dateAndTime.date,
      time: dateAndTime.time,
      bloodGlucoseCorrection: bloodGlucoseCorrection,
      carbsCorrection: carbsCorrection,
      subtotalCorrection: subtotalCorrection,
      unroundedTotalCorrection: unroundedTotalCorrection,
      totalCorrection: totalCorrection,
    };
  },

  updateDom: function (input, calculation) {

    document.querySelectorAll("#mealtime option")
      .forEach((node) => {
        if (node.value === 'breakfast') {
          node.innerHTML = `Breakfast (1:${initialConfiguration.breakfastCarbsRatio})`;
        } else if (node.value === 'lunch') {
          node.innerHTML = `Lunch (1:${initialConfiguration.lunchCarbsRatio})`;
        } else if (node.value === 'dinner') {
          node.innerHTML = `Dinner (1:${initialConfiguration.dinnerCarbsRatio})`;
        } else {
          throw ('invalid mealtime: ' + node);
        }
      });

    document.querySelectorAll("#keytoneLevel option")
      .forEach((node) => {
        if (node.value === 'negative') {
          node.innerHTML = `Negative (${initialConfiguration.negativeKeytoneMultiplier}x)`;
        } else if (node.value === 'trace') {
          node.innerHTML = `Trace (${initialConfiguration.traceKeytoneMultiplier}x)`;
        } else if (node.value === 'small') {
          node.innerHTML = `Small (${initialConfiguration.smallKeytoneMultiplier}x)`;
        } else if (node.value === 'moderate') {
          node.innerHTML = `Moderate (${initialConfiguration.moderateKeytoneMultiplier}x)`;
        } else if (node.value === 'large') {
          node.innerHTML = `Large (${initialConfiguration.largeKeytoneMultiplier}x)`;
        } else {
          throw ('invalid keytone level: ' + node);
        }
      });


    document.getElementById('total').innerHTML = calculation.totalCorrection;

    document.getElementById('bloodGlucoseRatio2').innerHTML = input.bloodGlucoseRatio;
    document.getElementById('bloodGlucoseOffset2').innerHTML = input.bloodGlucoseOffset;
    document.getElementById('bloodGlucose2').innerHTML = input.bloodGlucose;
    document.getElementById('bloodGlucoseUnits').innerHTML = calculation.bloodGlucoseCorrection;

    document.getElementById('carbsRatio').innerHTML = `1:${input.carbsRatio} (${input.mealtime})`;
    document.getElementById('carbs2').innerHTML = input.carbs;
    document.getElementById('carbsUnits').innerHTML = calculation.carbsCorrection;

    document.getElementById('subtotal').innerHTML = calculation.subtotalCorrection;
    document.getElementById('keytoneMultiplier').innerHTML = `${input.keytoneMultiplier}x (${input.keytoneLevel})`;
    document.getElementById('unroundedTotal').innerHTML = calculation.unroundedTotalCorrection;
    document.getElementById('total2').innerHTML = calculation.totalCorrection;
    document.getElementById('time').innerHTML = calculation.time;

    document.getElementById('copy').onclick =
      function () {

        var copiedDateAndTime = library.getCurrentDateAndTime();

        var clipboardData = [
          `blood glucose offset: ${input.bloodGlucoseOffset}`,
          `blood glucose ratio: ${input.bloodGlucoseRatio}`,
          `mealtime: ${input.mealtime}`,
          `carbs ratio: ${input.carbsRatio}`,
          `keytone level: ${input.keytoneLevel}`,
          `keytone multiplier: ${input.keytoneMultiplier}`,
          `---`,
          `calculated on: ${calculation.date}`,
          `calculated at: ${calculation.time}`,
          `copied on: ${copiedDateAndTime.date}`,
          `---`,
          `copied at: ${copiedDateAndTime.time}`,
          `blood glucose: ${input.bloodGlucose}`,
          `carbs: ${input.carbs}`,
          `insulin for carbs: ${calculation.carbsCorrection}`,
          `insulin for blood glucose: ${calculation.bloodGlucoseCorrection}`,
          `subtotal insulin dose: ${calculation.subtotalCorrection}`,
          `total insulin dose: ${calculation.totalCorrection}`,
        ];

        var dataToCopy = clipboardData .map((x) => x + '\n');

        var type = 'text/plain';
        var blob = new Blob(dataToCopy, { type });
        var data = [new ClipboardItem({ [type]: blob })];

        navigator.clipboard.write(data);
      };

  },

  initialize: function () {

    const bloodGlucoseOffset = document.getElementById('bloodGlucoseOffset');
    const bloodGlucoseRatio = document.getElementById('bloodGlucoseRatio');
    const carbs = document.getElementById('carbs');
    const bloodGlucose = document.getElementById('bloodGlucose');
    const mealtime = document.getElementById('mealtime');
    const keytoneLevel = document.getElementById('keytoneLevel');

    bloodGlucoseRatio.value = initialConfiguration.bloodGlucoseRatio;
    bloodGlucoseOffset.value = initialConfiguration.bloodGlucoseOffset;
    bloodGlucose.value = '';
    carbs.value = '';

    var nowHours = (new Date()).getHours();
    if (nowHours <= 9) {
      mealtime.value = 'breakfast';
    } else if (nowHours <= 15) {
      mealtime.value = 'lunch';
    } else {
      mealtime.value = 'dinner';
    }

    keytoneLevel.value = 'negative';

    const go = function () {
      const input = ui.getInputFromDom();
      const calculation = ui.calculate(input);
      ui.updateDom(input, calculation);
    };

    [
      bloodGlucoseOffset,
      bloodGlucoseRatio,
      carbs,
      bloodGlucose,
      mealtime,
      keytoneLevel,
    ].forEach((x) => {
        x.onchange = go;
        x.onkeypress = go;
        x.onpaste = go;
        x.oninput = go;
    });

    go();
  },

};

ui.initialize();
