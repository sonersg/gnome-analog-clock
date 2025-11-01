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

export default class ExampleExtension extends Extension {
  enable() {
    const monitorWidth = Main.layoutManager.primaryMonitor.width;
    const monitorHeight = Main.layoutManager.primaryMonitor.height;
    const clockSize = 222;
    const margin = 99; // 100px, adjust as needed

    const positions = [
      { x: margin, y: margin }, // Top-left
      { x: (monitorWidth - clockSize) / 2, y: margin }, // Top-center
      { x: monitorWidth - clockSize - margin, y: margin }, // Top-right
      // Center positions
      { x: margin, y: (monitorHeight - clockSize) / 2 }, // Center-left
      { x: (monitorWidth - clockSize) / 2, y: (monitorHeight - clockSize) / 2 }, // Center
      {
        x: monitorWidth - clockSize - margin,
        y: (monitorHeight - clockSize) / 2,
      }, // Center-right
      // Bottom positions
      { x: margin, y: monitorHeight - clockSize - margin }, // Bottom-left
      {
        x: (monitorWidth - clockSize) / 2,
        y: monitorHeight - clockSize - margin,
      }, // Bottom-center
      {
        x: monitorWidth - clockSize - margin,
        y: monitorHeight - clockSize - margin,
      }, // Bottom-right
    ];

    this._desktopIcon = new St.DrawingArea({
      x: positions[2].x,
      y: positions[2].y,
      width: clockSize,
      height: clockSize,
      reactive: false,
    });

    this._desktopIcon.connect('repaint', this._onRepaint.bind(this));

    Main.layoutManager._backgroundGroup.add_child(this._desktopIcon);

    // Schedule repaint every 1000 ms (1 second)
    this._updateTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
      this._desktopIcon.queue_repaint();
      return GLib.SOURCE_CONTINUE; // keep the timeout running
    });

    // this._desktopIcon.connect('repaint', area => {
    //   const cr = area.get_context();
    //   const [width, height] = area.get_surface_size();
    //   const centerX = width / 2;
    //   const centerY = height / 2;
    //   const radius = Math.min(width, height) / 2 - 10; // leave some margin
    //   const tickLength = 22; // length of each tick mark
    //   const lineWidth = 9;

    //   cr.setLineWidth(lineWidth);
    //   // Optional: set color (white in this example)
    //   cr.setSourceRGBA(1, 1, 1, 1); // RGBA in 0–1 range

    //   // Angles for 12, 3, 6, 9 o’clock in radians
    //   const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    //   for (const angle of angles) {
    //     const outerX = centerX + radius * Math.cos(angle);
    //     const outerY = centerY + radius * Math.sin(angle);
    //     const innerX = centerX + (radius - tickLength) * Math.cos(angle);
    //     const innerY = centerY + (radius - tickLength) * Math.sin(angle);

    //     cr.moveTo(innerX, innerY);
    //     cr.lineTo(outerX, outerY);
    //   }

    //   cr.stroke();
    //   cr.$dispose();
    // });
  }

  _onRepaint(area) {
    const cr = area.get_context();
    const [width, height] = area.get_surface_size();
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 2 - 10; // leave some margin

    // Define styling
    const majorTickLength = 20; // longer for 12, 3, 6, 9
    const minorTickLength = 10; // shorter for other hours
    const majorLineWidth = 8; // thicker
    const minorLineWidth = 4; // thinner

    // Optional: set color (e.g., white)
    // cr.setSourceRGBA(1, 1, 1, 1);

    for (let i = 0; i < 12; i++) {
      const isMajor = i % 3 === 0; // 0, 3, 6, 9 → every 3rd hour
      const tickLength = isMajor ? majorTickLength : minorTickLength;
      const lineWidth = isMajor ? majorLineWidth : minorLineWidth;

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
    const handLineWidth = 11;

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
    cr.setLineWidth(handLineWidth);
    cr.setSourceRGBA(1, 1, 1, 1);
    cr.stroke();

    // Minute hand
    const minAngle = (minutes + seconds / 60) * (Math.PI / 30) - Math.PI / 2;
    cr.moveTo(centerX, centerY);
    cr.lineTo(
      centerX + minuteHandLength * Math.cos(minAngle),
      centerY + minuteHandLength * Math.sin(minAngle)
    );
    cr.setLineWidth(handLineWidth - 2);
    cr.setSourceRGBA(1, 1, 1, 0.8);
    cr.stroke();

    // Second hand
    const secAngle = seconds * (Math.PI / 30) - Math.PI / 2;
    cr.moveTo(centerX, centerY);
    cr.lineTo(
      centerX + secondHandLength * Math.cos(secAngle),
      centerY + secondHandLength * Math.sin(secAngle)
    );
    cr.setLineWidth(handLineWidth - 4);
    cr.setSourceRGBA(1, 0, 0, 0.8);
    cr.stroke();

    // Center dot
    // cr.arc(x, y, radius, angle1, angle2)
    cr.arc(centerX, centerY, handLineWidth - 2, 0, 2 * Math.PI);
    cr.setSourceRGBA(0, 0, 0, 1);
    cr.fill();

    cr.$dispose();
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
  }
}
