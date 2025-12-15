// import St from 'gi://St';
// import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
// import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// export default class ExampleExtension extends Extension {
//   enable() {
//     // Create a simple icon actor
//     this._desktopIcon = new St.Icon({
//       icon_name: 'face-laugh-symbolic',
//       style_class: 'system-status-icon',
//       icon_size: 222,
//       x: 100, // position from left
//       y: 100, // position from top
//       reactive: true, // optional: allow interaction
//     });

//     // Add it above the desktop background but below windows
//     Main.layoutManager._backgroundGroup.add_child(this._desktopIcon);
//   }

//   disable() {
//     if (this._desktopIcon) {
//       Main.layoutManager._backgroundGroup.remove_child(this._desktopIcon);
//       this._desktopIcon.destroy();
//       this._desktopIcon = null;
//     }
//   }
// }

import St from 'gi://St';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import GLib from 'gi://GLib'; // ← Add this import to update time

export default class AnalogClockExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._onSettingsChanged = this._onSettingsChanged.bind(this);

    const monitorWidth = Main.layoutManager.primaryMonitor.width;
    const monitorHeight = Main.layoutManager.primaryMonitor.height;

    // Get clock size in pixels from settings and make sure it is integer
    const clockSize = Math.round(this._settings.get_int('clock-size'));

    // Get clock margin in pixels from settings and make sure it is integer
    const clockMargin = Math.round(this._settings.get_int('clock-margin'));

    const positions = [
      { x: clockMargin, y: clockMargin }, // Top-left
      { x: (monitorWidth - clockSize) / 2, y: clockMargin }, // Top-center
      { x: monitorWidth - clockSize - clockMargin, y: clockMargin }, // Top-right
      // Center positions
      { x: clockMargin, y: (monitorHeight - clockSize) / 2 }, // Center-left
      { x: (monitorWidth - clockSize) / 2, y: (monitorHeight - clockSize) / 2 }, // Center
      {
        x: monitorWidth - clockSize - clockMargin,
        y: (monitorHeight - clockSize) / 2,
      }, // Center-right
      // Bottom positions
      { x: clockMargin, y: monitorHeight - clockSize - clockMargin }, // Bottom-left
      {
        x: (monitorWidth - clockSize) / 2,
        y: monitorHeight - clockSize - clockMargin,
      }, // Bottom-center
      {
        x: monitorWidth - clockSize - clockMargin,
        y: monitorHeight - clockSize - clockMargin,
      }, // Bottom-right
    ];

    this._desktopIcon = new St.DrawingArea({
      x: positions[2].x,
      y: positions[2].y,
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
    // Cancel the timeout!
    if (this._updateTimeout) {
      GLib.source_remove(this._updateTimeout);
      this._updateTimeout = null;
    }

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
  // _onSettingsChanged function
  /////////////////////////////////////////////////////////////////////////
  _onSettingsChanged() {
    if (!this._desktopIcon) return;

    const monitorWidth = Main.layoutManager.primaryMonitor.width;
    const monitorHeight = Main.layoutManager.primaryMonitor.height;
    const clockSize = Math.round(this._settings.get_int('clock-size'));
    const clockMargin = Math.round(this._settings.get_int('clock-margin'));

    // Determine position index (e.g., always use top-right = index 2)
    const posIndex = 2; // or read from a setting if dynamic

    const positions = [
      { x: clockMargin, y: clockMargin },
      { x: (monitorWidth - clockSize) / 2, y: clockMargin },
      { x: monitorWidth - clockSize - clockMargin, y: clockMargin },
      { x: clockMargin, y: (monitorHeight - clockSize) / 2 },
      { x: (monitorWidth - clockSize) / 2, y: (monitorHeight - clockSize) / 2 },
      {
        x: monitorWidth - clockSize - clockMargin,
        y: (monitorHeight - clockSize) / 2,
      },
      { x: clockMargin, y: monitorHeight - clockSize - clockMargin },
      {
        x: (monitorWidth - clockSize) / 2,
        y: monitorHeight - clockSize - clockMargin,
      },
      {
        x: monitorWidth - clockSize - clockMargin,
        y: monitorHeight - clockSize - clockMargin,
      },
    ];

    const pos = positions[posIndex];

    // Update position and size
    this._desktopIcon.set_position(Math.round(pos.x), Math.round(pos.y));
    this._desktopIcon.set_size(clockSize, clockSize);

    // Request redraw to reflect new size/appearance
    this._desktopIcon.queue_repaint();
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

    // Define styling
    // const majorTickLength = 20; // longer for 12, 3, 6, 9
    // const minorTickLength = 10; // shorter for other hours
    // const majorTickWidth = 8; // thicker
    // const minorTickWidth = 4; // thinner
    const majorTickLength = Math.floor(baseRadius * 0.2); // longer for 12, 3, 6, 9
    const minorTickLength = Math.floor(baseRadius * 0.1); // shorter for other hours
    const majorTickWidth = Math.floor(baseRadius * 0.1); // thicker
    const minorTickWidth = Math.floor(baseRadius * 0.05); // thinner

    // Optional: set color (e.g., white)
    cr.setSourceRGBA(224 / 255, 94 / 255, 50 / 255, 1);
    // cr.setSourceRGBA(0, 0, 0, 0.5);

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

    // Draw clock hands
    const hourHandLength = baseRadius - majorTickLength;
    const minuteHandLength = baseRadius;
    const secondHandLength = baseRadius;

    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Hour hand
    const hourAngle = (hours + minutes / 60) * (Math.PI / 6) - Math.PI / 2;
    cr.moveTo(centerX, centerY);
    cr.lineTo(
      centerX + hourHandLength * Math.cos(hourAngle),
      centerY + hourHandLength * Math.sin(hourAngle)
    );
    cr.setLineWidth(majorTickWidth);
    cr.setSourceRGBA(1, 1, 1, 1);
    cr.stroke();

    // Minute hand
    const minAngle = (minutes + seconds / 60) * (Math.PI / 30) - Math.PI / 2;
    const minuteHandwidth = Math.floor((majorTickWidth + minorTickWidth) / 2);
    cr.moveTo(centerX, centerY);
    cr.lineTo(
      centerX + minuteHandLength * Math.cos(minAngle),
      centerY + minuteHandLength * Math.sin(minAngle)
    );
    cr.setLineWidth(minuteHandwidth);
    cr.setSourceRGBA(1, 1, 1, 1);
    cr.stroke();

    // Second hand
    const secAngle = seconds * (Math.PI / 30) - Math.PI / 2;
    cr.moveTo(centerX, centerY);
    cr.lineTo(
      centerX + secondHandLength * Math.cos(secAngle),
      centerY + secondHandLength * Math.sin(secAngle)
    );
    cr.setLineWidth(minorTickWidth);
    cr.setSourceRGBA(1, 0, 0, 0.7);
    cr.stroke();

    // Center dot
    // cr.arc(x, y, radius, angle1, angle2)
    cr.arc(centerX, centerY, minuteHandwidth, 0, 2 * Math.PI);
    cr.setSourceRGBA(0, 0, 0, 0.7);
    cr.fill();

    cr.$dispose();
  }
}
