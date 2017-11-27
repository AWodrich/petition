$(body).css({'zoom':'80%'})
var showIt = function() {
    var quote = $('#quotePetitionSite');
    console.log('quote', quote);
    quote.css({'visibility':"visible", 'opacity':'1'});
}
setTimeout(showIt, 2000);
