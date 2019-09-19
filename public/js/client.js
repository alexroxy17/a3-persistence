window.onload = function() {
let b = []

$('#submitform').submit(function(e) {
    e.preventDefault();
    var iName = $('input#iName').val();
    var amount = $('input#amount').val();
    var user = $('script#user').val();
    $.post('/groceries?' + $.param({iName:iName, amount:amount, user:user}), function() {
      $.get('/groceries', function(groceries) {
          let email = $.get('/email')
          console.log(email)
              
            
       b = Object.values(groceries)
      console.log(groceries)
     
        
        
      let tb = "<table border = '3'"
        tb+= "<tr>"
        tb+="<td>Item Name</td>"
        tb+="<td>Amount</td>"
        tb+="</tr>"
        
        b.forEach(function(b) {
            tb+= "<tr>"
            tb+="<td>"+b[0]+"</td>"
            tb+="<td>"+b[1]+"</td>"
            tb+="</tr>"
        
          //console.log("list:" + b)
          
        });
                     
        tb+="</table>"
        document.getElementById('table').innerHTML = tb
        
      $('input#iName').val('');
      $('input#amount').val('');
      $('input').focus();

    });
  });
});
}




  