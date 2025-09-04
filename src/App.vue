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
}

.app-header {
  text-align: center;
  padding: 30px 20px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.app-title {
  font-size: 2.5em;
  margin-bottom: 15px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-description {
  font-size: 1.1em;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.app-main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  padding: 30px 20px;
  flex-wrap: wrap;
}

.game-container {
  flex-shrink: 0;
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
}
</style>
