<script setup lang="ts">
import { ref } from 'vue';
import HexagonGame from './components/HexagonGame.vue';
import ControlPanel from './components/ControlPanel.vue';
import PhysicsStatus from './components/PhysicsStatus.vue';
import { type PhysicsConfig, type PhysicsState } from './utils/PhysicsEngine';

/**
 * 默认物理配置
 */
const defaultConfig: PhysicsConfig = {
  gravity: 0.8,
  friction: 0.1,
  restitution: 0.8,
  hexagonRotationSpeed: 0.01,
  ballRadius: 15,
  hexagonSize: 180
};

// 响应式状态
const physicsConfig = ref<PhysicsConfig>({ ...defaultConfig });
const physicsState = ref<PhysicsState>({
  ballPosition: { x: 400, y: 300 },
  ballVelocity: { x: 0, y: 0 },
  hexagonAngle: 0,
  ballSpeed: 0,
  kineticEnergy: 0
});

// 游戏组件引用
const gameRef = ref<InstanceType<typeof HexagonGame>>();

/**
 * 处理物理状态更新
 */
const handlePhysicsUpdate = (state: PhysicsState): void => {
  physicsState.value = state;
};

/**
 * 重置游戏
 */
const resetGame = (): void => {
  if (gameRef.value) {
    gameRef.value.resetGame();
  }
};
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">六边形物理模拟游戏</h1>
      <p class="app-description">
        一个基于Vue.js和Matter.js的实时物理模拟游戏，体验重力、摩擦力和碰撞的真实物理效果
      </p>
    </header>

    <main class="app-main">
      <div class="game-container">
        <HexagonGame
          ref="gameRef"
          :config="physicsConfig"
          @physics-update="handlePhysicsUpdate"
        />
      </div>

      <div class="control-container">
        <ControlPanel
          v-model:config="physicsConfig"
          @reset="resetGame"
        />

        <PhysicsStatus
          :state="physicsState"
        />
      </div>
    </main>

    <footer class="app-footer">
      <p>使用 Vue.js 3 + TypeScript + Matter.js 构建</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
  pointer-events: none;
  animation: backgroundShift 20s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% { 
    background-position: 0% 50%, 100% 50%, 0% 0%;
    opacity: 1;
  }
  50% { 
    background-position: 100% 50%, 0% 50%, 100% 100%;
    opacity: 0.8;
  }
}

.app-header {
  text-align: center;
  padding: 30px 20px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.8s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-title {
  font-size: 2.5em;
  margin-bottom: 15px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #e3f2fd, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
  position: relative;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.app-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #3498db, transparent);
  border-radius: 2px;
  animation: titleUnderline 2s ease-in-out infinite;
}

@keyframes titleUnderline {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
  50% { opacity: 1; transform: translateX(-50%) scaleX(1.2); }
}

.app-description {
  font-size: 1.1em;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  animation: fadeIn 0.8s ease-out 0.3s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.app-main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  padding: 30px 20px;
  flex-wrap: wrap;
  animation: slideUp 0.8s ease-out 0.2s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.game-container {
  flex-shrink: 0;
  animation: scaleIn 0.6s ease-out 0.4s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.control-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 320px;
}

.app-footer {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  font-size: 0.9em;
  opacity: 0.8;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.8s ease-out 0.8s both;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .app-main {
    flex-direction: column;
    align-items: center;
  }

  .control-container {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .app-title {
    font-size: 2em;
  }

  .app-description {
    font-size: 1em;
  }

  .control-container {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }

  .app-main {
    padding: 20px 10px;
    gap: 20px;
  }

  .app-header {
    padding: 20px 15px;
  }
}
</style>
