var mathWidget = { //mathWidget.config.operationType.currentOperation
    config: {
        variablesAmount: 2,
        variablesLength: 3
    },

    generateRandomVariable: function () {
        return Math.round(Math.random() * Math.pow(10, mathWidget.config.variablesLength));
    },

    createFewRandomVariables: function () {
        allRandomVars = [];
        for (var p = 0; p < mathWidget.config.variablesAmount; p++) {
            allRandomVars.push(mathWidget.generateRandomVariable());
        }
        return allRandomVars;
    },

    printRandomVariables: function () {
        $("#taskToSolve").text(mathWidget.createFewRandomVariables().join(mathWidget.operationType.currentOperation));
    },

    operationType: {
        currentOperation: '+',

        plus: function () { //code was stolen from http://www.w3schools.com/js/js_function_parameters.asp
            var i, plus = 0;
            for (i = 0; i < arguments.length; i++) {
                plus += arguments[i];
            }
            return plus;
        }, //In current case, plus all variables with each other.

        minus: function () { //My remake. Will sum all arguments and minus it from first.
            var j, minus = arguments[0];
            for (j = 1; j < arguments.length; j++) {
                minus -= arguments[j];
            }
            return minus;
        },

        multiply: function () {
            var k, multi = 1;
            for (k = 0; k < arguments.length; k++) {
                multi *= arguments[k];
            }
            return multi;
        },

        divide: function () {
            var l, divide = arguments[0];
            for (l = 1; l < arguments.length; l++) {
                divide /= arguments[l];
            }
            return divide;
        }
    },

    //Main part.
    getUserInput: function () {
        userInput = $("#userInput").val();
        return userInput;
    },

    getCorrectResult: function () { //I will use this function for radioButton changes (from the user side) and for comparing user input with the result.
        switch (mathWidget.operationType.currentOperation) {
            case '+':
                return mathWidget.operationType.plus.apply(this, allRandomVars);
            case '-':
                return mathWidget.operationType.minus.apply(this, allRandomVars);
            case '*':
                return mathWidget.operationType.multiply.apply(this, allRandomVars);
            case '/':
                return mathWidget.operationType.divide.apply(this, allRandomVars);
            default:
                //I am not sure if it's possible to execute, but I still put default case.
                return mathWidget.operationType.plus.apply(this, allRandomVars);
        }
    },

    compareResultWithUserInput: function () {
        if (mathWidget.getCorrectResult() == mathWidget.getUserInput()) {
            $("#resultText").html(''); //Clear prev result.
            $("#resultText").html('Correct!');
            mathWidget.statistics.printPositiveResult();
        } else {
            $("#resultText").html(''); //Clear prev result.
            $("#resultText").html('Incorrect. The correct ansver is <strong> ' + mathWidget.getCorrectResult() + '</strong> Keep going!');
            mathWidget.statistics.printNegativeResult();
        }
    },

    statistics: { //mathWidget.statistics.iterationAmount
        currentDate: '',
        iterationAmount: 0, //General amount of tasks, that user has already resolved.Will increment each iteration.
        positiveResult: 0,
        negativeResult: 0,

        printPositiveResult: function () {
            mathWidget.statistics.positiveResult++;
            mathWidget.statistics.iterationAmount++;
            $('#general').text(mathWidget.statistics.iterationAmount); //Put in table.
            $('#correct').text(mathWidget.statistics.positiveResult);
            mathWidget.statistics.showMessegeIfEmptyStatistics();
            mathWidget.statistics.displayStatisticsPie(mathWidget.statistics.positiveResult, mathWidget.statistics.negativeResult);
        },

        printNegativeResult: function () {
            mathWidget.statistics.negativeResult++;
            mathWidget.statistics.iterationAmount++;
            $('#general').text(mathWidget.statistics.iterationAmount); //Put in table.
            $('#incorrect').text(mathWidget.statistics.negativeResult);
            mathWidget.statistics.showMessegeIfEmptyStatistics();
            mathWidget.statistics.displayStatisticsPie(mathWidget.statistics.positiveResult, mathWidget.statistics.negativeResult);
        },


        //For LocalStorage statistics (few days statistics).
        createDate: function () {
            return new Date();
        },
        createTime: function () { //Current time.
            var time = mathWidget.statistics.date();
            return time.toLocaleTimeString();
        },
        createKey: function () { //Creates unique key 13 digits.
            var key = mathWidget.statistics.createDate().getTime();
            return key;
        },

        PutToLocalStorage: function () { //mathWidget.statistics.PutToLocalStorage()
            var newArr = {
                date: mathWidget.statistics.createDate(),
                total: mathWidget.statistics.iterationAmount,
                correct: mathWidget.statistics.positiveResult,
                incorrect: mathWidget.statistics.negativeResult,
            };
            localStorage.setItem(mathWidget.statistics.createKey(), JSON.stringify(newArr));
            mathWidget.statistics.displayStatisticsPie(mathWidget.statistics.positiveResult, mathWidget.statistics.negativeResult);
        },

        GetFromLocalStorage: function () {
            $("#secondTableStatistics").html('');//Clear all previous data if exist.
            $("#secondTableStatistics").append("<table class='table table-condensed'><thead><tr><th>Date</th><th>Correct</th><th>Incorrect</th><th>Total</th></tr></thead><tbody>");
            for (var i = 0; i < localStorage.length; i++) {
                var newArr = JSON.parse(localStorage.getItem(localStorage.key(i)));
                $("#secondTableStatistics > table > tbody").append("<tr><td>" + newArr.date.slice(0, 10) + " " + newArr.date.slice(11, 19) + "</td>" + "<td>" + newArr.correct + "</td>" + "<td>" + newArr.incorrect + "</td>" + "<td>" + newArr.total + "</td></tr>");
            }
            $("#secondTableStatistics").append("</tbody></table>");
        },

        displayStatisticsPie: function (correct, incorrect) {//Will make this module reusable. I will display todays and overall statistics with it.
            var data = [{
                "label": "Correct",
                    "value": correct//mathWidget.statistics.positiveResult
            }, {
                "label": "Incorrect",
                    "value": incorrect//mathWidget.statistics.negativeResult
            }];
            var myColors = ["#9f9", "#f44"];
            d3.scale.myColors = function () {
                return d3.scale.ordinal().range(myColors);
            };

            nv.addGraph(function () {
                var chart = nv.models.pieChart()
                    .x(function (d) {
                    return d.label
                })
                    .y(function (d) {
                    return d.value
                })
                    .showLabels(true).color(d3.scale.myColors().range());

                d3.select("#chart svg")
                    .datum(data)
                    .transition().duration(1200)
                    .call(chart);

                return chart;
            });
        },

        deleteStatistics: function () {
            localStorage.clear();
            $("#secondTableStatistics").html('');

            mathWidget.statistics.positiveResult = 0;
            mathWidget.statistics.negativeResult = 0;
            mathWidget.statistics.iterationAmount = 0;

            mathWidget.statistics.showMessegeIfEmptyStatistics();
            mathWidget.statistics.displayStatisticsPie(mathWidget.statistics.positiveResult, mathWidget.statistics.negativeResult); //Collapse pie.
        },

        showMessegeIfEmptyStatistics: function () {
            if (mathWidget.statistics.iterationAmount == 0) {
                $("table").addClass("hide");
                $("#emptyStatisticsMessage").removeClass("hide"); //Display message, hide table.
            } else {
                $("table").removeClass("hide");
                $("#emptyStatisticsMessage").addClass("hide"); //Hide message, display table.
            }
        }

    }
};



