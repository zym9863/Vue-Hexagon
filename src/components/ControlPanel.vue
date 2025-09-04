<template>
  <div class="control-panel">
    <h3 class="panel-title">物理参数控制</h3>
    
    <div class="control-group">
      <label class="control-label">
        重力加速度: {{ config.gravity.toFixed(3) }}
      </label>
      <input
        type="range"
        :value="config.gravity"
        min="0"
        max="2"
        step="0.01"
        class="control-slider"
        @input="updateGravity"
      />
      <div class="control-info">控制小球下落速度</div>
    </div>

    <div class="control-group">
      <label class="control-label">
        摩擦系数: {{ config.friction.toFixed(3) }}
      </label>
      <input
        type="range"
        :value="config.friction"
        min="0"
        max="1"
        step="0.01"
        class="control-slider"
        @input="updateFriction"
      />
      <div class="control-info">控制表面摩擦力</div>
    </div>

    <div class="control-group">
      <label class="control-label">
        弹性系数: {{ config.restitution.toFixed(3) }}
      </label>
      <input
        type="range"
        :value="config.restitution"
        min="0"
        max="1"
        step="0.01"
        class="control-slider"
        @input="updateRestitution"
      />
      <div class="control-info">控制碰撞反弹强度</div>
    </div>

    <div class="control-group">
      <label class="control-label">
        旋转速度: {{ (config.hexagonRotationSpeed * 1000).toFixed(1) }}°/s
      </label>
      <input
        type="range"
        :value="config.hexagonRotationSpeed"
        min="-0.05"
        max="0.05"
        step="0.001"
        class="control-slider"
        @input="updateRotationSpeed"
      />
      <div class="control-info">控制六边形旋转速度</div>
    </div>

    <div class="control-group">
      <label class="control-label">
        小球半径: {{ config.ballRadius.toFixed(0) }}px
      </label>
      <input
        type="range"
        :value="config.ballRadius"
        min="5"
        max="30"
        step="1"
        class="control-slider"
        @input="updateBallRadius"
      />
      <div class="control-info">控制小球大小</div>
    </div>

    <div class="control-group">
      <label class="control-label">
        容器大小: {{ config.hexagonSize.toFixed(0) }}px
      </label>
      <input
        type="range"
        :value="config.hexagonSize"
        min="100"
        max="250"
        step="5"
        class="control-slider"
        @input="updateHexagonSize"
      />
      <div class="control-info">控制六边形容器大小</div>
    </div>

    <div class="control-actions">
      <button class="reset-button" @click="resetToDefaults">
        恢复默认设置
      </button>
      <button class="reset-button" @click="$emit('reset')">
        重置游戏
      </button>
    </div>

    <div class="preset-section">
      <h4 class="preset-title">预设配置</h4>
      <div class="preset-buttons">
        <button 
          class="preset-button"
          @click="applyPreset('normal')"
        >
          标准模式
        </button>
        <button 
          class="preset-button"
          @click="applyPreset('lowGravity')"
        >
          低重力
        </button>
        <button 
          class="preset-button"
          @click="applyPreset('bouncy')"
        >
          超级弹性
        </button>
        <button 
          class="preset-button"
          @click="applyPreset('fastSpin')"
        >
          快速旋转
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PhysicsConfig } from '../utils/PhysicsEngine';

/**
 * 组件属性接口
 */
interface Props {
  config: PhysicsConfig;
}

/**
 * 组件事件接口
 */
interface Emits {
  (e: 'update:config', config: PhysicsConfig): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * 预设配置
 */
const presets = {
  normal: {
    gravity: 0.8,
    friction: 0.1,
    restitution: 0.8,
    hexagonRotationSpeed: 0.01,
    ballRadius: 15,
    hexagonSize: 180
  },
  lowGravity: {
    gravity: 0.3,
    friction: 0.05,
    restitution: 0.9,
    hexagonRotationSpeed: 0.005,
    ballRadius: 15,
    hexagonSize: 180
  },
  bouncy: {
    gravity: 0.8,
    friction: 0.01,
    restitution: 0.95,
    hexagonRotationSpeed: 0.01,
    ballRadius: 12,
    hexagonSize: 180
  },
  fastSpin: {
    gravity: 0.8,
    friction: 0.1,
    restitution: 0.8,
    hexagonRotationSpeed: 0.03,
    ballRadius: 15,
    hexagonSize: 180
  }
};

/**
 * 更新配置的通用方法
 */
const updateConfig = (key: keyof PhysicsConfig, value: number): void => {
  const newConfig = { ...props.config, [key]: value };
  emit('update:config', newConfig);
};

/**
 * 更新重力
 */
const updateGravity = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  updateConfig('gravity', parseFloat(target.value));
};

/**
 * 更新摩擦系数
 */
const updateFriction = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  updateConfig('friction', parseFloat(target.value));
};

/**
 * 更新弹性系数
 */
const updateRestitution = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  updateConfig('restitution', parseFloat(target.value));
};

/**
 * 更新旋转速度
 */
const updateRotationSpeed = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  updateConfig('hexagonRotationSpeed', parseFloat(target.value));
};

/**
 * 更新小球半径
 */
const updateBallRadius = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  updateConfig('ballRadius', parseFloat(target.value));
};

/**
 * 更新六边形大小
 */
const updateHexagonSize = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  updateConfig('hexagonSize', parseFloat(target.value));
};

/**
 * 恢复默认设置
 */
const resetToDefaults = (): void => {
  emit('update:config', presets.normal);
};

/**
 * 应用预设配置
 */
const applyPreset = (presetName: keyof typeof presets): void => {
  emit('update:config', presets[presetName]);
};
</script>

<style scoped>
.control-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  min-width: 300px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.4em;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.control-group {
  margin-bottom: 20px;
}

.control-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95em;
}

.control-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  margin-bottom: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.control-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.control-info {
  font-size: 0.8em;
  opacity: 0.8;
  font-style: italic;
}

.control-actions {
  display: flex;
  gap: 10px;
  margin: 25px 0;
}

.reset-button {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preset-section {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 20px;
  margin-top: 20px;
}

.preset-title {
  margin-bottom: 15px;
  font-size: 1.1em;
  font-weight: 600;
}

.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.preset-button {
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
</style>
