//DATA ENCAPSULATION:
//module pattern으로 module을 만드는 방법: 객체를 반환하는 IIFE를 생성한다. 오직 내부에서만 접근이 가능한 함수와 변수를 가진 코드 유닛을 만든다. override방지.
//module patten의 핵심은 모든 public 함수를 가진 객체로 반환된다. 외부 스코프에서 접근이 가능한 형식으로.
const budgetController = (function () {
  const x = 23;
  //Private function - 외부에서 x나 add는 모두 접근이 불가능함.
  const add = function (a) {
    return x + a;
  };
  return {
    //객체 반환
    publicTest: function (b) {
      console.log(add(b));
    },
  };
})();
