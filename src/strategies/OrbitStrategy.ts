import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { Tower, Monster } from '../types';
import Phaser from 'phaser';

export class OrbitStrategy extends AttackStrategy {
    update(tower: Tower, time: number) {
        const origin = this.towerSystem.getVisualCenter(tower);
        
        if (!tower.orbitVisuals || tower.orbitVisuals.some((p: any) => !p.active)) {
             if (tower.orbitVisuals) {
                tower.orbitVisuals.forEach((p: any) => { if (p.active) p.destroy(); });
            }
            tower.orbitVisuals = [];
            const count = tower.stats.orbitCount || 3;
            const color = RenderUtils.getProjectileColor(tower);
            
            for (let i = 0; i < count; i++) {
                const proj = this.scene.add.circle(0, 0, 5, color, 1);
                proj.setStrokeStyle(1, 0xffffff);
                proj.setDepth(26);
                tower.orbitVisuals.push(proj);
            }
            tower.orbitAngle = tower.orbitAngle || 0;
        }

        if (!tower.el || !tower.el.active) {
            this.cleanup(tower);
            return;
        }

        const speed = (tower.stats.orbitSpeed || 0.05) * this.scene.time.timeScale;
        const radius = tower.stats.orbitRadius || 80;
        tower.orbitAngle += speed;
        
        const count = tower.orbitVisuals.length;
        const step = (Math.PI * 2) / count;

        tower.orbitVisuals.forEach((proj: any, index: number) => {
            const angle = tower.orbitAngle + (index * step);
            proj.x = origin.x + Math.cos(angle) * radius;
            proj.y = origin.y + Math.sin(angle) * radius;
            
            this.checkCollision(tower, proj, time);
        });
    }

    checkCollision(tower: Tower, proj: any, time: number) {
        // Cast to access monsters
        const scene = this.scene as any;
        if (!scene.monsters) return;
        const hitRadius = 25;
        const cooldown = tower.stats.hitCooldown || 300;
        
        scene.monsters.getChildren().forEach((m: Monster) => {
            if (!m.active) return;
            if (Math.abs(m.x - proj.x) > hitRadius || Math.abs(m.y - proj.y) > hitRadius) return;
            
            const dist = Phaser.Math.Distance.Between(proj.x, proj.y, m.x, m.y);
            if (dist <= hitRadius) {
                if (!m.lastOrbitHit) m.lastOrbitHit = {};
                const lastHit = m.lastOrbitHit[tower.id || 'orbit'] || 0;
                
                if (time - lastHit > cooldown) {
                    m.lastOrbitHit[tower.id || 'orbit'] = time;
                    
                    const hit = this.towerSystem.calculateDamage(tower);
                    this.towerSystem.applyDamage(m, hit.dmg, !!hit.crit, tower);
                    RenderUtils.showHitEffect(this.scene, m.x, m.y, RenderUtils.getProjectileColor(tower));
                    
                    this.scene.tweens.add({
                        targets: proj,
                        scaleX: 1.5,
                        scaleY: 1.5,
                        duration: 50,
                        yoyo: true
                    });
                }
            }
        });
    }

    cleanup(tower: Tower) {
        if (tower.orbitVisuals) {
            tower.orbitVisuals.forEach((p: any) => {
                if (p.active) p.destroy();
            });
            tower.orbitVisuals = [];
        }
    }
}
