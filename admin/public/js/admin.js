function loadToolbar() {
  var config = {
    "title":"Status",
    "items":{
      "cpuUser": "CPU User",
      "cpuSystem": "CPU System",
      "freemem": "Free Memory",
      "totalmem": "Total Memory",
      "nodeMemUsage": "Node Memory",
      "uptime": "Uptime",
      "nodeVersion":"NodeJs version",
      "ostype":"OS Type",
      "platform":"Platform"
    }
  }

  var toolbarTpl = '<div class="toolbar fadeInLeft"><div class="toolbarHead"><h2 class="blink">' + config.title + '</h2></div><div class="toolbarBody"></div></div>';

  $('body').prepend(toolbarTpl);
  $.each(config.items, function(key, val) {
    $('.toolbarBody').append('<div class="toolbarItem">' + val + ': <span id="'+ key +'" class="toolbarRes blink"></span></div>');
  });

}


function ToastBuilder(options) {
  // options are optional
  var opts = options || {};

  // setup some defaults
  opts.defaultText = opts.defaultText || 'default text';
  opts.displayTime = opts.displayTime || 3000;
  opts.target = opts.target || 'body';

  return function (text) {
    $('<div/>')
      .addClass('toast')
      .prependTo($(opts.target))
      .text(text || opts.defaultText)
      .queue(function(next) {
        $(this).css({
          'opacity': 1
        });
        var topOffset = 90;
        $('.toast').each(function() {
          var $this = $(this);
          var height = $this.outerHeight();
          var offset = 15;
          $this.css('top', topOffset + 'px');

          topOffset += height + offset;
        });
        next();
      })
      .delay(opts.displayTime)
      .queue(function(next) {
        var $this = $(this);
        var width = $this.outerWidth() + 20;
        $this.css({
          'right': '-' + width + 'px',
          'opacity': 0
        });
        next();
      })
      .delay(600)
      .queue(function(next) {
        $(this).remove();
        next();
      });
  };
}

var myOptions = {
  defaultText: 'Admin',
  displayTime: 3000,
  target: 'body'
};

var showtoast = new ToastBuilder(myOptions);


  $('.to-right').click(function() {
     if ($(this).parent('label').next().val() == "true") {
        $(this).parent('label').next().val("false");

     }
     else {
        $(this).parent('label').next().val("true");

     }
  });

  function toggleBool(i){
    if ($(i).val() == "true") {
       $(i).val("false");

    }
    else {
       $(i).val("true");

    }
  }
