//1st module: BUDGET CONTROLLER**********************************************************************************
//******************************************************************************************************************* */
const budgetController = (function () {
  //expense & income 데이터가 계속적으로 추가될 것이기 때문에 생성자 함수를 이용하는 것이 가장 효율적.
  //id는 추가되는 정보가 expense 인지 income 인지를 구분한다.
  //Keeping track of all the expenses & incomes
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1; //없을 경우 -1
  };

  //expense로 더해지는 모든 item은 생성자함수 Expense를 통해 만들어지는 것이므로 여기에 prototype을 더해줘서 모든 instance가 percentage계산하는 프로퍼티를 가지고 생성되도록 할 것.
  //percent를 계산하는 로직
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  //계산된 percent를 반환해주는 로직
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //budget total value를 구하는 로직. 여기에서 매개변수 type은 exp/inc 중에 들어감
  var calculateTotal = function (type) {
    var sum = 0; //initial value
    data.allItems[type].forEach(function (cur) {
      //cur은 current value
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  //data를 한 곳으로 몰아넣기. 만약 income이 10번 추가된다면 그 데이터들은 어디에 저장할 것인가?
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1, //-1은 보통 value가 존재하지 않을 때 사용. budget value나 total expenses가 없을 때
  };

  //public method - 다른 모듈들이 data structure(data 객체)에 아이템을 추가할 수 있게 하는 메소드
  return {
    //아이템 하나를 더할 때마다 필요한 정보들 - exp/inc, description, value
    addItem: function (type, des, val) {
      var newItem, ID;
      //[1, 2, 3, 4, 5], next ID = 6
      //[1, 2, 4, 6, 8], next ID = 9
      // ID = last ID + 1

      //create new ID
      //ID:unique # that we want to assign to each new item that we put either in the expense or in the income arrays for the allitems. 아아템이 각 배열의 '몇번째' 아이템인지 알려주는 숫자. 다만 id는 '딱 한번'만 쓰여야 하고, 사용자가 중간중간 아이템을 지워도 유효하게 하려면, 마지막으로 더해진 숫자 + 1이 되어야 한다. ID = last ID + 1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        //초기 시작을 위한 숫자. 첫번째에는 무조건 0으로 시작할 수 있게. index에 '-1'은 있을 수 없기 때문에.
        ID = 0;
      }

      //create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //Push it into our data structure - type가 'exp' 혹은 'inc' 둘 중 하나가 들어오기 때문에 그대로 추가되어야 할 '배열'이름으로 그대로 쓰면 된다.
      data.allItems[type].push(newItem);

      //Return the new element - 다른 모듈에서 여기서 만들어진 item 객체를 반환받게끔.
      return newItem;
    },

    //item삭제 다루기 - another public method
    deleteItem: function (type, id) {
      var ids, index;
      //id = 6
      //data.allItems[type][id];
      //ex. [1, 2, 4, 6, 8]
      //index = 3
      //이 예제는 중간에 3, 5, 7이 삭제되었다고 가정했을 떄의 배열. 그러면 id를 인덱스로 받아서 삭제한다고 하면 id = 3(인덱스 3)을 지운다고 3이 지워지는 것이 아니라 6이 지워지게 됨. 즉, index# !== id#. 따라서, loop을 돌려서 "input ID"를 이용해 각 ID의 "index"를 가진 배열을 반환받는다. = ids배열을 만들어야 하는 이유

      ids = data.allItems[type].map(function (current) {
        //map은 콜백함수를 받고, 현재요소, 현재인덱스, 배열을 parameter로 받을 수 있다. forEach와의 차이점은 map은 새로운 배열을 반환한다는 것이다.
        return current.id;
      });

      //매개변수 id로 들어온 값의 '진짜 index'를 빈환한다. 만약에 찾는 요소가 배열에 없을 경우 '-1'을 반환한다. 따라서 if 조건을 주어야함.
      index = ids.indexOf(id);

      //splice로 요소를 삭제 (첫번째 인자는 start, 두번째 인자는 delete count) - 배열 직접 변경하고, 삭제된 요소들의 배열을 반환함.
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    //total income 과 total expense, 그리고 expense가 income에서 차지하는 퍼센트(%)를 다룬다.
    calculateBudget: function () {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        //income이 없는 상태에서 exp / inc 을 하면 정수 나누기 0 이 되어서 'infinity'가 나옴. 그래서 inc이 1이라도 있을 때만 적용될 수 있게 바꿈.
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        //ex. expense = 100 and income 300, spent 33.33333% = 100 / 300 = 0.3333 * 100
      } else {
        //-1은 아무것도 없을 때 = non-existence (income이 아직 없을 때)
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      /*
       income = 100
       expense
        a = 20 (20%)
        b = 10 (10%)
        c = 40 (40%)
        */
      //loop over exp array
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function () {
      //forEach대신 map을 사용하는 이유는 값을 저장해야하기 때문에 새로운 배열을 반환해주는 map을 이용해야함.
      var allPercentages = data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function () {
      //property를 만드는 함수를 만든다. value들을 담을 ..
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    //잘 더해지는지 테스트 하는용(지울예정)
    testing: function () {
      console.log(data);
    },
  };
})();

//2nd module: UI CONTROLLER*****************************************************************************************
//******************************************************************************************************************* */
const UIController = (function () {
  //DOM 요소를 가져오는 코드를 저장해 두는 곳. 코드가 중복되고 너무 장황해지는 것을 방지.
  //이렇게하면 UI에서 클래스 이름을 바꾸고 싶다고 해도 전부 다 바꿀 필요 없이 여기에서만 바꿔주면 됨.
  const DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec, type;
    /*
      + or - before number
      show exactly up to 2 decimal points
      comma separating the thousands
      ex.
      2310.4567 -> + 2,310.46
      2000 -> + 2,000.00
      */

    num = Math.abs(num); //num변수에는 절대값이 담김. 절대값으로 override하는 것.
    num = num.toFixed(2); //toFixed는 number.prototype의 메소드!!!!!Math의 메소드가 아님. 문자열을 반환함.

    //소수점자리(decimal)와 정수자리(integer)를 나눔
    numSplit = num.split(".");

    //장수자리
    int = numSplit[0];
    //split에서 값을 받은 int는 아직 string인 상태. .length를 쓸 수가 있음. "1,000" 글자가 3개 이상이면 콤마
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
      //인덱스 0에서 시작해서 1개의 글자를 반환. ex. 245030 -> 245,030
    }

    //소숫점자리
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  //nodelist에 반복문을 실행하는 reusable code를 만드는 것. 매번 forEach를 사용할 필요가 없어짐.
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      //밑의 callback함수 매개변수인 current, index를 전달
      callback(list[i], i);
    }
  };

  //public method
  return {
    getInput: function () {
      return {
        //객체로 반환
        type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    //public method 추가 - 인자로 주는 obj는 newItem객체.
    addListItem: function (obj, type) {
      var html, newHtml;
      //1; Create HTML string with placeholder text
      //html문자열에 들어있는 actual data를 placeholder로 바꿔준다.
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //2; Replace the placeholder text with some actual data
      //처음 써보는 메소드! replace는 replace(바꾸고자하는곳, replace할것); 으로 사용
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //3; Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      //selectorID은 entire ID(income-0, income-1 etc.)이 되어야함.
      var el = document.getElementById(selectorID); //이게 지우고 싶은 element
      el.parentNode.removeChild(el); //parent로 올라갔다가 다시 child로 내려오는 방식으로 삭제(자바스크립트는 removeChild기능밖에 없음)
    },

    //또 다른 public method - 한번 정보 입력 시 입력란이 clear되고, 다시 첫번째 입력란으로 커서가 옮겨가는 기능
    clearFields: function () {
      var fields, fieldsArr;

      //querySelectorAll은 배열과 비슷하지만 배열은 아닌 'list'를 반환한다. 따라서 진짜 '배열'로 변환해줄 필요가 있다.
      //slice는 보통 대상 배열의 카피본을 반환해주기 때문에 slice로 trick을 써서 '리스트'를 input하고 진짜 '배열'을 반환 받는다.
      //다만 list는 array가 아니기 때문에 array의 메소드인 slice를 fields라는 변수 그대로는 쓸 수가 없다. 그래서 call메소드를 이용해서 지정해줄 것.
      //css문법과 똑같기 때문에 comma로 두요소를 같이 언급할 수 있다.
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      //배열의 매 요소들에 콜백함수를 적용한다.
      //forEach의 콜백함수에는 최대 3개까지 매개변수를 전달할 수 있다.현재 값, 인덱스, this 순으로.
      //사용자가 입력했던 값들을 다시 default(빈칸)로 돌려놓기
      fieldsArr.forEach(function (current, index, array) {
        //현재 loop의 대상이 되는 값을 없애는 것

        current.value = "";
      });

      //마우스 커서 첫번째 inputDescription 요소로 돌려놓기
      fieldsArr[0].focus();
    },

    //DOM manupulation = UI 상단에 나타나는 최종 금액, expenses & income 등등/ getBudget 프로퍼티에 있는 네임들을 가져옴
    displayBudget: function (obj) {
      //상단 budget display UI에 + / - 사인 붙이기
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      // -1이 아닐때만 여기에 % 기호를 더하고 -1일때는 다른 것이 나타나도록 설정. 즉, 0%보다 클 때만 나타나도록
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "-";
      }
    },

    //exp item 우측의 percent(%)표시하기
    //매개변수로 받는 percentages는 '배열'.
    displayPercentages: function (percentages) {
      //item이 몇개가 될 지 모르기때문에 querySelectorAll을 사용. 여기서는 그냥 list가 아닌 nodeList를 반환하는데 html으로 이루어진 DOM tree에서는 각각의 element를 'node'라고 부르기 때문.
      var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

      //매개변수 list: fields, callback: function(current, index){};
      nodeListForEach(fields, function (current, index) {
        // do stuff
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "-";
        }
      });
    },

    //실시간 날짜 및 연도 정보 UI에 업데이트하기
    displayMonth: function () {
      var now, month, months, year;
      now = new Date();
      //month는 숫자로 표기되기 때문에 글자로 표기하기 위해 배열을 만듦.
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changeType: function () {
      var fields = document.querySelectorAll(
        //빨간색으로 변하는 효과를 줄 모든 elements들을 nodelist 만들기
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      //global스코프에 있는 반복메소드 재사용
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });
      //체크버튼 색상 바꾸기
      document.querySelector(DOMstrings.inputButton).classList.toggle("red");
    },

    //controller 모듈에서는 DOMstrings 객체에 접근을 할 수 없기 때문에 또 하나의 메소드를 만든다.
    getDOMstrings: function () {
      return DOMstrings; //exposing DOMstrings to public!
    },
  };
})();

//3rd module - GLOBAL APP CONTROLLER/이벤트를 컨트롤하는 센트럴**************************************************************
//******************************************************************************************************************* */
const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListeners = function () {
    const DOM = UICtrl.getDOMstrings();
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    //DOMstrings객체가 이 함수에서는 변수 DOM에 담기기 때문에 DOM으로 가지고 오기
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    //change event 사용하기
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  //이 두가지 to-do는 성격이 같고, item을 삭제할 때에도 필요하기 때문에 따로 함수를 만들어 묶어준다. DRY규칙을 따르기 위해서.
  //item이 UI가 추가될 때마다 이 함수가 실행되어야 함.
  const updateBudget = function () {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return the budget(get~) budget을 저장해서 UI에 넘겨줄 것
    var budget = budgetCtrl.getBudget();

    //3. Display the budget on the UI - 위 라인의 budget변수에 담긴 객체를 매개변수로 가져온다.
    UICtrl.displayBudget(budget);
  };

  //percent는 item이 더해지거나 삭제될 때마다 업데이트가 매번 되어야 함. updateBudget처럼 따로 함수를 만들어서 ctrlAddItem & ctrlDeleteItem에 각각 추가해줘야한다.
  const updatePercentages = function () {
    //1. calculate percentages
    budgetCtrl.calculatePercentages();

    //2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentage();

    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  //버튼이 눌리면(click이 되면) 일어나야 하는 일
  const ctrlAddItem = function () {
    var input, newItem;

    //1. Get the field input data
    input = UICtrl.getInput();
    //0 혹은 빈 값이 아니거나 숫자인 경우(숫자가 아닌값은 더해지지 않도록)에만 입력되도록
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. Add the item to the UI - 실행을 해야 UI에서 보여짐!
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      //6. Calculate and update percentages
      updatePercentages();
    }
  };

  //여기서 event bubbling up이 일어나야 함. 타고 올라가 어느 요소에서부터 이벤트가 일어났는지 추적함.
  const ctrlDeleteItem = function (event) {
    //delet하고 싶은 건 단순히 x 아이콘(혹은 버튼)이 아니라 해당 item으로 추가된 모든 상위 요소들!! 가장 높은 parent요소에 event를 걸어 delegate event.
    //DOM traversing
    var itemID, splitID, type, ID;
    //event.target은 delete button
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    //여기서 id란 income-0, income-1,,,
    if (itemID) {
      //모든 string은 원시값(primitive)이기 때문에 'split' 메소드에 access를 가지고 있음. "배열"로 반환해줌.
      //ex. inc-1 => ["inc", "1"]
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]); //split이 반환해주는 것은 "string"!! 그런데 budgetCtrl에서 지워야 하는 것은 "number"이기 떄문에 sting => number 해주기.

      //1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      //2. delete the item from the UI
      UICtrl.deleteListItem(itemID); //itemID는 entire ID(income-0, income-1 etc.)가 되어야함.

      //3. Update and show the new budget
      updateBudget();

      //4. Calculate and update percentages
      updatePercentages();
    }
  };

  //여태까지는 IIFE 내부에 위치해 실행시키는 것에 대해 걱정하지 않았지만 여러 요소들을 함수로 묶어줌으로써 함수 실행을 init함수로 컨트롤할 예정.
  //이것은 public레벨에 있어야 하므로 '객체'로 만드는 것이 적합.
  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      }); //시작과 동시에 상단 budget UI가 나타나게 하되,budget이 아니라 모두 '0'으로 시작. getBudget에서 객체 복사해서 값만 '0'으로 바꿈.
      setupEventListeners();
    },
  };
})(budgetController, UIController);

//init()이 실행되어야 eventListener가 set-up 될 수 있게 제어.
controller.init();
