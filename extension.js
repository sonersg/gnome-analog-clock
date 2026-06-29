import St from 'gi://St';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import GLib from 'gi://GLib'; // ← Add this import to update time

export default class AnalogClockExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._onSettingsChanged = this._onSettingsChanged.bind(this);
    this._posIndex = this._settings.get_int('clock-position') ?? 2;
    this._hideTicks = this._settings.get_boolean('hide-ticks');

    // Calculate positions once
    const positions = this._calculatePositions();
    const pos = positions[this._posIndex];

    // Get clock size in pixels from settings and make sure it is integer
    const clockSize = Math.round(this._settings.get_int('clock-size'));

    this._desktopIcon = new St.DrawingArea({
      x: pos.x,
      y: pos.y,
      width: clockSize,
      height: clockSize,
      reactive: false,
    });

    this._settingsChangedId = this._settings.connect(
      'changed',
      this._onSettingsChanged
    );

    this._desktopIcon.connect('repaint', this._onRepaint.bind(this));

    Main.layoutManager._backgroundGroup.add_child(this._desktopIcon);

    // Schedule repaint every 1000 ms (1 second)
    this._updateTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
      this._desktopIcon.queue_repaint();
      return GLib.SOURCE_CONTINUE; // keep the timeout running
    });
  }

  disable() {
    // Cancel all timeouts
    this._clearTimeouts();

    if (this._desktopIcon) {
      Main.layoutManager._backgroundGroup.remove_child(this._desktopIcon);
      this._desktopIcon.destroy();
      this._desktopIcon = null;
    }

    if (this._settingsChangedId) {
      this._settings.disconnect(this._settingsChangedId);
      this._settingsChangedId = null;
    }

    this._settings = null;
  }

  /////////////////////////////////////////////////////////////////////////
  // Helper method to clear all timeouts
  /////////////////////////////////////////////////////////////////////////
  _clearTimeouts() {
    if (this._repaintTimeoutId) {
      GLib.source_remove(this._repaintTimeoutId);
      this._repaintTimeoutId = null;
    }
    // In case there's any other timeout that might have been set
    if (this._settingsChangeTimeoutId) {
      GLib.source_remove(this._settingsChangeTimeoutId);
      this._settingsChangeTimeoutId = null;
    }
  }

  /////////////////////////////////////////////////////////////////////////
  // _onSettingsChanged function
  /////////////////////////////////////////////////////////////////////////
  _onSettingsChanged() {
    if (!this._desktopIcon) return;

    // Update settings
    this._posIndex = this._settings.get_int('clock-position') ?? 2;
    this._hideTicks = this._settings.get_boolean('hide-ticks');

    const clockSize = Math.round(this._settings.get_int('clock-size'));

    // Update position and size
    this._updateClockPosition();
    this._desktopIcon.set_size(clockSize, clockSize);

    // Request redraw to reflect new size/appearance
    this._desktopIcon.queue_repaint();

    // Clear existing timeouts
    this._clearTimeouts();

    // Schedule repaint with appropriate interval
    const interval = this._settings.get_boolean('hide-ticks') ? 60000 : 1000;
    this._repaintTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
      this._desktopIcon.queue_repaint();
      return GLib.SOURCE_CONTINUE; // keep the timeout running
    });
  }

  /////////////////////////////////////////////////////////////////////////
  // _parseRGBA function
  /////////////////////////////////////////////////////////////////////////
  _parseRGBA(colorStr) {
    // Match rgba(r, g, b, a)
    let match = colorStr.match(
      /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/
    );
    if (match) {
      // log(`[AnalogClock] match rgba "${colorStr}"`);
      // journalctl --user -f -o cat | grep -i 'AnalogClock\|gnome-shell'
      return {
        r: parseInt(match[1]) / 255,
        g: parseInt(match[2]) / 255,
        b: parseInt(match[3]) / 255,
        a: parseFloat(match[4]),
      };
    }

    // Match rgb(r, g, b)
    match = colorStr.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match) {
      // log(`[AnalogClock] match rgb "${colorStr}"`);
      return {
        r: parseInt(match[1]) / 255,
        g: parseInt(match[2]) / 255,
        b: parseInt(match[3]) / 255,
        a: 1.0,
      };
    }

    return { r: 0, g: 0, b: 1, a: 1 }; // blue fallback
  }

  /////////////////////////////////////////////////////////////////////////
  // _calculatePositions function
  /////////////////////////////////////////////////////////////////////////
  _calculatePositions() {
    const monitorWidth = Main.layoutManager.primaryMonitor.width;
    const monitorHeight = Main.layoutManager.primaryMonitor.height;

    // Get current settings for size and margin
    const clockSize = Math.round(this._settings.get_int('clock-size'));
    const clockMargin = Math.round(this._settings.get_int('clock-margin'));

    return [
      { x: clockMargin, y: clockMargin }, // Top left
      { x: (monitorWidth - clockSize) / 2, y: clockMargin }, // Top center
      { x: monitorWidth - clockSize - clockMargin, y: clockMargin }, // Top right
      // Center positions
      { x: clockMargin, y: (monitorHeight - clockSize) / 2 }, // Middle left
      { x: (monitorWidth - clockSize) / 2, y: (monitorHeight - clockSize) / 2 }, // Middle center
      {
        x: monitorWidth - clockSize - clockMargin,
        y: (monitorHeight - clockSize) / 2,
      }, // Middle right
      // Bottom positions
      { x: clockMargin, y: monitorHeight - clockSize - clockMargin }, // Bottom left
      {
        x: (monitorWidth - clockSize) / 2,
        y: monitorHeight - clockSize - clockMargin,
      }, // Bottom center
      {
        x: monitorWidth - clockSize - clockMargin,
        y: monitorHeight - clockSize - clockMargin,
      }, // Bottom right
    ];
  }

  /////////////////////////////////////////////////////////////////////////
  // _updateClockPosition function
  /////////////////////////////////////////////////////////////////////////
  _updateClockPosition() {
    if (!this._desktopIcon) return;

    const positions = this._calculatePositions();
    const pos = positions[this._posIndex];

    // Update position
    this._desktopIcon.set_position(Math.round(pos.x), Math.round(pos.y));
  }

  /////////////////////////////////////////////////////////////////////////
  // _onRepaint function
  /////////////////////////////////////////////////////////////////////////
  _onRepaint(area) {
    const cr = area.get_context();
    const [width, height] = area.get_surface_size();
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 2 - 10; // leave some margin

    const majorTickLength = Math.floor(baseRadius * 0.3); // longer for 12, 3, 6, 9
    const minorTickLength = Math.floor(baseRadius * 0.1); // shorter for other hours
    const majorTickWidth = Math.floor(baseRadius * 0.1); // thicker
    const minorTickWidth = Math.floor(baseRadius * 0.05); // thinner

    if (!this._hideTicks) {
      const colorStrTicks = this._settings.get_string('clock-ticks-color');
      const pT = this._parseRGBA(colorStrTicks);
      // Set clock ticks color
      cr.setSourceRGBA(pT.r, pT.g, pT.b, pT.a);

      for (let i = 0; i < 12; i++) {
        const isMajor = i % 3 === 0; // 0, 3, 6, 9 → every 3rd hour
        const tickLength = isMajor ? majorTickLength : minorTickLength;
        const lineWidth = isMajor ? majorTickWidth : minorTickWidth;

        // Start angle at 12 o’clock (which is -π/2), then go clockwise
        const angle = (i * Math.PI) / 6 - Math.PI / 2;

        const outerX = centerX + baseRadius * Math.cos(angle);
        const outerY = centerY + baseRadius * Math.sin(angle);
        const innerX = centerX + (baseRadius - tickLength) * Math.cos(angle);
        const innerY = centerY + (baseRadius - tickLength) * Math.sin(angle);

        cr.setLineWidth(lineWidth);
        cr.moveTo(innerX, innerY);
        cr.lineTo(outerX, outerY);
        cr.stroke(); // stroke immediately so line width applies per tick
      }
    }

    // Draw clock hands
    const hourHandLength = baseRadius - majorTickLength;
    const minuteHandLength = baseRadius;
    const secondHandLength = baseRadius;

    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Get rgba color from settings, e.g. "rgba(255, 100, 50, 1)"
    const colorStrHourMinute = this._settings.get_string('hour-minute-color');
    // Parse rgba
    const pHM = this._parseRGBA(colorStrHourMinute);

    // Hour hand
    const hourAngle = (hours + minutes / 60) * (Math.PI / 6) - Math.PI / 2;
    cr.moveTo(centerX, centerY);
    cr.lineTo(
      centerX + hourHandLength * Math.cos(hourAngle),
      centerY + hourHandLength * Math.sin(hourAngle)
    );
    cr.setLineWidth(majorTickWidth);
    cr.setSourceRGBA(pHM.r, pHM.g, pHM.b, pHM.a);
    cr.stroke();

    // Minute hand
    const minAngle = (minutes + seconds / 60) * (Math.PI / 30) - Math.PI / 2;
    cr.moveTo(centerX, centerY);
    cr.lineTo(
      centerX + minuteHandLength * Math.cos(minAngle),
      centerY + minuteHandLength * Math.sin(minAngle)
    );
    cr.setLineWidth(minorTickWidth);
    cr.setSourceRGBA(pHM.r, pHM.g, pHM.b, pHM.a);
    cr.stroke();

    if (!this._hideTicks) {
      // Second hand
      const colorStrSecond = this._settings.get_string('second-color');
      const pS = this._parseRGBA(colorStrSecond);
      const colorStrTicks = this._settings.get_string('clock-ticks-color');
      const pT = this._parseRGBA(colorStrTicks);

      const secAngle = seconds * (Math.PI / 30) - Math.PI / 2;

      cr.moveTo(centerX, centerY);
      cr.lineTo(
        centerX + secondHandLength * Math.cos(secAngle),
        centerY + secondHandLength * Math.sin(secAngle)
      );
      cr.setLineWidth(minorTickWidth * 0.9);
      cr.setSourceRGBA(pS.r, pS.g, pS.b, pS.a);
      cr.stroke();

      // Center dot
      // cr.arc(x, y, radius, angle1, angle2)
      cr.arc(centerX, centerY, minorTickWidth, 0, 2 * Math.PI);
      cr.setSourceRGBA(pT.r, pT.g, pT.b, pT.a);
      cr.fill();
    }

    cr.$dispose();
  }
}
