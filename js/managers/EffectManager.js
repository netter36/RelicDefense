import { UI_CONFIG, COMBAT_CONFIG } from '../constants.js';
import { RenderUtils } from '../utils/RenderUtils.js';

export class EffectManager {
    constructor(scene) {
        this.scene = scene;
    }

    showDamageText(x, y, damage, isCrit) {
        const val = Math.round(damage);
        if (val <= 0) return;

        const style = isCrit
            ? { fontSize: '20px', color: '#dc2626', fontStyle: 'bold', stroke: '#fff', strokeThickness: 3 }
            : { fontSize: '14px', color: '#ffffff', stroke: '#000', strokeThickness: 2 };

        const textStr = isCrit ? `! ${val} !` : `${val}`;
        const txt = this.scene.add.text(x, y - 20, textStr, style).setOrigin(0.5);
        txt.setDepth(100);

        this.scene.tweens.add({
            targets: txt,
            y: y - 50 - Math.random() * 20,
            x: x + (Math.random() * 30 - 15),
            alpha: 0,
            scaleX: isCrit ? 1.2 : 1.0,
            scaleY: isCrit ? 1.2 : 1.0,
            duration: isCrit ? UI_CONFIG.CRIT_TEXT_DURATION : UI_CONFIG.DAMAGE_TEXT_DURATION,
            ease: 'Back.out',
            onComplete: () => txt.destroy()
        });
    }

    showGoldText(x, y, amount) {
        const txt = this.scene.add.text(x, y - 20, `+${amount}G`, {
            fontSize: '16px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);

        this.scene.tweens.add({
            targets: txt,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Back.out',
            onComplete: () => txt.destroy()
        });
    }

    createExplosion(x, y, radius, color = 0xffaa00) {
        // Visuals only - damage logic is handled by TowerSystem/EnemySystem
        const graphics = this.scene.add.graphics();
        graphics.setDepth(100);
        graphics.fillStyle(color, 0.6);
        graphics.fillCircle(0, 0, radius);
        graphics.setPosition(x, y);
        graphics.setScale(0);

        this.scene.tweens.add({
            targets: graphics,
            scaleX: 1,
            scaleY: 1,
            alpha: 0,
            duration: 300,
            onComplete: () => graphics.destroy()
        });
    }

    drawLightning(x1, y1, x2, y2, color) {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(30);
        graphics.lineStyle(2, color || 0x6366f1, 1);
        
        const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        const steps = Math.max(2, Math.floor(dist / 15));
        const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
        
        graphics.beginPath();
        graphics.moveTo(x1, y1);
        
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const basePos = {
                x: x1 + (x2 - x1) * t,
                y: y1 + (y2 - y1) * t
            };
            
            const offset = (Math.random() - 0.5) * 30;
            const perpAngle = angle + Math.PI / 2;
            
            const cx = basePos.x + Math.cos(perpAngle) * offset;
            const cy = basePos.y + Math.sin(perpAngle) * offset;
            
            graphics.lineTo(cx, cy);
        }
        graphics.lineTo(x2, y2);
        graphics.strokePath();
        
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 150,
            onComplete: () => graphics.destroy()
        });
    }

    drawLaser(startX, startY, endX, endY, color, width = 4, alpha = 1) {
        const laser = this.scene.add.graphics();
        laser.setDepth(25);
        laser.lineStyle(width, color, alpha);
        laser.lineBetween(startX, startY, endX, endY);

        this.scene.time.delayedCall(80, () => laser.destroy());
    }

    drawNova(x, y, radius, color = 0x3b82f6) {
        const ring = this.scene.add.circle(x, y, 10, color, 0.3);
        ring.setDepth(25);
        this.scene.tweens.add({
            targets: ring,
            radius: radius,
            alpha: 0,
            duration: 400,
            onComplete: () => ring.destroy()
        });
    }

    drawBeam(startX, startY, range, angle, coneAngle, color) {
        const cone = this.scene.add.graphics();
        cone.setDepth(24);
        cone.fillStyle(color, 0.3);
        
        cone.beginPath();
        cone.moveTo(startX, startY);
        cone.arc(startX, startY, range, angle - coneAngle/2, angle + coneAngle/2);
        cone.closePath();
        cone.fillPath();
        
        this.scene.tweens.add({
            targets: cone,
            alpha: 0,
            duration: 150,
            onComplete: () => cone.destroy()
        });
    }
}
