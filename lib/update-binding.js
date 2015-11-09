var canBeBound = function(tag, attr) {
  if(tag === 'can-import' || attr.indexOf("data-") === 0 || attr === 'id' ||
     attr === 'class') {
    return false;
  }
  else {
    return true;
  }
};

var removeBinding = function(prop) {
  prop = prop || '';

  if(prop.substring(0, 2) === '{{') {
    prop = prop.substring(2, prop.length - 2);
  }
  else if(prop[0] === '{') {
    prop = prop.substring(1, prop.length - 1);
  }

  if(prop[0] === '(') {
    prop = prop.substring(1, prop.length - 1);
  }

  if(prop[0] === '^' || prop[0] === '*' || prop[0] === '@') {
    prop = prop.substr(1);
  }

  if(prop[0] === '$') {
    prop = prop.substr(1);
  }

  return prop;
};

var bindAttr = function(direction, attr) {
  if(direction === 'to-child') {
    return '{' + removeBinding(attr) + '}';
  }
  else {
    return '{(' + removeBinding(attr) + ')}';
  }
};

var bindValue = function(value) {
  return '{' + removeBinding(value) + '}';
};

var bindEvent = function(type, ev) {
  ev = ev.substr(ev.indexOf('-') + 1); // e.g. can-click -> click

  if(type === 'dom') {
    return '($' + ev + ')';
  }
  else {
    return '(' + ev + ')';
  }
};

var bindHandler = function(handler) {
  return handler + '()';
};

var helpURL = function(segments) {
  return '{{routeUrl ' + removeBinding(segments) + '}}';
};

var updateBinding = function(contents, options) {
  contents = contents.replace(/<([a-z-]+)([\s\r\n]+)([\w\W]*?)>/g, function(s, tag, spacing, allAttrs) {
    allAttrs = allAttrs.replace(/([^=\s\r\n]*)([\s\r\n]*)=([\s\r\n]*)(["']?)((\\\4|[^\4])*?)\4/g,
      function(s, attr, sp1, sp2, quoteType, value) {
        var isComponentTag = tag.indexOf('-') !== -1;
        var isStaticValue = options.isStache && /^[^{(*]+$/.test(value);
        var isOneWayValue = options.isStache && /^{{[^{]+}}$/.test(value);

        if(canBeBound(tag, attr)) {
          if(attr === 'can-href' && options.newBindingSyntax) {
            attr = 'href';
            value = helpURL(value);
          }
          else if(attr === 'can-value' && options.newBindingSyntax) {
            attr = '{'+ bindEvent('dom', attr) + '}';
            value = removeBinding(value);
          }
          else if(attr.indexOf("can-") === 0) {
            if(options.newBindingSyntax) {
              attr = bindEvent((isComponentTag ? 'vm' : 'dom'), attr);
              value = bindHandler(value);
            }
            else {
              value = bindValue(value);
            }
          }
          else if(isComponentTag && !isStaticValue) {
            if(options.newBindingSyntax) {
              attr = bindAttr(isOneWayValue ? 'to-child' : 'two-way', attr);
              value = removeBinding(value);
            }
            else {
              attr = removeBinding(attr);
              value = bindValue(value);
            }
          }
        }

        return attr+sp1+"="+sp2+quoteType+ value +quoteType;
      }
    );

    return "<" + tag + spacing + allAttrs + ">";
  });

  return contents;
};

module.exports = updateBinding;
