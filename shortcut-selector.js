/**
 * Duration widget module
 *
 * @param {jQuery} $
 */
H5PEditor.widgets.shortcutSelector = H5PEditor.shortcutSelector = (function ($) {

  /**
   * Creates a time picker.
   *
   * @param {mixed} parent
   * @param {object} field
   * @param {mixed} params
   * @param {function} setValue
   * @returns {C}
   */
  function C(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
  }

  /**
   * Append the field to the wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  C.prototype.appendTo = function ($wrapper) {
    var that = this;

    this.$item = $(this.createHtml()).appendTo($wrapper);
    this.$item.addClass('h5p-shortcut-selector');
    this.$inputs = this.$item.find('input');
    this.$inputs.eq(0).keydown(function (e) {
      if ($(this).data('need-reset')) {
        $(this).val("");
      }
      $(this).data('need-reset', false);
      // that.$inputs.eq(1).show();
      let key = H5PEditor.findField('shortcutMode', that.parent).value === 'content' ? e.key : e.code;
      let keyText = C.getKeyText(key);
      if ($(this).val()) {
        if ($(this).val().split('+').indexOf(key) == -1) { // ignore automatic repeat keydown
          $(this).val($(this).val() + '+' + key);
          that.$inputs.eq(1).val(that.$inputs.eq(1).val() + '+' + keyText);
        }
      }
      else {
        $(this).val(key);
        that.$inputs.eq(1).val(keyText);
      }
      C.saveChange(that);
      e.preventDefault();
    }).focus(function () {
      $(this).data('need-reset', true);
      // $(this).data('watch-blur', true);
    }).blur(function () {
      if (!document.hasFocus()) {
        $(this).val($(this).val() + '+blur');
        that.$inputs.eq(1).val(that.$inputs.eq(1).val() + '+?');
        C.saveChange(that);
      }
    });
    this.$inputs.eq(1).blur(function () {
      let countKeys = that.$inputs.eq(0).val().split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
      let countKeysText = $(this).val().split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
      if (countKeys != countKeysText) {
        $(this).val(that.$inputs.eq(0).val());
      }
      C.saveChange(that);
    }); // .hide();
    /* // Does not work, input get blur before windows 
    $(window).blur(function(){
       if(this.$inputs.eq(0).data('watch-blur')) {
         $(this).val($(this).val() + '+' + key);
         that.$inputs.eq(1).val(that.$inputs.eq(1).val() + '+' + keyText);
       }
     });
     */

    this.$errors = this.$item.children('.h5p-errors');

  };

  /**
   * Creates HTML for the widget.
   */
  C.prototype.createHtml = function () {
    const id = H5PEditor.getNextFieldId(this.field);
    const descriptionId = (this.field.description !== undefined ? H5PEditor.getDescriptionId(id) : undefined);
    var shortcutInput = H5PEditor.createText(this.params !== undefined ? this.params.keys : undefined, undefined, C.t('clickToSet'), id, descriptionId);
    var shortcutTextInput = H5PEditor.createText(this.params !== undefined ? this.params.keysText : undefined, undefined, C.t('alternativeText'), undefined, descriptionId);
    var input = shortcutInput + shortcutTextInput;
    return H5PEditor.createFieldMarkup(this.field, input, id);
  };

  C.saveChange = function (that) {
    that.params = {
      'keys': that.$inputs.eq(0).val(),
      'keysText': that.$inputs.eq(1).val()
    };
    that.setValue(that.field, that.params);
  };

  /**
   * Validate the current values.
   */
  C.prototype.validate = function () {
    if (this.params === undefined || this.params.keys === undefined || this.params.keysText === undefined) {
      this.$errors.append(H5PEditor.createError(C.t("error:mustBeFilled")));
    }
    //let countKeys = (this.params.keys.match(/[^+]\+[^+]/g) || []).length + (this.params.keys.match(/\+\+\+/g) || []).length;
    let countKeys = this.params.keys.split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
    let countKeysText = this.params.keysText.split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
    if (countKeys !== countKeysText) {
      this.$errors.append(H5PEditor.createError(C.t("error:invalidShortcut")));
    }
    return H5PEditor.checkErrors(this.$errors, this.$inputs, true);
  };

  /**
   * Remove this item.
   */
  C.prototype.remove = function () {
    this.$item.remove();
  };

  C.getKeyText = function (key) {
    let keyTranslation = {
      'Control': 'Ctrl'
    };

    // eslint-disable-next-line no-prototype-builtins
    if (keyTranslation.hasOwnProperty(key)) {
      return keyTranslation[key];
    }

    if ((/^[a-z]$/).test(key)) {
      return key.toUpperCase();
    }

    return key;

  };

  /**
   * Local translate function.
   *
   * @param {Atring} key
   * @param {Object} params
   * @returns {@exp;H5PEditor@call;t}
   */
  C.t = function (key, params) {
    return H5PEditor.t('H5PEditor.ShortcutSelector', key, params);
  };


  return C;
})(H5P.jQuery);