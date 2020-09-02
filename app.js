//1st module: BUDGET CONTROLLER
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

    //잘 더해지는지 테스트 하는용(지울예정)
    testing: function () {
      console.log(data);
    },
  };
})();

//2nd module: UI CONTROLLER
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
        value: document.querySelector(DOMstrings.inputValue).value,
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

    //controller 모듈에서는 DOMstrings 객체에 접근을 할 수 없기 때문에 또 하나의 메소드를 만든다.
    getDOMstrings: function () {
      return DOMstrings; //exposing DOMstrings to public!
    },
  };
})();

//3rd module - GLOBAL APP CONTROLLER/이벤트를 컨트롤하는 센트럴
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

  //버튼이 눌리면(click이 되면) 일어나야 하는 일
  const ctrlAddItem = function () {
    var input, newItem;

    //1. Get the field input data
    input = UICtrl.getInput();
    // console.log(input);

    //2. Add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    //3. Add the item to the UI - 실행을 해야 UI에서 보여짐!
    UICtrl.addListItem(newItem, input.type);

    //4. Calculate the budget
    //5. Display the budget on the UI
    console.log("It works!!!");
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

//init()이 실행되면 eventListener가 set-up 될 예정.
controller.init();
