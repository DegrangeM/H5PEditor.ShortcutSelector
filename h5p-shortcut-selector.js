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
      // The input will reset when we focus the input, but only after the user start pressing a first key
      // This allow the user to focus the field then do nothing and focus out without resetting the field
      // This is usefull as the user can focus the field by clicking on the label, pressing tab, etc.
      if ($(this).data('need-reset')) {
        $(this).val("");
      }
      $(this).data('need-reset', false);
      
      let key = H5PEditor.findField('shortcutMode', that.parent).value === 'content' ? e.key : e.code;
      let keyText = C.getKeyText(key);

      // Update the shortcut input with the new key
      if ($(this).val()) {
        // This is not the first key of the shortcut, add it to the list
        if ($(this).val().split('+').indexOf(key) == -1) { // ignore automatic repeat keydown
          $(this).val($(this).val() + '+' + key);
          that.$inputs.eq(1).val(that.$inputs.eq(1).val() + '+' + keyText);
        }
      }
      else {
        // This is the first key of the shortcut
        $(this).val(key);
        that.$inputs.eq(1).val(keyText);
      }

      C.saveChange(that);
      e.preventDefault();
    }).focus(function () {
      $(this).data('need-reset', true);
    }).blur(function () {
      // Some shortcut like Alt + Tab can't be detected as they focus out the windows, we can however detect this blur to try to detect the shortcut
      // The user focus out the input, we need to know if this is just the input or the whole window
      if (!document.hasFocus()) {
        // The whole windows have been unfocused
        $(this).val($(this).val() + '+blur');
        that.$inputs.eq(1).val(that.$inputs.eq(1).val() + '+?');
        C.saveChange(that);
      }
    });
    this.$inputs.eq(1).blur(function () {
      // The user leaved the alternate text input, we need to check if it's content is correct (i.e. have the good + amount)

      // Split shortcut key, case where the key + is part of the shortuct (Ctrl++ or Ctrl+++a) need to be handled
      // Split work with regex, if there are matching parenthesis, they are included,
      // however it will need to be cleaned from undefined and empty string that might appear
      let countKeys = that.$inputs.eq(0).val().split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
      let countKeysText = $(this).val().split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
      if (countKeys != countKeysText) {
        $(this).val(that.$inputs.eq(0).val());
      }
      C.saveChange(that);
    });

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

  /**
   * Save changes
   */
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
    // Check if all fields have been filled
    if (this.params === undefined || this.params.keys === undefined || this.params.keysText === undefined) {
      this.$errors.append(H5PEditor.createError(C.t('error:mustBeFilled')));
    }

    // Check if alternate text content is correct (i.e. have the good + amount)

    // Split shortcut key, case where the key + is part of the shortuct (Ctrl++ or Ctrl+++a) need to be handled
    // Split work with regex, if there are matching parenthesis, they are included,
    // however it will need to be cleaned from undefined and empty string that might appear
    let countKeys = this.params.keys.split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
    let countKeysText = this.params.keysText.split(/(?:(?:^|\+)(\+)(?:\+|$))|\+/).filter(x => x !== undefined && x != '').length;
    if (countKeys !== countKeysText) {
      this.$errors.append(H5PEditor.createError(C.t('error:invalidShortcut')));
    }
    return H5PEditor.checkErrors(this.$errors, this.$inputs, true);
  };

  /**
   * Remove this item.
   */
  C.prototype.remove = function () {
    this.$item.remove();
  };

  /**
   * Automatically translate some of the key code to a more readable content
   * For exemple
   *   Control key will be shown as Ctrl
   *   Letter key will be shown as uppercase (i.e. "a" will be shown as "A")
   */
  C.getKeyText = function (key) {
    let keyTranslation = {
      'Control': 'Ctrl'
    };

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