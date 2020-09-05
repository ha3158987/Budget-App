//*****************************************************************1st module: BUDGET CONTROLLER
const budgetController = (function () {
  //expense & income 데이터가 계속적으로 추가될 것이기 때문에 생성자 함수를 이용하는 것이 가장 효율적.
  //id는 추가되는 정보가 expense 인지 income 인지를 구분한다.
  //Keeping track of all the expenses & incomes
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
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

//*****************************************************************2nd module: UI CONTROLLER
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
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //2; Replace the placeholder text with some actual data
      //처음 써보는 메소드! replace는 replace(바꾸고자하는곳, replace할것); 으로 사용
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      //3; Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
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

    //controller 모듈에서는 DOMstrings 객체에 접근을 할 수 없기 때문에 또 하나의 메소드를 만든다.
    getDOMstrings: function () {
      return DOMstrings; //exposing DOMstrings to public!
    },
  };
})();

//**************************************************************3rd module - GLOBAL APP CONTROLLER/이벤트를 컨트롤하는 센트럴
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
  };

  //이 두가지 to-do는 성격이 같고, item을 삭제할 때에도 필요하기 때문에 따로 함수를 만들어 묶어준다. DRY규칙을 따르기 위해서.
  //item이 UI가 추가될 때마다 이 함수가 실행되어야 함.
  const updateBudget = function () {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return the budget(get~) budget을 저장해서 UI에 넘겨줄 것
    var budget = budgetCtrl.getBudget();

    //3. Display the budget on the UI
    console.log(budget);
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
    }
  };
  //여태까지는 IIFE 내부에 위치해 실행시키는 것에 대해 걱정하지 않았지만 여러 요소들을 함수로 묶어줌으로써 함수 실행을 init함수로 컨트롤할 예정.
  //이것은 public레벨에 있어야 하므로 '객체'로 만드는 것이 적합.
  return {
    init: function () {
      console.log("Application has started.");
      setupEventListeners();
    },
  };
})(budgetController, UIController);

//init()이 실행되어야 eventListener가 set-up 될 수 있게 제어.
controller.init();
