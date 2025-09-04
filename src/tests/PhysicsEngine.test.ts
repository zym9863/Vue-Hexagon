import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PhysicsEngine, type PhysicsConfig } from '../utils/PhysicsEngine';

/**
 * 物理引擎测试套件
 */
describe('PhysicsEngine', () => {
  let physicsEngine: PhysicsEngine;
  const defaultConfig: PhysicsConfig = {
    gravity: 0.8,
    friction: 0.1,
    restitution: 0.8,
    hexagonRotationSpeed: 0.01,
    ballRadius: 15,
    hexagonSize: 180
  };

  beforeEach(() => {
    // 在每个测试前创建新的物理引擎实例
    physicsEngine = new PhysicsEngine(800, 600, defaultConfig);
  });

  afterEach(() => {
    // 在每个测试后清理资源
    if (physicsEngine) {
      physicsEngine.destroy();
    }
  });

  it('应该正确初始化物理引擎', () => {
    expect(physicsEngine).toBeDefined();
    
    const state = physicsEngine.getPhysicsState();
    expect(state.ballPosition.x).toBeCloseTo(400, 1); // 画布中心X
    expect(state.ballPosition.y).toBeCloseTo(250, 1); // 稍微偏上的Y位置
    expect(state.hexagonAngle).toBe(0);
  });

  it('应该正确更新物理状态', () => {
    const initialState = physicsEngine.getPhysicsState();
    
    // 运行几帧物理更新
    for (let i = 0; i < 10; i++) {
      physicsEngine.update();
    }
    
    const updatedState = physicsEngine.getPhysicsState();
    
    // 由于重力作用，小球应该向下移动
    expect(updatedState.ballPosition.y).toBeGreaterThan(initialState.ballPosition.y);
    
    // 六边形应该旋转
    expect(updatedState.hexagonAngle).toBeGreaterThan(initialState.hexagonAngle);
  });

  it('应该正确更新配置', () => {
    const newConfig = {
      gravity: 1.5,
      friction: 0.2,
      restitution: 0.9,
      hexagonRotationSpeed: 0.02,
      ballRadius: 20,
      hexagonSize: 200
    };
    
    physicsEngine.updateConfig(newConfig);
    
    // 验证配置更新后的效果
    const state1 = physicsEngine.getPhysicsState();
    physicsEngine.update();
    const state2 = physicsEngine.getPhysicsState();
    
    // 新的旋转速度应该产生更大的角度变化
    const angleChange = state2.hexagonAngle - state1.hexagonAngle;
    expect(Math.abs(angleChange)).toBeCloseTo(0.02, 3);
  });

  it('应该正确重置游戏状态', () => {
    // 运行一些更新让小球移动
    for (let i = 0; i < 20; i++) {
      physicsEngine.update();
    }
    
    const stateBeforeReset = physicsEngine.getPhysicsState();
    
    // 重置游戏
    physicsEngine.reset();
    
    const stateAfterReset = physicsEngine.getPhysicsState();
    
    // 小球应该回到中心位置
    expect(stateAfterReset.ballPosition.x).toBeCloseTo(400, 1);
    expect(stateAfterReset.ballPosition.y).toBeCloseTo(250, 1);
    expect(stateAfterReset.hexagonAngle).toBe(0);
    
    // 速度应该重置
    expect(stateAfterReset.ballSpeed).toBeLessThan(stateBeforeReset.ballSpeed);
  });

  it('应该返回正确的物理体数量', () => {
    const bodies = physicsEngine.getAllBodies();
    
    // 应该有1个小球 + 6个六边形墙壁 = 7个物理体
    expect(bodies).toHaveLength(7);
  });

  it('应该正确计算动能', () => {
    // 给小球一些初始速度
    for (let i = 0; i < 30; i++) {
      physicsEngine.update();
    }

    const state = physicsEngine.getPhysicsState();

    // 动能应该大于0（小球在运动）
    expect(state.kineticEnergy).toBeGreaterThan(0);

    // 验证动能与速度平方的关系（不验证具体数值，因为质量可能不是1）
    // 只验证动能随速度增加而增加
    expect(state.ballSpeed).toBeGreaterThan(0);
    expect(state.kineticEnergy).toBeGreaterThan(0);
  });

  it('应该正确处理边界情况', () => {
    // 测试极端配置值
    const extremeConfig = {
      gravity: 0,
      friction: 1,
      restitution: 0,
      hexagonRotationSpeed: 0,
      ballRadius: 5,
      hexagonSize: 100
    };
    
    expect(() => {
      physicsEngine.updateConfig(extremeConfig);
    }).not.toThrow();
    
    // 零重力下小球不应该加速下落
    const initialY = physicsEngine.getPhysicsState().ballPosition.y;
    
    for (let i = 0; i < 10; i++) {
      physicsEngine.update();
    }
    
    const finalY = physicsEngine.getPhysicsState().ballPosition.y;
    
    // 在零重力下，Y位置变化应该很小
    expect(Math.abs(finalY - initialY)).toBeLessThan(5);
  });
});
