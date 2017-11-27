$(body).css({'zoom':'80%'})

exports.showHiddenText = function() {
    console.log('in hidden text function?');
    var text = $('forgotPW')
    text.css({'display':'inline-block'})
}

var showIt = function() {
    var quote = $('#quotePetitionSite');
    console.log('quote', quote);
    quote.css({'visibility':"visible", 'opacity':'1'});
}
setTimeout(showIt, 2000);
