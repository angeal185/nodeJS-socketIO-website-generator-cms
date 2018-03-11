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
  defaultText: 'builder',
  displayTime: 3000,
  target: 'body'
};

var showtoast = new ToastBuilder(myOptions);
