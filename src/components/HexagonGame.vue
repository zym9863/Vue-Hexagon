<template>
  <div class="hexagon-game">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      class="game-canvas"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { PhysicsEngine, type PhysicsConfig, type PhysicsState } from '../utils/PhysicsEngine';

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
  (e: 'physicsUpdate', state: PhysicsState): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 画布相关
const canvasRef = ref<HTMLCanvasElement>();
const canvasWidth = 800;
const canvasHeight = 600;

// 物理引擎
let physicsEngine: PhysicsEngine | null = null;
let animationId: number | null = null;

/**
 * 初始化游戏
 */
const initGame = (): void => {
  if (!canvasRef.value) return;

  // 创建物理引擎
  physicsEngine = new PhysicsEngine(canvasWidth, canvasHeight, props.config);
  
  // 开始游戏循环
  startGameLoop();
};

/**
 * 开始游戏循环
 */
const startGameLoop = (): void => {
  const gameLoop = (): void => {
    if (!physicsEngine || !canvasRef.value) return;
    
    // 更新物理引擎
    physicsEngine.update();
    
    // 渲染游戏
    render();
    
    // 发送物理状态更新事件
    const physicsState = physicsEngine.getPhysicsState();
    emit('physicsUpdate', physicsState);
    
    // 继续下一帧
    animationId = requestAnimationFrame(gameLoop);
  };
  
  gameLoop();
};

/**
 * 渲染游戏画面
 */
const render = (): void => {
  if (!canvasRef.value || !physicsEngine) return;
  
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // 设置画布样式
  ctx.fillStyle = '#34495e';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 获取所有物理体
  const bodies = physicsEngine.getAllBodies();
  
  bodies.forEach((body, index) => {
    ctx.save();
    
    if (index === 0) {
      // 渲染小球（第一个body是小球）
      renderBall(ctx, body);
    } else {
      // 渲染六边形墙壁
      renderWall(ctx, body);
    }
    
    ctx.restore();
  });
  
  // 渲染六边形轮廓
  renderHexagonOutline(ctx);
};

/**
 * 渲染小球
 */
const renderBall = (ctx: CanvasRenderingContext2D, ball: Matter.Body): void => {
  const { x, y } = ball.position;
  const radius = props.config.ballRadius;
  
  // 球体阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  // 球体渐变
  const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(0.7, '#e74c3c');
  gradient.addColorStop(1, '#c0392b');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // 球体高光
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(x - radius/3, y - radius/3, radius/3, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * 渲染墙壁
 */
const renderWall = (ctx: CanvasRenderingContext2D, wall: Matter.Body): void => {
  const vertices = wall.vertices;
  
  ctx.fillStyle = '#2c3e50';
  ctx.strokeStyle = '#34495e';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

/**
 * 渲染六边形轮廓
 */
const renderHexagonOutline = (ctx: CanvasRenderingContext2D): void => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const size = props.config.hexagonSize;
  
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
};

/**
 * 重置游戏
 */
const resetGame = (): void => {
  if (physicsEngine) {
    physicsEngine.reset();
  }
};

/**
 * 监听配置变化
 */
watch(() => props.config, (newConfig) => {
  if (physicsEngine) {
    physicsEngine.updateConfig(newConfig);
  }
}, { deep: true });

/**
 * 组件挂载时初始化游戏
 */
onMounted(() => {
  initGame();
});

/**
 * 组件卸载时清理资源
 */
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (physicsEngine) {
    physicsEngine.destroy();
  }
});

// 暴露重置方法给父组件
defineExpose({
  resetGame
});
</script>

<style scoped>
.hexagon-game {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.game-canvas {
  border: 2px solid #3498db;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
