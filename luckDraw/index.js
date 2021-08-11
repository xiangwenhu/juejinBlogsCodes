var options = {
};

var lottery = new Lottery(options);
var lotteryEl = document.querySelector(".item-container");

var dialogEl = document.querySelector(".lottery_modal");

function removeChoseClass() {
    var el = lotteryEl.querySelector('.turntable-item.chosen');
    if (el) {
        el.classList.remove('chosen');
    }
}

lottery.onStart = function (ins, index, cycle) {
    removeChoseClass();
    lotteryEl.querySelector('.turntable-item.turntable-item-' + index).classList.add('chosen');
}

lottery.onUpdate = function (ins, index, times) {
    removeChoseClass();
    lotteryEl.querySelector('.turntable-item.turntable-item-' + index).classList.add('chosen');
}

lottery.onEnded = function (ins, index, prizeIndexes) {
    removeChoseClass();
    lotteryEl.querySelector('.turntable-item.turntable-item-' + index).classList.add('chosen');

    setTimeout(function () {
        dialogEl.classList.remove("hide");
    }, 500)
}

lottery.onError = function (ins, code, message) {
    console.log('onError', code, message)
}

var btnStart = document.querySelector(".turntable-box .turntable-item.lottery");
btnStart.addEventListener('click', function () {
    lottery.start();
    setTimeout(() => {
        setPrize();
    }, 800)
})

btnSubmit.addEventListener('click', function () {
    dialogEl.classList.add("hide");
})

function setPrize() {
    lottery.setPrize([4])
}