mathWidget.printRandomVariables();



/*Main part. Action on submit.*/
$("#userInputSubmit").on('click', function () {
    mathWidget.getUserInput();
    mathWidget.compareResultWithUserInput(); //Call calculateResult and compare functions.
    mathWidget.printRandomVariables(); //Create new task.
    $("#userInput").val(""); //Clear input field.
});

/*Settings*/
$("input:text#variablesLength").on("keyup", function () {
    mathWidget.config.variablesLength = $(this).val();
});
$("input:text#variablesAmount").on("keyup", function () {
    mathWidget.config.variablesAmount = $(this).val();
});

//Radio button.
$("#menu2").on("change", function () {
    mathWidget.operationType.currentOperation = $('input[name=operationType]:checked').val();
    mathWidget.getCorrectResult();
    // alert(mathWidget.config.operationType.plus.apply(this, allRandomVars));//works
});

//Show more statistics button.
$("#moreStatistics").on('click', function () {
    alert('#moreStatistics clicked'); //test
    mathWidget.statistics.GetFromLocalStorage();//Get data from local storage.
    //Append table and display data in table.
});

//Delete statistics button.
$("input#deleteStatistics").on("click", function () {
    mathWidget.statistics.deleteStatistics();
    $("a#saveStatistics > span.glyphicon").removeClass("glyphicon-floppy-saved").addClass("glyphicon-floppy-disk"); //Change icon to unsaved.
    $("a#saveStatistics > span.glyphicon").next().text("Save to statistics.");
});

//Save session using statistics button.
$(".container > a#saveStatistics").on("click", function () {
    mathWidget.statistics.PutToLocalStorage();
    $("a#saveStatistics > span.glyphicon").removeClass("glyphicon-floppy-disk").addClass("glyphicon-floppy-saved"); //Change icon to saved.
    $("a#saveStatistics > span.glyphicon").next().text("Saved to statistics successfully.");
    $("#userInputSubmit").on("click", function () {
        $("a#saveStatistics > span.glyphicon").removeClass("glyphicon-floppy-saved").addClass("glyphicon-floppy-disk"); //Change icon to unsaved.
        $("a#saveStatistics > span.glyphicon").next().text("Save to statistics.");
    });
});