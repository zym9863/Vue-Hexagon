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

// 视觉效果相关
const ballTrail = ref<Array<{x: number, y: number, alpha: number}>>([]);
const particles = ref<Array<{x: number, y: number, vx: number, vy: number, life: number, maxLife: number}>>([]);
const backgroundOffset = ref(0);

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
 * 渲染动态背景
 */
const renderBackground = (ctx: CanvasRenderingContext2D): void => {
  // 创建径向渐变背景
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvasWidth, canvasHeight));
  
  gradient.addColorStop(0, '#34495e');
  gradient.addColorStop(0.4, '#2c3e50');
  gradient.addColorStop(1, '#1a252f');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 添加移动的背景图案
  backgroundOffset.value += 0.5;
  
  ctx.strokeStyle = 'rgba(52, 152, 219, 0.1)';
  ctx.lineWidth = 1;
  
  // 绘制移动的网格线
  for (let i = 0; i < canvasWidth; i += 40) {
    const x = i + (backgroundOffset.value % 40);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
  
  for (let i = 0; i < canvasHeight; i += 40) {
    const y = i + (backgroundOffset.value % 40);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
};

/**
 * 渲染粒子效果
 */
const renderParticles = (ctx: CanvasRenderingContext2D): void => {
  // 更新粒子
  particles.value = particles.value.filter(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 1;
    
    // 渲染粒子
    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = `rgba(231, 76, 60, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
    ctx.fill();
    
    return particle.life > 0;
  });
};

/**
 * 添加粒子效果
 */
const addParticles = (x: number, y: number, count: number = 5): void => {
  for (let i = 0; i < count; i++) {
    particles.value.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      maxLife: 30
    });
  }
};

/**
 * 更新小球轨迹
 */
const updateBallTrail = (x: number, y: number): void => {
  ballTrail.value.unshift({ x, y, alpha: 1 });
  
  // 更新轨迹透明度
  ballTrail.value = ballTrail.value.map((point, index) => ({
    ...point,
    alpha: Math.max(0, 1 - index / 15)
  })).filter(point => point.alpha > 0).slice(0, 15);
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
  
  // 渲染动态背景
  renderBackground(ctx);
  
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
  
  // 渲染粒子效果
  renderParticles(ctx);
};

/**
 * 渲染小球
 */
const renderBall = (ctx: CanvasRenderingContext2D, ball: Matter.Body): void => {
  const { x, y } = ball.position;
  const radius = props.config.ballRadius;
  
  // 更新轨迹
  updateBallTrail(x, y);
  
  // 渲染轨迹
  ballTrail.value.forEach((point, index) => {
    if (index < ballTrail.value.length - 1) {
      const nextPoint = ballTrail.value[index + 1];
      ctx.strokeStyle = `rgba(231, 76, 60, ${point.alpha * 0.3})`;
      ctx.lineWidth = radius * 2 * point.alpha;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.stroke();
    }
  });
  
  // 检测碰撞并添加粒子效果
  const velocity = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
  if (velocity > 5) {
    addParticles(x, y, Math.floor(velocity / 5));
  }
  
  // 球体外发光效果
  ctx.shadowColor = '#e74c3c';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // 球体渐变
  const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(0.4, '#e74c3c');
  gradient.addColorStop(0.8, '#c0392b');
  gradient.addColorStop(1, '#a93226');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // 球体高光
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(x - radius/3, y - radius/3, radius/3, 0, Math.PI * 2);
  ctx.fill();
  
  // 添加内部高光点
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(x - radius/2, y - radius/2, radius/6, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * 渲染墙壁
 */
const renderWall = (ctx: CanvasRenderingContext2D, wall: Matter.Body): void => {
  const vertices = wall.vertices;
  
  // 墙壁渐变填充
  const gradient = ctx.createLinearGradient(
    vertices[0].x, vertices[0].y,
    vertices[2].x, vertices[2].y
  );
  gradient.addColorStop(0, '#34495e');
  gradient.addColorStop(0.5, '#2c3e50');
  gradient.addColorStop(1, '#1a252f');
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 2;
  
  // 绘制墙壁
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // 添加内部发光效果
  ctx.shadowColor = '#3498db';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.stroke();
  
  // 重置阴影
  ctx.shadowColor = 'transparent';
};

/**
 * 渲染六边形轮廓
 */
const renderHexagonOutline = (ctx: CanvasRenderingContext2D): void => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const size = props.config.hexagonSize;
  
  // 外层发光轮廓
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#3498db';
  ctx.shadowBlur = 15;
  ctx.setLineDash([]);
  
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
  
  // 内层虚线轮廓
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(52, 152, 219, 0.6)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = centerX + (size - 10) * Math.cos(angle);
    const y = centerY + (size - 10) * Math.sin(angle);
    
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
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.game-canvas {
  border: 3px solid #3498db;
  border-radius: 15px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(52, 152, 219, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
  position: relative;
}

.game-canvas::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, #3498db, #2980b9, #3498db);
  border-radius: 15px;
  z-index: -1;
  animation: borderGlow 3s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% { 
    opacity: 0.6;
    box-shadow: 0 0 20px rgba(52, 152, 219, 0.3);
  }
  50% { 
    opacity: 1;
    box-shadow: 0 0 30px rgba(52, 152, 219, 0.6);
  }
}

.game-canvas:hover {
  transform: scale(1.02);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(52, 152, 219, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
</style>
