import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';

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
    window.set_default_size(500, 700);
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
        [5, 255, 5, 5],
        _('Clock margin:')
      )
    );

    // Add dropdown for clock position
    box.append(
      this.buildClockPositionRow(
        settings,
        'clock-position',
        _('Clock position:')
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

    // Add toggle for hiding clock ticks
    box.append(
      this.buildToggle(
        settings,
        'hide-ticks',
        _('Show only hour and minute hands:')
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

    // Add color picker for clock ticks
    box.append(
      this.buildTicksColorRow(
        settings,
        'clock-ticks-color',
        _('Clock ticks color:')
      )
    );

    return box;
  }

  //////////////////////////////////////////////////
  // buildClockSizeSlider function
  //////////////////////////////////////////////////
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
  // buildClockPositionRow function, EXPECTS STRING KEY, NOT INTEGER
  //////////////////////////////////////////////////
  // buildClockPositionRow(settings, key, labeltext) {
  //   // Create a container box to hold everything
  //   const container = new Gtk.Box({
  //     orientation: Gtk.Orientation.HORIZONTAL,
  //     spacing: 10,
  //   });

  //   // Create label
  //   const label = new Gtk.Label({
  //     label: labeltext,
  //     halign: Gtk.Align.START,
  //     xalign: 0,
  //     wrap: true,
  //   });
  //   container.append(label);

  //   // Create the StringList model with your options
  //   const model = new Gtk.StringList();
  //   const options = [
  //     'Top left',
  //     'Top center',
  //     'Top right',
  //     'Middle left',
  //     'Middle center',
  //     'Middle right',
  //   ];

  //   options.forEach(option => model.append(option));

  //   // Create the dropdown (Gtk.DropDown instead of Adw.ComboRow)
  //   const dropdown = new Gtk.DropDown({
  //     model: model,
  //     hexpand: true,
  //   });

  //   // Create mapping between string values and indices
  //   const strToIndex = {};
  //   const indexToString = {};

  //   options.forEach((option, index) => {
  //     strToIndex[option] = index;
  //     indexToString[index] = option;
  //   });

  //   // Set initial selection from saved settings
  //   const currentPosition = settings.get_string(key);
  //   if (currentPosition in strToIndex) {
  //     dropdown.selected = strToIndex[currentPosition];
  //   }

  //   // Save to settings when user changes selection
  //   dropdown.connect('notify::selected', () => {
  //     const selectedIndex = dropdown.selected;
  //     const selectedPosition = indexToString[selectedIndex];
  //     settings.set_string(key, selectedPosition);
  //   });

  //   // Update dropdown when settings change externally
  //   settings.connect(`changed::${key}`, () => {
  //     const newPosition = settings.get_string(key);
  //     if (newPosition in strToIndex) {
  //       dropdown.selected = strToIndex[newPosition];
  //     }
  //   });

  //   container.append(dropdown);
  //   return container;
  // }

  //////////////////////////////////////////////////
  // buildClockPositionRow function - USING Adw.ComboRow
  //////////////////////////////////////////////////
  buildClockPositionRow(settings, key, labeltext) {
    // Create a PreferencesGroup for the dropdown
    const group = new Adw.PreferencesGroup();

    // Create the StringList model with your options
    const model = new Gtk.StringList();
    const options = [
      'Top left',
      'Top center',
      'Top right',
      'Middle left',
      'Middle center',
      'Middle right',
      'Bottom left',
      'Bottom center',
      'Bottom right',
    ];

    options.forEach(option => model.append(option));

    // Create the ComboRow
    const comboRow = new Adw.ComboRow({
      title: labeltext,
      model: model,
    });

    // Create mapping between string values and indices
    const indexToString = {};

    options.forEach((option, index) => (indexToString[index] = option));

    // log(`[AnalogClock] \nstrToIndex: "${strToIndex}"`);
    // journalctl --user -f -o cat | grep -i 'AnalogClock\|gnome-shell'

    // Set initial selection from saved settings
    const currentPosition = settings.get_int(key);
    if (currentPosition in indexToString) {
      comboRow.selected = currentPosition;
    }

    // Save to settings when user changes selection
    comboRow.connect('notify::selected', () => {
      const selectedIndex = comboRow.selected;
      settings.set_int(key, selectedIndex);
    });

    // Update dropdown when settings change externally
    settings.connect(`changed::${key}`, () => {
      const newPositionIndex = settings.get_int(key);
      if (newPositionIndex in indexToString) {
        comboRow.selected = newPositionIndex;
      }
    });

    group.add(comboRow);

    return group;
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
  // buildToggle function
  //////////////////////////////////////////////////
  buildToggle(settings, key, labeltext) {
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

    let toggle = new Gtk.Switch({
      halign: Gtk.Align.END,
      valign: Gtk.Align.CENTER,
    });

    // Add tooltip for accessibility
    toggle.set_tooltip_text(
      _(
        'Toggle whether to apply transparency to all windows or just inactive ones'
      )
    );

    settings.bind(key, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);

    hbox.append(label);
    hbox.append(toggle);

    return hbox;
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

  // rgbaToHex(rgba) {
  //   const r = Math.round(rgba.red * 255);
  //   const g = Math.round(rgba.green * 255);
  //   const b = Math.round(rgba.blue * 255);
  //   return `#${r.toString(16).padStart(2, '0')}${g
  //     .toString(16)
  //     .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  // }
}
