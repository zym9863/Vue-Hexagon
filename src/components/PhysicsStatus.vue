<template>
  <div class="physics-status">
    <h3 class="status-title">物理状态监控</h3>
    
    <div class="status-grid">
      <div class="status-item">
        <div class="status-label">小球位置</div>
        <div class="status-value">
          X: {{ state.ballPosition.x.toFixed(1) }}px<br>
          Y: {{ state.ballPosition.y.toFixed(1) }}px
        </div>
      </div>

      <div class="status-item">
        <div class="status-label">小球速度</div>
        <div class="status-value">
          X: {{ state.ballVelocity.x.toFixed(2) }}<br>
          Y: {{ state.ballVelocity.y.toFixed(2) }}
        </div>
      </div>

      <div class="status-item">
        <div class="status-label">速度大小</div>
        <div class="status-value">
          {{ state.ballSpeed.toFixed(2) }} px/frame
        </div>
        <div class="status-bar">
          <div 
            class="status-bar-fill speed-bar"
            :style="{ width: Math.min(state.ballSpeed * 2, 100) + '%' }"
          ></div>
        </div>
      </div>

      <div class="status-item">
        <div class="status-label">动能</div>
        <div class="status-value">
          {{ state.kineticEnergy.toFixed(3) }} J
        </div>
        <div class="status-bar">
          <div 
            class="status-bar-fill energy-bar"
            :style="{ width: Math.min(state.kineticEnergy * 10, 100) + '%' }"
          ></div>
        </div>
      </div>

      <div class="status-item">
        <div class="status-label">六边形角度</div>
        <div class="status-value">
          {{ (state.hexagonAngle * 180 / Math.PI).toFixed(1) }}°
        </div>
        <div class="angle-indicator">
          <div 
            class="angle-pointer"
            :style="{ transform: `rotate(${state.hexagonAngle}rad)` }"
          ></div>
        </div>
      </div>

      <div class="status-item">
        <div class="status-label">运动状态</div>
        <div class="status-value">
          <span :class="getMotionStateClass()">
            {{ getMotionState() }}
          </span>
        </div>
      </div>
    </div>

    <div class="performance-section">
      <h4 class="performance-title">性能监控</h4>
      <div class="performance-grid">
        <div class="performance-item">
          <div class="performance-label">FPS</div>
          <div class="performance-value">{{ fps.toFixed(0) }}</div>
        </div>
        <div class="performance-item">
          <div class="performance-label">帧时间</div>
          <div class="performance-value">{{ frameTime.toFixed(1) }}ms</div>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h4 class="history-title">速度历史</h4>
      <canvas 
        ref="chartCanvas"
        width="280"
        height="100"
        class="speed-chart"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { type PhysicsState } from '../utils/PhysicsEngine';

/**
 * 组件属性接口
 */
interface Props {
  state: PhysicsState;
}

const props = defineProps<Props>();

// 性能监控
const fps = ref(60);
const frameTime = ref(16.67);
const lastFrameTime = ref(performance.now());
const frameCount = ref(0);

// 速度历史记录
const speedHistory = ref<number[]>([]);
const maxHistoryLength = 100;

// 图表画布引用
const chartCanvas = ref<HTMLCanvasElement>();

/**
 * 获取运动状态
 */
const getMotionState = (): string => {
  const speed = props.state.ballSpeed;
  if (speed < 0.1) return '静止';
  if (speed < 2) return '缓慢移动';
  if (speed < 5) return '正常移动';
  if (speed < 10) return '快速移动';
  return '高速移动';
};

/**
 * 获取运动状态样式类
 */
const getMotionStateClass = (): string => {
  const speed = props.state.ballSpeed;
  if (speed < 0.1) return 'motion-static';
  if (speed < 2) return 'motion-slow';
  if (speed < 5) return 'motion-normal';
  if (speed < 10) return 'motion-fast';
  return 'motion-very-fast';
};

/**
 * 更新性能统计
 */
const updatePerformanceStats = (): void => {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastFrameTime.value;
  
  frameTime.value = deltaTime;
  frameCount.value++;
  
  // 每秒更新一次FPS
  if (frameCount.value >= 60) {
    fps.value = 1000 / deltaTime;
    frameCount.value = 0;
  }
  
  lastFrameTime.value = currentTime;
};

/**
 * 更新速度历史记录
 */
const updateSpeedHistory = (): void => {
  speedHistory.value.push(props.state.ballSpeed);
  
  // 保持历史记录长度
  if (speedHistory.value.length > maxHistoryLength) {
    speedHistory.value.shift();
  }
  
  // 绘制速度图表
  drawSpeedChart();
};

/**
 * 绘制速度图表
 */
const drawSpeedChart = (): void => {
  if (!chartCanvas.value) return;
  
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;
  
  const width = chartCanvas.value.width;
  const height = chartCanvas.value.height;
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  // 背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, 0, width, height);
  
  if (speedHistory.value.length < 2) return;
  
  // 找到最大速度用于缩放
  const maxSpeed = Math.max(...speedHistory.value, 10);
  
  // 绘制网格线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  
  // 水平网格线
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // 垂直网格线
  for (let i = 0; i <= 10; i++) {
    const x = (width / 10) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // 绘制速度曲线
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  speedHistory.value.forEach((speed, index) => {
    const x = (index / (maxHistoryLength - 1)) * width;
    const y = height - (speed / maxSpeed) * height;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // 绘制当前速度点
  if (speedHistory.value.length > 0) {
    const lastSpeed = speedHistory.value[speedHistory.value.length - 1];
    const x = width;
    const y = height - (lastSpeed / maxSpeed) * height;
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x - 5, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
};

/**
 * 监听状态变化
 */
watch(() => props.state, () => {
  updatePerformanceStats();
  updateSpeedHistory();
}, { deep: true });

/**
 * 组件挂载时初始化图表
 */
onMounted(() => {
  nextTick(() => {
    drawSpeedChart();
  });
});
</script>

<style scoped>
.physics-status {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  min-width: 320px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.4em;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.status-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-label {
  font-size: 0.9em;
  opacity: 0.8;
  margin-bottom: 8px;
  font-weight: 600;
}

.status-value {
  font-size: 1.1em;
  font-weight: bold;
  line-height: 1.3;
}

.status-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.speed-bar {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

.energy-bar {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.angle-indicator {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  margin: 8px auto 0;
  position: relative;
}

.angle-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 15px;
  background: #3498db;
  transform-origin: bottom center;
  margin-left: -1px;
  margin-top: -15px;
  border-radius: 1px;
}

.motion-static { color: #95a5a6; }
.motion-slow { color: #3498db; }
.motion-normal { color: #2ecc71; }
.motion-fast { color: #f39c12; }
.motion-very-fast { color: #e74c3c; }

.performance-section {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 20px;
  margin-bottom: 25px;
}

.performance-title {
  margin-bottom: 15px;
  font-size: 1.1em;
  font-weight: 600;
}

.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.performance-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.performance-label {
  font-size: 0.9em;
  opacity: 0.8;
  margin-bottom: 5px;
}

.performance-value {
  font-size: 1.3em;
  font-weight: bold;
  color: #3498db;
}

.history-section {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 20px;
}

.history-title {
  margin-bottom: 15px;
  font-size: 1.1em;
  font-weight: 600;
}

.speed-chart {
  width: 100%;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}
</style>
