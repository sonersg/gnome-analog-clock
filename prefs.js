import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';

import {
  ExtensionPreferences,
  gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class AnalogClockPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
      title: _(''),
      description: _(''),
    });
    group.add(this.buildPrefsWidget());
    page.add(group);
    window.add(page);
  }

  buildPrefsWidget() {
    let settings = this.getSettings();
    let box = new Gtk.Box({
      halign: Gtk.Align.CENTER,
      orientation: Gtk.Orientation.VERTICAL,
      'margin-top': 20,
      'margin-bottom': 20,
      'margin-start': 20,
      'margin-end': 20,
      spacing: 22,
    });

    // Add slider for clock size
    box.append(
      this.buildClockSizeSlider(
        settings,
        'clock-size',
        [200, 660, 10, 10],
        _('Clock size:')
      )
    );

    // Add slider for clock margin
    box.append(
      this.buildClockMarginSlider(
        settings,
        'clock-margin',
        [0, 255, 5, 5],
        _('Clock margin:')
      )
    );

    // Add dropdown for clock position
    box.append(
      this.buildPositionRow(settings, 'clock-position', _('Clock position:'))
    );

    // Add color picker for clock ticks
    box.append(
      this.buildTicksColorRow(
        settings,
        'clock-ticks-color',
        _('Clock ticks color:')
      )
    );

    // Add color picker for hour and minute hands
    box.append(
      this.buildHourMinuteColorRow(
        settings,
        'hour-minute-color',
        _('Hour, minute hands color:')
      )
    );

    // Add color picker for second hand
    box.append(
      this.buildSecondColorRow(
        settings,
        'second-color',
        _('Second hand color:')
      )
    );

    return box;
  }

  buildClockSizeSlider(settings, key, values, labeltext) {
    let [lower, upper, step, page] = values;
    let vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 10,
    });

    let hbox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 10,
    });

    let label = new Gtk.Label({
      label: labeltext,
      halign: Gtk.Align.START,
      hexpand: true,
      wrap: true,
      xalign: 0,
    });

    // Get initial value from schema
    let initialValue = settings.get_int(key);

    let valueLabel = new Gtk.Label({
      label: `${initialValue}px`,
      halign: Gtk.Align.END,
      width_chars: 5,
    });

    hbox.append(label);
    hbox.append(valueLabel);

    let adjustment = new Gtk.Adjustment({
      lower: lower,
      upper: upper,
      step_increment: step,
      page_increment: page,
      value: initialValue,
    });

    let scale = new Gtk.Scale({
      orientation: Gtk.Orientation.HORIZONTAL,
      adjustment: adjustment,
      digits: 0,
      hexpand: true,
      draw_value: false,
    });

    // Add tooltip for accessibility
    scale.set_tooltip_text(_('Adjust the clock size'));

    // Update settings when scale changes
    scale.connect('value-changed', () => {
      let value = Math.round(scale.get_value());
      settings.set_int(key, value);
      valueLabel.set_text(`${value}px`);
    });

    // Update scale when settings change externally
    settings.connect(`changed::${key}`, () => {
      let value = settings.get_int(key);
      scale.set_value(value);
      valueLabel.set_text(`${value}px`);
    });

    vbox.append(hbox);
    vbox.append(scale);

    return vbox;
  }

  //////////////////////////////////////////////////
  // buildClockMarginSlider function
  //////////////////////////////////////////////////
  buildClockMarginSlider(settings, key, values, labeltext) {
    let [lower, upper, step, page] = values;
    let vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 10,
    });

    let hbox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 10,
    });

    let label = new Gtk.Label({
      label: labeltext,
      halign: Gtk.Align.START,
      hexpand: true,
      wrap: true,
      xalign: 0,
    });

    // Get initial value from schema
    let initialValue = settings.get_int(key);

    let valueLabel = new Gtk.Label({
      label: `${initialValue}px`,
      halign: Gtk.Align.END,
      width_chars: 5,
    });

    hbox.append(label);
    hbox.append(valueLabel);

    let adjustment = new Gtk.Adjustment({
      lower: lower,
      upper: upper,
      step_increment: step,
      page_increment: page,
      value: initialValue,
    });

    let scale = new Gtk.Scale({
      orientation: Gtk.Orientation.HORIZONTAL,
      adjustment: adjustment,
      digits: 0,
      hexpand: true,
      draw_value: false,
    });

    // Add tooltip for accessibility
    scale.set_tooltip_text(_('Adjust the clock margin'));

    // Update settings when scale changes
    scale.connect('value-changed', () => {
      let value = Math.round(scale.get_value());
      settings.set_int(key, value);
      valueLabel.set_text(`${value}px`);
    });

    // Update scale when settings change externally
    settings.connect(`changed::${key}`, () => {
      let value = settings.get_int(key);
      scale.set_value(value);
      valueLabel.set_text(`${value}px`);
    });

    vbox.append(hbox);
    vbox.append(scale);

    return vbox;
  }

  //////////////////////////////////////////////////
  // buildTicksColorRow function
  //////////////////////////////////////////////////
  buildTicksColorRow(settings, key, labeltext) {
    const row = new Adw.ActionRow({ title: labeltext });

    const colorButton = new Gtk.ColorButton();
    let rgba = new Gdk.RGBA();
    rgba.parse(settings.get_string(key));
    colorButton.set_rgba(rgba);
    colorButton.set_use_alpha(true);

    colorButton.connect('color-set', () => {
      const rgba = colorButton.get_rgba();
      const color = rgba.to_string(); // returns e.g. "rgba(255,255,255,1)"
      // Convert to hex if you prefer (optional helper below)
      // settings.set_string(key, this.rgbaToHex(rgba));
      settings.set_string(key, color);
    });

    settings.connect(`changed::${key}`, () => {
      rgba.parse(settings.get_string(key));
      colorButton.set_rgba(rgba);
    });

    row.add_suffix(colorButton);
    row.activatable_widget = colorButton;

    return row;
  }

  //////////////////////////////////////////////////
  // buildHourMinuteColorRow function
  //////////////////////////////////////////////////
  buildHourMinuteColorRow(settings, key, labeltext) {
    const row = new Adw.ActionRow({ title: labeltext });

    const colorButton = new Gtk.ColorButton();
    let rgba = new Gdk.RGBA();
    rgba.parse(settings.get_string(key));
    colorButton.set_rgba(rgba);
    colorButton.set_use_alpha(true);

    colorButton.connect('color-set', () => {
      const rgba = colorButton.get_rgba();
      const color = rgba.to_string(); // returns e.g. "rgba(255,255,255,1)"
      // Convert to hex if you prefer (optional helper below)
      // settings.set_string(key, this.rgbaToHex(rgba));
      settings.set_string(key, color);
    });

    settings.connect(`changed::${key}`, () => {
      rgba.parse(settings.get_string(key));
      colorButton.set_rgba(rgba);
    });

    row.add_suffix(colorButton);
    row.activatable_widget = colorButton;

    return row;
  }

  //////////////////////////////////////////////////
  // buildSecondColorRow function
  //////////////////////////////////////////////////
  buildSecondColorRow(settings, key, labeltext) {
    const row = new Adw.ActionRow({ title: labeltext });

    const colorButton = new Gtk.ColorButton();
    let rgba = new Gdk.RGBA();
    rgba.parse(settings.get_string(key));
    colorButton.set_rgba(rgba);
    colorButton.set_use_alpha(true);

    colorButton.connect('color-set', () => {
      const rgba = colorButton.get_rgba();
      const color = rgba.to_string(); // returns e.g. "rgba(255,255,255,1)"
      // Convert to hex if you prefer (optional helper below)
      // settings.set_string(key, this.rgbaToHex(rgba));
      settings.set_string(key, color);
    });

    settings.connect(`changed::${key}`, () => {
      rgba.parse(settings.get_string(key));
      colorButton.set_rgba(rgba);
    });

    row.add_suffix(colorButton);
    row.activatable_widget = colorButton;

    return row;
  }

  //////////////////////////////////////////////////
  // buildPositionRow function
  //////////////////////////////////////////////////
  buildPositionRow(settings, key, labeltext) {
    // Create string list manually (compatible with older GJS)
    const stringList = new Gtk.StringList();
    const displayLabels = [
      _('Top Left'),
      _('Top Center'),
      _('Top Right'),
      _('Center Left'),
      _('Center'),
      _('Center Right'),
      _('Bottom Left'),
      _('Bottom Center'),
      _('Bottom Right'),
    ];
    const positionValues = [
      'top-left',
      'top-center',
      'top-right',
      'center-left',
      'center',
      'center-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];

    displayLabels.forEach(label => stringList.append(label));

    const row = new Adw.ComboRow({
      title: labeltext,
      model: stringList,
    });

    // Sync setting → UI
    const updateUI = () => {
      const value = settings.get_string(key);
      const index = positionValues.indexOf(value);
      if (index !== -1) {
        row.selected = index;
      }
    };
    updateUI();

    // Sync UI → setting
    row.connect('notify::selected', () => {
      const idx = row.selected;
      if (idx >= 0 && idx < positionValues.length) {
        settings.set_string(key, positionValues[idx]);
      }
    });

    // Handle external changes
    settings.connect(`changed::${key}`, updateUI);

    return row;
  }

  // rgbaToHex(rgba) {
  //   const r = Math.round(rgba.red * 255);
  //   const g = Math.round(rgba.green * 255);
  //   const b = Math.round(rgba.blue * 255);
  //   return `#${r.toString(16).padStart(2, '0')}${g
  //     .toString(16)
  //     .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  // }
}
