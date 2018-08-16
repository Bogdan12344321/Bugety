//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){

        this.id = id;
        this.description = description;
        this.value = value;

    };

    var Income = function(id, description, value){

        this.id = id;
        this.description = description;
        this.value = value;

    };

    var calculateTotal = function(type){

        var sum = 0;
        data.allItems[type].forEach(function (cur) {

            sum = sum + cur.value;

        });
        data.totals[type] = sum;
    };

    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        buget: 0,
        precentage: -1
    };

    return{

        addItem: function(type, des, val){

            var newItem,id;
            //Create new ID
            if(data.allItems[type].length > 0){

                id = data.allItems[type][data.allItems[type].length - 1].id + 1;

            }else{

                id = 0;

            }

            //Create new item based in 'inc' or 'exp' type
            if(type === 'exp'){
                newItem  = new Expense(id,des,val);

            }else if(type === 'inc'){

                newItem = new Income(id,des,val);

            }
            //Push it into our data structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        deteleItem: function(type,id){
            var ids,index;
            // id = 3
          ids = data.allItems[type].map(function (current) {

                return current.id;

            });

          index = ids.indexOf(id);

          if(index !== -1){

              data.allItems[type].splice(index, 1);

          }

        },

        calculateBudget: function(){

            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income - expenses
            data.buget = data.totals.inc - data.totals.exp;

            //Calculate the precentage of income that we spent
            if(data.totals.inc > 0){
                data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.precentage = -1;
            }


        },
        getBudget: function(){

            return{

                budget: data.buget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                precentage: data.precentage

            }

        },

        testing: function(){

            console.log(data);

        }

    }

})();




//UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {

        inputType: '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        precentageLabel: '.budget__expenses--percentage',
        container: '.container'

    };

    return {
        getinput: function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html,newHtml;
            //create HTML sting with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html =   '<div class="item clearfix" id="exp-$id$"><div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
                    '</div></div></div>'

            }

            //Replace the placeholder text with some actual data

            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace ('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem : function(selectorID){

            var element =  document.getElementById(selectorID);
            element.parentNode.removeChild(element);

        },
        clearField: function(){
            var fields;
           fields =  document.querySelectorAll(DOMstrings.inputDescription + ', '
               +DOMstrings.inputValue);
          var fieldsArr = Array.prototype.slice.call(fields);

          fieldsArr.forEach(function (current, index, array) {

              current.value = "";

          });

          fieldsArr[0].focus();

        },
        displayBudget: function(obj){

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            if(obj.precentage > 0){
                document.querySelector(DOMstrings.precentageLabel).textContent = obj.precentage + '%';

            }else{
                document.querySelector(DOMstrings.precentageLabel).textContent = '---';

            }
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

//GLOBAL APP CONTROLLER
var Controller = (function(budgetCtrl,UICtrl){
    var ctrlDeleteItem = function(){
        var itemID,type,ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //1.Delete the item from the data sctructire
            budgetCtrl.deteleItem(type,ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

        }

    };

    var setupEventListeners = function(){

        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){

            if(event.keyCode === 13){
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);


    };

    var DOM = UICtrl.getDOMstrings();
    var updateBudget = function(){

        //1.Calculate the budget
        budgetCtrl.calculateBudget();

        //2.Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);


    };

    var ctrlAddItem = function(){
        var input,newItem;
        //1. Get the field input data
        input = UICtrl.getinput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4.Clear the fields
            UICtrl.clearField();
            //5. Calculate the budget
            updateBudget();
        }


    };
    setupEventListeners();
    return {
        init: function () {

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                precentage: -1
            });

        }
    };


})(budgetController, UIController);

Controller.init();


