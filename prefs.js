import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

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
      spacing: 16,
    });

    // Add slider for clock size
    box.append(
      this.buildClockSizeSlider(
        settings,
        'clock-size',
        [200, 660, 10, 10],
        _('Clock size')
      )
    );

    // Add slider for clock margin
    box.append(
      this.buildClockMarginSlider(
        settings,
        'clock-margin',
        [5, 255, 5, 5],
        _('Clock margin')
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
}
